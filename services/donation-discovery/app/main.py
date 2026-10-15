import asyncio
from datetime import datetime, timezone
import logging
import os
from typing import Optional
from urllib.parse import urlparse
from xml.etree import ElementTree

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("artemis-donation-discovery")

app = FastAPI(
    title="Artemis Donation Discovery Service",
    description="Automated, verified disaster relief discovery engine for Artemis Satellite Fire Intelligence",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)

KITABISA_HOSTS = {"kitabisa.com", "www.kitabisa.com"}
RELEVANT_TERMS = (
    "wildfire",
    "forest fire",
    "kebakaran hutan",
    "kebakaran lahan",
    "karhutla",
    "asap",
)

# In-memory cache: location -> (timestamp, candidates)
CACHE_TTL_SECONDS = 900  # 15 minutes
CAMPAIGN_CACHE: dict[str, tuple[float, list["CampaignCandidate"]]] = {}


class CampaignCandidate(BaseModel):
    id: str
    title: str
    description: str
    donationUrl: HttpUrl
    regionTags: list[str]
    source: str = "automated-discovery"
    confidence: int
    validatedAt: str


class BingResult(BaseModel):
    name: str
    url: HttpUrl
    snippet: str = ""


def is_kitabisa_campaign(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.hostname.lower() if parsed.hostname else ""
    path = parsed.path.strip("/")
    return parsed.scheme == "https" and host in KITABISA_HOSTS and bool(path)


def score_result(result: BingResult, location: str) -> int:
    text = f"{result.name} {result.snippet}".lower()
    score = 30 if is_kitabisa_campaign(str(result.url)) else 0
    if any(term in text for term in RELEVANT_TERMS):
        score += 25
    if location.lower() in text:
        score += 25
    if any(term in text for term in ("donasi", "bantu", "galang dana", "relief")):
        score += 10
    return min(score, 100)


async def search_bing(location: str) -> list[BingResult]:
    api_key = os.environ.get("BING_SEARCH_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="BING_SEARCH_API_KEY is not configured.")

    query = f"site:kitabisa.com {location} (karhutla OR wildfire OR \"kebakaran hutan\")"
    headers = {"Ocp-Apim-Subscription-Key": api_key}
    params = {"q": query, "count": "10", "responseFilter": "Webpages", "safeSearch": "Strict"}
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        response = await client.get("https://api.bing.microsoft.com/v7.0/search", params=params, headers=headers)
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Bing Search request failed ({response.status_code}).")
    payload = response.json()
    values = payload.get("webPages", {}).get("value", [])
    return [
        BingResult(name=item["name"], url=item["url"], snippet=item.get("snippet", ""))
        for item in values
        if isinstance(item.get("name"), str)
        and isinstance(item.get("url"), str)
        and is_kitabisa_campaign(item["url"])
    ]


async def search_google_news_rss(location: str) -> list[BingResult]:
    query = f"site:kitabisa.com {location} (karhutla OR wildfire OR \"kebakaran hutan\")"
    params = {"q": query, "hl": "id", "gl": "ID", "ceid": "ID:id"}
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        response = await client.get("https://news.google.com/rss/search", params=params)
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Google News RSS request failed ({response.status_code}).")
    try:
        root = ElementTree.fromstring(response.content)
    except ElementTree.ParseError as error:
        raise HTTPException(status_code=502, detail="Google News RSS returned invalid XML.") from error

    items = root.findall("./channel/item")
    if not items:
        return []

    results: list[BingResult] = []

    async def resolve_link(item: ElementTree.Element, client: httpx.AsyncClient) -> Optional[BingResult]:
        title = item.findtext("title")
        link = item.findtext("link")
        description = item.findtext("description") or ""
        if not title or not link:
            return None
        try:
            redirected = await client.get(link, headers={"Accept": "text/html"})
            final_url = str(redirected.url)
            if is_kitabisa_campaign(final_url):
                return BingResult(name=title, url=final_url, snippet=description)
        except httpx.HTTPError:
            pass
        return None

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        tasks = [resolve_link(item, client) for item in items[:10]]
        resolved = await asyncio.gather(*tasks, return_exceptions=True)
        for res in resolved:
            if isinstance(res, BingResult):
                results.append(res)

    return results


async def search_campaigns(location: str) -> list[BingResult]:
    if os.environ.get("BING_SEARCH_API_KEY"):
        return await search_bing(location)
    return await search_google_news_rss(location)


async def validate_public_campaign(
    client: httpx.AsyncClient,
    result: BingResult,
    location: str,
    semaphore: asyncio.Semaphore,
) -> bool:
    async with semaphore:
        try:
            response = await client.get(str(result.url), headers={"Accept": "text/html"}, follow_redirects=True)
        except httpx.HTTPError:
            return False
        final_host = (urlparse(str(response.url)).hostname or "").lower()
        if response.status_code >= 400 or final_host not in KITABISA_HOSTS:
            return False
        if "text/html" not in response.headers.get("content-type", ""):
            return False
        page_text = response.text[:500_000].lower()
        return location.lower() in page_text or any(term in page_text for term in RELEVANT_TERMS)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/campaigns", response_model=list[CampaignCandidate])
async def campaigns(
    location: str = Query(min_length=2, max_length=80),
) -> list[CampaignCandidate]:
    cache_key = location.strip().lower()
    now = datetime.now(timezone.utc).timestamp()

    if cache_key in CAMPAIGN_CACHE:
        cached_time, cached_candidates = CAMPAIGN_CACHE[cache_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            logger.info("Serving campaigns for '%s' from cache", location)
            return cached_candidates

    logger.info("Discovering campaigns for '%s'", location)
    results = await search_campaigns(location)
    validated_at = datetime.now(timezone.utc).isoformat()
    candidates: list[CampaignCandidate] = []
    seen: set[str] = set()
    unique_results: list[BingResult] = []

    for result in results:
        url = str(result.url).rstrip("/")
        if url not in seen:
            seen.add(url)
            unique_results.append(result)

    semaphore = asyncio.Semaphore(5)

    async def process_candidate(result: BingResult, client: httpx.AsyncClient) -> Optional[CampaignCandidate]:
        confidence = score_result(result, location)
        if confidence < 60:
            return None
        is_valid = await validate_public_campaign(client, result, location, semaphore)
        if not is_valid:
            return None
        return CampaignCandidate(
            id=f"kitabisa-discovered-{abs(hash(str(result.url)))}",
            title=result.name,
            description=result.snippet or f"Automatically discovered donation campaign related to {location}.",
            donationUrl=result.url,
            regionTags=[location, "Indonesia"],
            confidence=confidence,
            validatedAt=validated_at,
        )

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        tasks = [process_candidate(item, client) for item in unique_results]
        processed = await asyncio.gather(*tasks, return_exceptions=True)
        for item in processed:
            if isinstance(item, CampaignCandidate):
                candidates.append(item)

    top_candidates = sorted(candidates, key=lambda item: item.confidence, reverse=True)[:5]
    CAMPAIGN_CACHE[cache_key] = (now, top_candidates)
    return top_candidates
