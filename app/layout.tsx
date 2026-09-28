export const metadata = { title: 'Noor Creations', description: 'Quran teaching, clothing design and clay art' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body style={{ fontFamily: 'Georgia, serif', maxWidth: 860, margin: '0 auto', padding: 16, lineHeight: 1.6, color: '#2b2a33' }}>{children}</body></html>
  );
}
