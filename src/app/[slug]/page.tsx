import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PortableText,
  defineQuery,
  type PortableTextComponents,
  type SanityDocument,
} from "next-sanity";
import type { Metadata } from "next";
import { cache } from "react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

const POST_QUERY = defineQuery(`*[
  _type == "post" && slug.current == $slug
][0]{
  _id, title, description, publishedAt, body, featureImage,
  seoTitle, seoDescription, canonicalUrl, ogTitle, ogDescription, tags, schemaMarkup
}`);

const options = { next: { revalidate: 30 } };

const getPost = cache(async (rawSlug: string) =>
  client.fetch<SanityDocument | null>(
    POST_QUERY,
    { slug: decodeURIComponent(rawSlug) },
    options,
  ),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.seoDescription || post.description;
  const ogImage = post.featureImage
    ? urlFor(post.featureImage).width(1200).height(630).url()
    : undefined;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords:
      Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : undefined,
    alternates: post.canonicalUrl
      ? { canonical: post.canonicalUrl }
      : undefined,
    openGraph: {
      title: post.ogTitle || seoTitle,
      description: post.ogDescription || seoDescription,
      type: "article",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630 }]
        : undefined,
    },
  };
}

type Block = { _type?: string; children?: { text?: string }[] };

function readingTime(body: unknown): number {
  if (!Array.isArray(body)) return 1;
  const words = (body as Block[])
    .filter((block) => block._type === "block")
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? "")
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-[1.0625rem] leading-8 text-stone-700">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="mb-4 mt-12 font-serif text-3xl font-bold tracking-tight text-stone-900">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 font-serif text-2xl font-bold tracking-tight text-stone-900">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-10 font-serif text-xl font-bold text-stone-900">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-8 text-lg font-semibold text-stone-900">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-6 border-l-2 border-blue-400 pl-5 font-serif text-lg italic leading-8 text-stone-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-[1.0625rem] leading-8 text-stone-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-[1.0625rem] leading-8 text-stone-700">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 transition-colors duration-200 hover:text-blue-800 hover:decoration-blue-500"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={urlFor(value).width(1400).url()}
        alt={value.alt || ""}
        className="my-10 w-full rounded-2xl border border-stone-200"
        loading="lazy"
      />
    ),
  },
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  console.log("Fetched post:", post); // Log the fetched post for debugging
  if (!post) return notFound();

  const minutes = readingTime(post.body);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {post.schemaMarkup && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: post.schemaMarkup }}
          />
        )}

        <article>
          {/* Article header */}
          <header className="mx-auto max-w-2xl text-center">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800"
            >
              ← All stories
            </Link>

            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl sm:leading-tight">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-stone-500">
              {post.publishedAt && (
                <time>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              <span aria-hidden>·</span>
              <span>{minutes} min read</span>
            </div>

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 ring-1 ring-stone-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Feature image */}
          {post.featureImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urlFor(post.featureImage).width(1600).height(840).url()}
              alt={post.featureImage.alt || post.title}
              className="mt-10 aspect-[1.9/1] w-full rounded-2xl border border-stone-200 object-cover shadow-sm"
              width={1600}
              height={840}
            />
          )}

          {/* Article body — comfortable reading width */}
          <div className="mx-auto mt-12 max-w-2xl">
            {post.description && (
              <p className="mb-10 font-serif text-xl italic leading-relaxed text-stone-600">
                {post.description}
              </p>
            )}

            {Array.isArray(post.body) && (
              <PortableText value={post.body} components={bodyComponents} />
            )}

            {/* Article footer */}
            <div className="mt-14 border-t border-stone-200 pt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-800"
              >
                ← Back to all stories
              </Link>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
