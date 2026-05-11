import Link from "next/link";
import { stories } from "@/lib/content/stories";

export const metadata = { title: "Climate Stories · Terralens" };

export default function StoriesPage() {
  const [hero, ...rest] = stories;
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="eyebrow mb-3">Editorial · grounded in data</p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight">
          Climate <em>stories.</em>
        </h1>
        <p className="mt-5 text-muted text-lg max-w-2xl leading-relaxed">
          Features that turn the numbers behind Terralens into things worth
          reading.
        </p>
      </div>

      {hero && (
        <Link
          href={`/stories/${hero.slug}`}
          className="card card-hover p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center group"
        >
          <div>
            <p className="eyebrow text-muted-soft mb-3">{hero.tag} · Featured</p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">
              {hero.title}
            </h2>
            <p className="mt-5 text-muted leading-relaxed">{hero.excerpt}</p>
            <p className="mt-6 eyebrow">
              {hero.author} · {hero.date}
            </p>
            <span className="mt-8 inline-block text-sm group-hover:gap-3 gap-2 transition-all">
              Read the story →
            </span>
          </div>
          <div className="aurora-bg dot-grid h-72 rounded-2xl border border-border-soft" />
        </Link>
      )}

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rest.map((s) => (
          <Link key={s.slug} href={`/stories/${s.slug}`} className="card card-hover p-7">
            <p className="eyebrow text-muted-soft mb-3">{s.tag}</p>
            <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
            <p className="mt-3 text-sm text-muted leading-relaxed">{s.excerpt}</p>
            <p className="mt-6 eyebrow">{s.date}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
