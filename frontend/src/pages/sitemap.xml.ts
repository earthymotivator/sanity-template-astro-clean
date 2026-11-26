import type { APIRoute } from 'astro';
import { getPosts } from '../utils/sanity';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const baseUrl = 'https://top10analysis.com';

  // Static pages jo aapki site par hain
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/disclaimer',
    '/terms'
  ];

  // Saare posts ke URL
  const postUrls = posts
    .filter((post: any) => post.slug)
    .map((post: any) => `/post/${post.slug}`);

  const allUrls = [...staticPages, ...postUrls];

  // Sitemap XML format
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
