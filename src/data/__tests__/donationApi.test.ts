import { describe, expect, it } from 'vitest';
import { filterLocalCampaigns } from '@/data/donationApi';

describe('donationApi: filterLocalCampaigns', () => {
  it('returns Riau-specific campaigns when location includes Riau', () => {
    const campaigns = filterLocalCampaigns('Pekanbaru, Riau, Indonesia');
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns.some((c) => c.regionTags.includes('Riau'))).toBe(true);
  });

  it('returns Kalimantan-specific campaigns when location includes Kalimantan', () => {
    const campaigns = filterLocalCampaigns('Palangkaraya, Central Kalimantan');
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns.some((c) => c.regionTags.includes('Central Kalimantan'))).toBe(true);
  });

  it('falls back to national Indonesia campaign for unrecognized Indonesian locations', () => {
    const campaigns = filterLocalCampaigns('Surabaya, East Java, Indonesia');
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns.some((c) => c.id === 'kitabisa-indonesia-emergency')).toBe(true);
  });
});
