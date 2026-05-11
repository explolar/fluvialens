import Link from "next/link";
import { notFound } from "next/navigation";
import { getStory, stories } from "@/lib/content/stories";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  return (
    <article className="max-w-2xl mx-auto px-6 lg:px-8 py-16 md:py-24">
      <Link
        href="/stories"
        className="text-sm text-muted hover:text-fg transition inline-flex items-center gap-1"
      >
        ← Back to stories
      </Link>

      <p className="mt-12 eyebrow text-muted-soft">{story.tag}</p>
      <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">
        {story.title}
      </h1>
      <p className="mt-6 eyebrow">
        {story.author} · {story.date}
      </p>

      <hr className="hairline my-12" />

      <div className="text-fg leading-[1.8] text-lg whitespace-pre-wrap">
        {story.body}
      </div>

      <hr className="hairline my-16" />

      <div className="flex items-center justify-between text-sm">
        <Link href="/stories" className="text-muted hover:text-fg transition">
          ← All stories
        </Link>
        <Link href="/ask" className="text-fg hover:underline">
          Ask Terralens →
        </Link>
      </div>
    </article>
  );
}
