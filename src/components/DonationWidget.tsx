import { AlertCircle, ChevronDown, HeartHandshake, LoaderCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchGlobalNonprofits,
  fetchDiscoveredCampaigns,
  filterLocalCampaigns,
  resolveCampaignLocation,
  type DonationCampaign,
} from '@/data/donationApi';
import { DonationCard } from '@/components/DonationCard';

interface DonationWidgetProps {
  currentLocation: string;
  onViewLocation: (latitude: number, longitude: number, zoom: number) => void;
}

export function DonationWidget({ currentLocation, onViewLocation }: DonationWidgetProps) {
  const [globalCampaigns, setGlobalCampaigns] = useState<DonationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveredCampaigns, setDiscoveredCampaigns] = useState<DonationCampaign[]>([]);
  const localCampaigns = useMemo(() => filterLocalCampaigns(currentLocation), [currentLocation]);
  const campaigns = [...discoveredCampaigns, ...localCampaigns, ...globalCampaigns];

  const loadCampaigns = useCallback(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    Promise.allSettled([
      fetchGlobalNonprofits(currentLocation, controller.signal),
      fetchDiscoveredCampaigns(currentLocation, controller.signal).catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') throw reason;
        return [];
      }),
    ])
      .then(([globalResult, discoveredResult]) => {
        if (globalResult.status === 'fulfilled') {
          setGlobalCampaigns(globalResult.value);
        } else if (!controller.signal.aborted) {
          setGlobalCampaigns([]);
          setError(globalResult.reason instanceof Error ? globalResult.reason.message : 'Unable to load global donation options.');
        }
        if (discoveredResult.status === 'fulfilled') {
          setDiscoveredCampaigns(discoveredResult.value);
        } else if (!controller.signal.aborted) {
          setDiscoveredCampaigns([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [currentLocation]);

  useEffect(() => {
    return loadCampaigns();
  }, [loadCampaigns]);

  const handleViewMap = async (campaign: DonationCampaign) => {
    const location = await resolveCampaignLocation(campaign);
    onViewLocation(location.latitude, location.longitude, 8);
  };

  return (
    <section className="terminal-surface rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10"><HeartHandshake className="h-4 w-4 text-amber-200" /></div>
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white/90">Wildfire donation access</h2>
            <p className="mt-1 text-[11px] text-white/40">Direct relief links matched to <strong className="font-medium text-white/70">{currentLocation}</strong></p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-100/70"><ChevronDown className="h-3 w-3" /> Direct links</span>
      </div>
      <p className="mt-3 text-[10px] leading-4 text-white/40">Campaign links open the original donation page. Verified wildfire campaigns are shown first, followed by automatically discovered and global relief options.</p>
      {isLoading && <div className="flex items-center gap-2 py-6 text-xs text-white/50"><LoaderCircle className="h-4 w-4 animate-spin text-amber-200" /> Loading donation options...</div>}
      {error && !isLoading && <div className="flex items-start gap-2 py-3 text-xs text-amber-100/75"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p>{error}</p><button type="button" onClick={loadCampaigns} className="mt-2 inline-flex items-center gap-1.5 text-white/70 hover:text-white"><RefreshCw className="h-3 w-3" /> Retry global options</button></div></div>}
      {!isLoading && <div className="mt-4 grid gap-3 lg:grid-cols-2">{campaigns.map((campaign) => <DonationCard key={campaign.id} campaign={campaign} currentLocation={currentLocation} onViewMap={handleViewMap} />)}</div>}
    </section>
  );
}
