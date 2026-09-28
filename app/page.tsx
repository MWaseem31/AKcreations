import { prisma } from '@/lib/prisma';
import Widgets from '@/components/Widgets';
export const dynamic = 'force-dynamic'; // admin changes show up immediately

const SECTIONS = [
  ['quran', 'Quran teaching', 'Audio-only lessons'],
  ['clothing', 'Clothing design', 'Custom designs and patterns'],
  ['clay', 'Clay art', 'Handmade colorful pieces'],
];

export default async function Home() {
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <main>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-brand-500">AK Creations</span>
          <a href="/admin/login" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Admin login</a>
        </div>
      </header>
      <section className="bg-brand-950 px-4 py-16 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-title-sm font-semibold md:text-title-md">Quran lessons, clothing design and handmade clay art</h1>
        <p className="mx-auto mt-3 max-w-xl text-brand-200">Browse what is available and send us a message to book or order.</p>
      </section>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        {SECTIONS.map(([key, label, sub]) => {
          const list = items.filter((i) => i.category === key);
          return (
            <section key={key}>
              <h2 className="text-title-xs font-semibold text-gray-800">{label}</h2>
              <p className="mb-4 text-sm text-gray-500">{sub}</p>
              {list.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-400">Nothing here yet. Check back soon.</p>}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((i) => (
                  <article key={i.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    {i.imageUrl && <img src={i.imageUrl} alt={i.title} className="h-48 w-full object-cover" />}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">{i.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{i.description}</p>
                      {i.price != null && <p className="mt-3 font-semibold text-brand-500">Rs {i.price}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
        <Widgets />
      </div>
    </main>
  );
}
