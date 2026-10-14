import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { allPosts, coverFor, findPost, formatDateLong } from "@/lib/blog";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Picture } from "@/components/ui/Picture";

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.titulo.length > 50 ? post.titulo : `${post.titulo} | Popolare`,
    absoluteTitle: true,
    description: post.resumo.length > 160 ? `${post.resumo.slice(0, 157).trimEnd()}…` : post.resumo,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.data,
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const cover = coverFor(post.slug);

  return (
    <article className="pb-24 pt-32 md:pt-40">
      <JsonLd
        data={[
          articleSchema({ title: post.titulo, description: post.resumo, path, date: post.data, image: cover }),
          breadcrumbSchema([
            { name: "Blog", path: "/blog" },
            { name: post.titulo, path },
          ]),
        ]}
      />
      <header className="container-popolare max-w-4xl">
        <Link href="/blog" className="eyebrow text-[0.65rem] text-tinta-suave hover:text-primaria">
          ← Blog
        </Link>
        <time dateTime={post.data} className="eyebrow mt-8 block text-madeira-escura">
          {formatDateLong(post.data)}
        </time>
        <h1 className="italiano mt-4 text-[clamp(2.4rem,1.4rem+3.6vw,4.8rem)] leading-[1.02] text-tinta">{post.titulo}</h1>
      </header>

      <div className="container-popolare mt-12 max-w-5xl">
        <div className="aspect-[16/9] overflow-hidden rounded-[1.75rem]">
          <Picture image={cover} alt="" priority sizes="(min-width: 1024px) 64rem, 92vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
        </div>
      </div>

      <div className="container-popolare mt-14 max-w-3xl space-y-6 text-lg leading-relaxed text-tinta-suave">
        {post.blocos.map((b, i) => {
          if (b.tipo === "h2") {
            return (
              <h2 key={i} className="italiano pt-6 text-3xl leading-tight text-tinta md:text-4xl">
                {b.texto}
              </h2>
            );
          }
          if (b.tipo === "li") {
            return (
              <p key={i} className="border-l-2 border-primaria/30 pl-5">
                {b.texto}
              </p>
            );
          }
          return <p key={i}>{b.texto}</p>;
        })}
      </div>

      <aside className="container-popolare mt-16 max-w-3xl">
        <div className="rounded-[1.75rem] bg-primaria p-8 text-farinha md:p-10">
          <p className="italiano text-3xl">Bateu a fome?</p>
          <p className="mt-2 text-farinha/80">Veja as massas da casa e peça pelo WhatsApp.</p>
          <Link href="/cardapio" data-track="click_cta" data-track-local="blog" className="mt-6 inline-block rounded-full bg-farinha px-6 py-3 font-semibold text-primaria">
            Ver cardápio
          </Link>
        </div>
      </aside>
    </article>
  );
}
