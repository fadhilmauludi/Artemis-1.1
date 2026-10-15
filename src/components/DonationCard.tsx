import { ArrowUpRight, HeartHandshake, LoaderCircle, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { DonationCampaign } from '@/data/donationApi';

interface DonationCardProps {
  campaign: DonationCampaign;
  currentLocation: string;
  onViewMap: (campaign: DonationCampaign) => Promise<void>;
}

export function DonationCard({ campaign, currentLocation, onViewMap }: DonationCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  const handleViewMap = async () => {
    setIsNavigating(true);
    setNavigationError(null);
    try {
      await onViewMap(campaign);
    } catch (error: unknown) {
      setNavigationError(error instanceof Error ? error.message : 'Unable to locate the disaster area.');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <article className="rounded-xl border border-white/[0.1] bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10">
          <HeartHandshake className="h-4 w-4 text-amber-200" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-white/90">{campaign.title}</h3>
          <p className="mt-1 text-[10px] text-white/40">{campaign.organization}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/55">{campaign.description}</p>
      {campaign.source === 'verified-wildfire' && (
        <div className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.06] px-3 py-2 text-[10px] leading-4 text-amber-100/75">
          <strong className="font-medium text-amber-100/90">Direct wildfire campaign.</strong>{' '}
          This verified public campaign is related to forest and land-fire relief.
        </div>
      )}
      {campaign.source === 'verified-partner' && (
        <div className="mt-3 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-[10px] leading-4 text-emerald-100/70">
          <strong className="font-medium text-emerald-100/90">Verified disaster relief partner.</strong>{' '}
          This is a general disaster donation portal, not a Kitabisa campaign specifically tied to this hotspot.
        </div>
      )}
      {campaign.source === 'automated-discovery' && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-amber-200/75">
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1">Automatically discovered</span>
          {campaign.confidence !== undefined && <span>{campaign.confidence}% confidence</span>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {campaign.regionTags.map((tag) => <span key={tag} className="rounded-full border border-white/[0.1] px-2 py-0.5 font-mono text-[9px] text-white/40">{tag}</span>)}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {campaign.donationUrl ? (
          <a href={campaign.donationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-300 px-3 py-2 text-[11px] font-semibold text-[#17130a] transition-colors hover:bg-amber-200">
            {campaign.source === 'verified-partner' ? 'Donate via relief partner' : campaign.source === 'verified-wildfire' ? 'Donate to wildfire relief' : `Help Victims in ${currentLocation}`} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-2 text-center text-[11px] font-medium text-white/35" title="A verified direct campaign URL has not been configured.">
            Direct campaign link unavailable
          </span>
        )}
        <button type="button" onClick={handleViewMap} disabled={isNavigating} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] px-3 py-2 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50">
          {isNavigating ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
          View Disaster Area
        </button>
      </div>
      {navigationError && <p className="mt-2 text-[10px] text-red-200">{navigationError}</p>}
    </article>
  );
}
