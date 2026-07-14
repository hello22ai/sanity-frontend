import Link from "next/link";
import { defineQuery, type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

const POSTS_PER_PAGE = 9;

const POSTS_QUERY = defineQuery(`*[
  _type == "post" && defined(slug.current)
] | order(publishedAt desc, _createdAt desc) [$start...$end] {
  _id, title, slug, publishedAt, description, featureImage, tags
}`);

const COUNT_QUERY = defineQuery(
  `count(*[_type == "post" && defined(slug.current)])`,
);

const options = { next: { revalidate: 30 } };

function formatDate(date?: string) {
  return date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const total = await client.fetch<number>(COUNT_QUERY, {}, options);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const page = Math.min(
    totalPages,
    Math.max(1, parseInt(pageParam ?? "1", 10) || 1),
  );
  const start = (page - 1) * POSTS_PER_PAGE;

  const posts = await client.fetch<SanityDocument[]>(
    POSTS_QUERY,
    { start, end: start + POSTS_PER_PAGE },
    options,
  );
  console.log("Fetched posts:", posts); // Log the fetched posts for debugging

  const isFirstPage = page === 1;
  const featured = isFirstPage ? posts[0] : undefined;
  const gridPosts = isFirstPage ? posts.slice(1) : posts;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {/* Intro — only on first page */}
        {isFirstPage && (
          <section className="mb-10">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Stories &amp; Ideas
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-stone-500">
              Thoughts on AI, business and building things — written for
              humans, by humans.
            </p>
          </section>
        )}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-stone-500">
              No posts yet. Add one in your Sanity Studio and it will show up
              here.
            </p>
          </div>
        ) : (
          <>
            {/* Featured post — compact horizontal card */}
            {featured && (
              <Link
                href={`/${featured.slug.current}`}
                className="group mb-10 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row"
              >
                {featured.featureImage && (
                  <div className="shrink-0 overflow-hidden sm:w-2/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlFor(featured.featureImage)
                        .width(800)
                        .height(600)
                        .url()}
                      alt={featured.featureImage.alt || featured.title}
                      className="aspect-video h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:aspect-auto"
                      width={800}
                      height={600}
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span className="font-medium uppercase tracking-wider text-blue-600">
                      Latest
                    </span>
                    {featured.publishedAt && (
                      <>
                        <span aria-hidden>·</span>
                        <time>{formatDate(featured.publishedAt)}</time>
                      </>
                    )}
                  </div>
                  <h2 className="mt-2 font-serif text-2xl font-bold leading-snug tracking-tight text-stone-900 transition-colors duration-200 group-hover:text-blue-700">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="mt-2 line-clamp-2 leading-relaxed text-stone-600">
                      {featured.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                    Read article
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            )}

            {/* Post grid */}
            {gridPosts.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <li key={post._id}>
                    <Link
                      href={`/${post.slug.current}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {post.featureImage && (
                        <div className="overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={urlFor(post.featureImage)
                              .width(640)
                              .height(360)
                              .url()}
                            alt={post.featureImage.alt || post.title}
                            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            width={640}
                            height={360}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        {post.publishedAt && (
                          <time className="text-xs text-stone-500">
                            {formatDate(post.publishedAt)}
                          </time>
                        )}
                        <h2 className="mt-1.5 font-serif text-lg font-bold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-blue-700">
                          {post.title}
                        </h2>
                        {post.description && (
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">
                            {post.description}
                          </p>
                        )}
                        {Array.isArray(post.tags) && post.tags.length > 0 && (
                          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                            {post.tags.slice(0, 2).map((tag: string) => (
                              <span
                                key={tag}
                                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-between border-t border-stone-200 pt-6"
              >
                {page > 1 ? (
                  <Link
                    href={page === 2 ? "/" : `/?page=${page - 1}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-100"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-stone-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={`/?page=${page + 1}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-100"
                  >
                    Next →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
