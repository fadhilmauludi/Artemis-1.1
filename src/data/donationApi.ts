import { geocodeLocation, type LocationResult } from '@/data/locationApi';

export interface LocalCampaign {
  id: string;
  title: string;
  organization: string;
  description: string;
  regionTags: string[];
  donationUrl: string | null;
  latitude: number;
  longitude: number;
  source?: 'curated' | 'automated-discovery' | 'verified-partner' | 'verified-wildfire';
  confidence?: number;
  validatedAt?: string;
}

export interface GlobalNonprofit {
  id: string;
  title: string;
  organization: string;
  description: string;
  regionTags: string[];
  donationUrl: string;
  latitude: number;
  longitude: number;
  source?: 'every.org';
}

export type DonationCampaign = LocalCampaign | GlobalNonprofit;

const DISCOVERY_URL = import.meta.env.VITE_DONATION_DISCOVERY_URL;
const VERIFIED_WILDFIRE_CAMPAIGNS = {
  riau: 'https://kitabisa.com/campaign/urgentkarhutla',
  kalimantan: 'https://www.rumahzakat.org/donasi/bantu-darurat-karhutla',
  national: 'https://kitabisa.com/campaign/patunganuntukhutan',
} as const;

export const LOCAL_CAMPAIGNS: LocalCampaign[] = [
  {
    id: 'kitabisa-riau-fire-response',
    title: 'Riau Fire Response & Community Relief',
    organization: 'Local disaster response partners',
    description: 'Support frontline teams and families affected by forest fires in Riau.',
    regionTags: ['Riau', 'Sumatera', 'Indonesia'],
    donationUrl: import.meta.env.VITE_KITABISA_RIAU_URL || VERIFIED_WILDFIRE_CAMPAIGNS.riau,
    source: import.meta.env.VITE_KITABISA_RIAU_URL ? 'curated' : 'verified-wildfire',
    latitude: 0.5071,
    longitude: 101.4478,
  },
  {
    id: 'kitabisa-kalimantan-fire-relief',
    title: 'Central Kalimantan Forest Fire Relief',
    organization: 'Local humanitarian partners',
    description: 'Help communities facing smoke exposure and wildfire disruption.',
    regionTags: ['Central Kalimantan', 'Kalimantan', 'Indonesia'],
    donationUrl: import.meta.env.VITE_KITABISA_CENTRAL_KALIMANTAN_URL || VERIFIED_WILDFIRE_CAMPAIGNS.kalimantan,
    source: import.meta.env.VITE_KITABISA_CENTRAL_KALIMANTAN_URL ? 'curated' : 'verified-wildfire',
    latitude: -1.6815,
    longitude: 113.3824,
  },
  {
    id: 'kitabisa-indonesia-emergency',
    title: 'Indonesia Emergency Response Fund',
    organization: 'National disaster relief partners',
    description: 'A national fallback fund for urgent disaster response across Indonesia.',
    regionTags: ['Indonesia'],
    donationUrl: import.meta.env.VITE_KITABISA_INDONESIA_URL || VERIFIED_WILDFIRE_CAMPAIGNS.national,
    source: import.meta.env.VITE_KITABISA_INDONESIA_URL ? 'curated' : 'verified-wildfire',
    latitude: -2.5489,
    longitude: 118.0149,
  },
];

export function filterLocalCampaigns(currentLocation: string): LocalCampaign[] {
  const normalized = currentLocation.toLowerCase();
  const specific = LOCAL_CAMPAIGNS.filter((campaign) =>
    campaign.regionTags.some((tag) => tag.toLowerCase() !== 'indonesia' && normalized.includes(tag.toLowerCase())),
  );
  if (specific.length > 0) return specific;
  return LOCAL_CAMPAIGNS.filter((campaign) => campaign.regionTags.includes('Indonesia'));
}

export async function fetchDiscoveredCampaigns(
  location: string,
  signal?: AbortSignal,
): Promise<LocalCampaign[]> {
  if (!DISCOVERY_URL) return [];
  const url = new URL('/campaigns', DISCOVERY_URL);
  url.searchParams.set('location', location);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Donation discovery request failed (${response.status}).`);
  const data = await response.json() as LocalCampaign[];
  return data.map((campaign) => ({ ...campaign, source: 'automated-discovery' }));
}

interface EveryOrgResponse {
  nonprofits?: Array<{
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    description?: unknown;
    logoUrl?: unknown;
    profileUrl?: unknown;
  }>;
  data?: Array<{
    id?: unknown;
    name?: unknown;
    slug?: unknown;
    description?: unknown;
    logoUrl?: unknown;
    profileUrl?: unknown;
  }>;
}

const EVERY_ORG_URL = 'https://partners.every.org/v0.2/search';
const EVERY_ORG_API_KEY = import.meta.env.VITE_EVERY_ORG_API_KEY;

export async function fetchGlobalNonprofits(
  locationKeyword: string,
  signal?: AbortSignal,
): Promise<GlobalNonprofit[]> {
  if (!EVERY_ORG_API_KEY) throw new Error('Every.org API key is not configured.');
  const request = async (searchTerm: string): Promise<EveryOrgResponse> => {
    const params = new URLSearchParams({
      apiKey: EVERY_ORG_API_KEY,
      take: '4',
      causes: 'wildfires',
    });
    const response = await fetch(`${EVERY_ORG_URL}/${encodeURIComponent(searchTerm)}?${params.toString()}`, { signal });
    if (!response.ok) throw new Error(`Every.org request failed (${response.status}).`);
    return response.json() as Promise<EveryOrgResponse>;
  };
  const primaryPayload = await request(`wildfire ${locationKeyword}`.trim());
  const primaryNonprofits = primaryPayload.nonprofits ?? primaryPayload.data ?? [];
  const nonprofits = primaryNonprofits.length > 0
    ? primaryNonprofits
    : (await request('wildfire')).nonprofits ?? [];

  return nonprofits.flatMap((item, index) => {
    if (typeof item.name !== 'string' || !item.name.trim()) return [];
    const identifier = typeof item.slug === 'string' ? item.slug : String(item.id ?? index);
    return [{
      id: `every-${identifier}`,
      title: item.name,
      organization: 'Every.org nonprofit directory',
      description: typeof item.description === 'string' && item.description
        ? item.description
        : `Support wildfire relief and humanitarian work related to ${locationKeyword}.`,
      regionTags: [locationKeyword, 'Global'],
      donationUrl: `https://www.every.org/${identifier}/donate`,
      latitude: 0,
      longitude: 0,
    }];
  });
}

export async function resolveCampaignLocation(campaign: DonationCampaign): Promise<LocationResult> {
  if (campaign.latitude !== 0 || campaign.longitude !== 0) {
    return {
      displayName: campaign.regionTags[0] ?? 'Disaster area',
      latitude: campaign.latitude,
      longitude: campaign.longitude,
    };
  }
  return geocodeLocation(campaign.regionTags[0] ?? 'Indonesia');
}
