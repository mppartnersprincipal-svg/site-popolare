import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { allPosts, coverFor, formatDateLong } from "@/lib/blog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Picture } from "@/components/ui/Picture";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Histórias, ingredientes e dicas da Popolare para levar a cozinha italiana para a sua mesa, direto de Goiânia.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = allPosts();
  return (
    <>
      <PageHeader eyebrow="Il diario" title="Blog" accent="da Popolare." intro="Bastidores, ingredientes e dicas para uma noite italiana em casa." path="/blog" crumb="Blog" />
      <section aria-label="Artigos" className="pb-24">
        <ul className="container-popolare grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-[1.75rem] bg-farinha">
                <div className="aspect-[16/10] overflow-hidden">
                  <Picture
                    image={coverFor(post.slug)}
                    alt=""
                    sizes="(min-width: 768px) 45vw, 92vw"
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                </div>
                <div className="p-7 md:p-9">
                  <time dateTime={post.data} className="eyebrow text-[0.65rem] text-madeira-escura">
                    {formatDateLong(post.data)}
                  </time>
                  <h2 className="italiano mt-3 text-3xl leading-tight text-tinta group-hover:text-primaria">{post.titulo}</h2>
                  <p className="mt-3 line-clamp-3 text-tinta-suave">{post.resumo}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
