export type PersonaId = 'A' | 'B' | 'C' | 'D';
export type Sensitivity = 'Low' | 'Medium' | 'High';

export interface Inference {
  id: string;
  name: string;
  short: string;
  /** Heuristic score; null means it is computed live from the rule. */
  conf: number | null;
  sens: Sensitivity;
  obs: string;
}

export interface Persona {
  id: PersonaId;
  name: string;
  tag: string;
  min: number;
  genres: [string, number][];
  night: number;
  low: number;
  rom: number;
  repeat: number;
  work: number;
  wknd: number;
  c1: string;
  c2: string;
  /** Daytime listening peak: center hour, width, boost. */
  pk: { c: number; w: number; b: number };
  recs: string[];
  ads: [string, string][];
  infs: Inference[];
}

export const PERSONA_IDS: PersonaId[] = ['A', 'B', 'C', 'D'];

export const PERSONAS: Record<PersonaId, Persona> = {
  A: {
    id: 'A', name: 'The Midnight Romantic', tag: 'Slow, late, on repeat', min: 28450,
    genres: [['Dream pop', 31], ['Indie R&B', 26], ['Acoustic', 19], ['Synth ballads', 14], ['Lo-fi', 10]],
    night: 61, low: 48, rom: 35, repeat: 72, work: 14, wknd: 31, c1: '#5B21B6', c2: '#FF4FA3', pk: { c: 21, w: 3, b: 0.4 },
    recs: ['More slow acoustic mixes after 10 pm', '“Late night feels” playlist pinned on your home screen'],
    ads: [['Night Listening & Audio Gear', 'Pulse Buds headphones promotion']],
    infs: [
      { id: 'owl', name: 'Night owl', short: 'Most of your listening happens after 10 pm.', conf: 94, sens: 'Low', obs: '61% of minutes fall between 22:00 and 05:59.' },
      { id: 'refl', name: 'Emotionally reflective', short: 'Slow, introspective tracks dominate your replays.', conf: 71, sens: 'Medium', obs: '48% low-energy tracks; 72% replay rate.' },
      { id: 'rel', name: 'Possibly romantically involved', short: 'Romantic playlists make up a large share of your listening.', conf: 58, sens: 'High', obs: '35% of minutes come from romantic-themed playlists.' },
      { id: 'vuln', name: 'Potentially emotionally vulnerable', short: 'Late-night, low-energy, repeated listening matches a pattern we associate with vulnerability.', conf: null, sens: 'High', obs: 'Rule score from four listening features (see Explain).' },
    ],
  },
  B: {
    id: 'B', name: 'The Productivity Machine', tag: 'Heads down, headphones on', min: 21300,
    genres: [['Instrumental focus', 38], ['Lo-fi', 27], ['Ambient', 17], ['Classical', 11], ['Jazz', 7]],
    night: 22, low: 41, rom: 5, repeat: 38, work: 64, wknd: 8, c1: '#0E7A4B', c2: '#1DF08A', pk: { c: 13, w: 3, b: 0.8 },
    recs: ['Longer focus sessions queued for 9–5', 'Instrumental mixes ranked above vocals'],
    ads: [['Study & Focus', 'FocusLoop study-product subscription']],
    infs: [
      { id: 'disc', name: 'Highly disciplined', short: 'Long, unbroken sessions with almost no skipping.', conf: 88, sens: 'Low', obs: '4% skip rate; sessions average 2.4 hours.' },
      { id: 'car', name: 'Career-focused', short: 'Your listening follows the workday closely.', conf: 76, sens: 'Medium', obs: '64% of minutes fall on workdays 09:00–17:00.' },
      { id: 'stress', name: 'Possibly experiencing work-related stress', short: 'Dense focus listening with few breaks resembles a stress pattern.', conf: 54, sens: 'High', obs: 'Long focus blocks; minimal variety.' },
      { id: 'tool', name: 'Productivity-product shopper', short: 'Likely receptive to focus and study products.', conf: 67, sens: 'Low', obs: '38% instrumental-focus minutes.' },
    ],
  },
  C: {
    id: 'C', name: 'The Weekend Extrovert', tag: 'Friday to Sunday, volume up', min: 24900,
    genres: [['Pop', 29], ['Dance', 24], ['Hip-hop', 20], ['Latin', 15], ['EDM', 12]],
    night: 44, low: 9, rom: 12, repeat: 25, work: 12, wknd: 58, c1: '#FF8A1F', c2: '#FF4FA3', pk: { c: 19, w: 2.5, b: 0.9 },
    recs: ['Friday “Pre-game” mix auto-built', 'High-energy discovery stations on weekends'],
    ads: [['Live Events', 'Encore Live concert-ticket promotion']],
    infs: [
      { id: 'soc', name: 'Socially outgoing', short: 'High-energy party playlists dominate your weekends.', conf: 83, sens: 'Medium', obs: '58% of minutes fall on weekends.' },
      { id: 'nl', name: 'Frequent nightlife participant', short: 'Late weekend listening suggests going out.', conf: 69, sens: 'Medium', obs: '44% night listening; 31% skip rate.' },
      { id: 'promo', name: 'Interested in entertainment promotions', short: 'Likely receptive to event and entertainment offers.', conf: 77, sens: 'Low', obs: 'Party and dance playlists: 53% of minutes.' },
      { id: 'tix', name: 'Likely concert-ticket buyer', short: 'You follow many live-performing artists.', conf: 62, sens: 'Low', obs: 'Diverse popular genres; 12% romantic.' },
    ],
  },
  D: {
    id: 'D', name: 'The Nostalgic Explorer', tag: 'Old songs, new corners', min: 19700,
    genres: [['Classic rock', 24], ['80s synth-pop', 21], ['Soul', 18], ['Folk', 15], ['Disco', 12]],
    night: 31, low: 33, rom: 21, repeat: 68, work: 18, wknd: 27, c1: '#1D4ED8', c2: '#FF8A1F', pk: { c: 15, w: 4, b: 0.5 },
    recs: ['“Throwback Thursday” mixes surfaced', 'Frequent playlist refreshes weighted toward the 70s–90s'],
    ads: [['Retro & Vinyl', 'Groove Archive retro-products promotion']],
    infs: [
      { id: 'nos', name: 'Nostalgic personality', short: 'Most of your plays are songs older than 25 years.', conf: 85, sens: 'Medium', obs: '71% older music; 68% replay rate.' },
      { id: 'sent', name: 'Emotionally sentimental', short: 'Heavy replay of familiar songs.', conf: 64, sens: 'Medium', obs: '68% repeat listening.' },
      { id: 'retro', name: 'Interested in retro products', short: 'Likely receptive to vintage and retro offers.', conf: 79, sens: 'Low', obs: 'Disco, soul and 80s synth-pop lead your genres.' },
      { id: 'age', name: 'Likely over 35', short: 'Your catalog suggests an age bracket.', conf: 72, sens: 'High', obs: 'Older-music share and genre mix.' },
    ],
  },
};

export const featuresOf = (p: Persona) => ({ night: p.night, low: p.low, rom: p.rom, repeat: p.repeat });
