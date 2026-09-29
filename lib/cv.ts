// Shared (client + server) CV types and helpers. No database imports here.
export type Cv = {
  fullName: string;
  title: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  objective: string;
  personal: string; // one "Label: value" per line
  qualifications: string; // one per line
  skills: string; // one per line; "Title :: details" puts details on a second line
  experience: string; // one per line; same "Title :: details" format
  hobbies: string; // one per line
  languages: string; // one per line
};

export const emptyCv: Cv = {
  fullName: '', title: '', address: '', phone: '', email: '', website: '',
  objective: '', personal: '', qualifications: '', skills: '', experience: '', hobbies: '', languages: '',
};

const LIMITS: Record<keyof Cv, number> = {
  fullName: 100, title: 100, address: 200, phone: 50, email: 200, website: 200,
  objective: 600, personal: 1500, qualifications: 1500, skills: 2000, experience: 2500, hobbies: 800, languages: 500,
};

export function normalizeCv(raw: any): Cv {
  const out = { ...emptyCv };
  if (raw && typeof raw === 'object') {
    (Object.keys(emptyCv) as (keyof Cv)[]).forEach((k) => {
      if (typeof raw[k] === 'string') out[k] = raw[k].slice(0, LIMITS[k]);
    });
  }
  return out;
}

export const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/** '' -> '' (clears it), valid http(s) URL -> normalized URL, anything else -> null (invalid). */
export function cleanUrl(v: unknown): string | null {
  const s = String(v ?? '').trim();
  if (!s) return '';
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withProto);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return null;
    return u.toString().slice(0, 300);
  } catch {
    return null;
  }
}
