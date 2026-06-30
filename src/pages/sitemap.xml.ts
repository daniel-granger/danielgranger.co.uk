import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const DEFAULT_SITE_URL = 'https://danielgranger.co.uk';

const newestDate = (dates: Date[]) =>
  dates.reduce<Date | undefined>((latest, date) => {
    if (!latest || date > latest) return date;
    return latest;
  }, undefined);

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const GET: APIRoute = async ({ site }) => {
  const blogPosts = await getCollection('blog');
  const portfolioItems = await getCollection('portfolio');
  const siteUrl = site ?? new URL(DEFAULT_SITE_URL);
  const buildDate = new Date();
  const newestBlogDate = newestDate(blogPosts.map((post) => post.data.date));
  const newestPortfolioDate = newestDate(
    portfolioItems
      .map((item) => item.data.date)
      .filter((date): date is Date => Boolean(date)),
  );

  const staticUrls: Array<{ loc: string; lastmod: string }> = [
    { loc: new URL('/', siteUrl).toString(), lastmod: formatDate(buildDate) },
    { loc: new URL('/blog/', siteUrl).toString(), lastmod: formatDate(newestBlogDate ?? buildDate) },
    {
      loc: new URL('/portfolio/', siteUrl).toString(),
      lastmod: formatDate(newestPortfolioDate ?? buildDate),
    },
    { loc: new URL('/contact/', siteUrl).toString(), lastmod: formatDate(buildDate) },
  ];

  const urls: Array<{ loc: string; lastmod?: string }> = [
    ...staticUrls,
    ...blogPosts.map((post) => ({
      loc: new URL(`/blog/${post.id}/`, siteUrl).toString(),
      lastmod: formatDate(post.data.date),
    })),
    ...portfolioItems.map((item) => ({
      loc: new URL(`/portfolio/${item.id}/`, siteUrl).toString(),
      lastmod: item.data.date ? formatDate(item.data.date) : undefined,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
