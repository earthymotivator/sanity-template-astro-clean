import type { APIRoute } from 'astro';
import { getPosts } from '../utils/sanity';

const baseUrl = 'https://top10analysis.com';

const staticPages = [
  '',
  '/about',
  '/contact',
  '/privacy',
  '/disclaimer',
  '/terms',
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const posts: any[] = await getPosts();

  const pageEntries = staticPages.map((path) => ({
    loc: `${baseUrl}${path}`,
    lastmod: undefined as string | undefined,
    priority: path === '' ? '1.0' : '0.5',
  }));

  const postEntries = posts
    .filter((post: any) => post.slug)
    .map((post: any) => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post._updatedAt || post.publishDate || post._createdAt,
      priority: '0.8',
    }));

  const entries = [...pageEntries, ...postEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${
      entry.lastmod
        ? `
    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>`
        : ''
    }
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
