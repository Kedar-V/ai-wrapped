export const FE = ['night', 'low', 'rom', 'repeat'] as const;
export type FeatureKey = (typeof FE)[number];
export type Features = Record<FeatureKey, number>;

export const FL: Record<FeatureKey, string> = {
  night: 'Nighttime listening',
  low: 'Low-energy tracks',
  rom: 'Romantic playlists',
  repeat: 'Repeat listening',
};

export const FD: Record<FeatureKey, string> = {
  night: 'Share of listening minutes between 22:00 and 05:59 local time.',
  low: 'Share of plays with an audio-energy score below 0.35.',
  rom: 'Share of minutes from playlists tagged “romantic”.',
  repeat: 'Share of plays that are re-listens within 14 days.',
};

export const W: Record<FeatureKey, number> = { night: 0.35, low: 0.3, rom: 0.2, repeat: 0.15 };
export const REF: Record<FeatureKey, number> = { night: 60, low: 50, rom: 35, repeat: 70 };
export const TH = 70;
