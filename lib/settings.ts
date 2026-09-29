import { prisma } from '@/lib/prisma';
import { normalizeCv, type Cv } from '@/lib/cv';

export type Settings = { contactEmail: string; etsyUrl: string; teachingUrl: string; cv: Cv };

export async function getSettings(): Promise<Settings> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return {
      contactEmail: row?.contactEmail ?? '',
      etsyUrl: row?.etsyUrl ?? '',
      teachingUrl: row?.teachingUrl ?? '',
      cv: normalizeCv(row?.cv),
    };
  } catch (e) {
    console.error('getSettings failed', e);
    return { contactEmail: '', etsyUrl: '', teachingUrl: '', cv: normalizeCv(null) };
  }
}

/** Where contact messages go: the admin's chosen email, falling back to DEVELOPER_EMAIL. */
export async function getRecipient() {
  const { contactEmail } = await getSettings();
  return contactEmail || process.env.DEVELOPER_EMAIL || '';
}
