import './globals.css';
export const metadata = { title: 'Noor Creations', description: 'Quran teaching, clothing design and clay art' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300..700&display=swap" rel="stylesheet" /></head>
      <body>{children}</body>
    </html>
  );
}
