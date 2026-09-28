import { prisma } from '@/lib/prisma';
import Widgets from '@/components/Widgets';
export const dynamic = 'force-dynamic'; // admin changes show up immediately

const SECTIONS = [
  ['quran', 'Quran teaching (audio lessons)'],
  ['clothing', 'Clothing design'],
  ['clay', 'Clay art'],
];

export default async function Home() {
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <main>
      <h1>Noor Creations</h1>
      <p>Quran teaching, clothing design and handmade clay art.</p>
      <p><a href="/api/auth/signin">Sign in with Google</a></p>
      {SECTIONS.map(([key, label]) => (
        <section key={key}>
          <h2>{label}</h2>
          {items.filter((i) => i.category === key).length === 0 && <p>Nothing here yet.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {items.filter((i) => i.category === key).map((i) => (
              <article key={i.id}>
                {i.imageUrl && <img src={i.imageUrl} alt={i.title} style={{ width: '100%', borderRadius: 6 }} />}
                <h3 style={{ margin: '8px 0 0' }}>{i.title}</h3>
                <p style={{ margin: 0 }}>{i.description}</p>
                {i.price != null && <b>Rs {i.price}</b>}
              </article>
            ))}
          </div>
        </section>
      ))}
      <Widgets />
    </main>
  );
}
