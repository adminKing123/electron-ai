/**
 * Generates public/sitemap.xml and public/robots.txt from a single site origin.
 * Run before production builds so Search Console always sees up-to-date URLs.
 *
 * Set REACT_APP_SITE_URL or VITE_SITE_URL (no trailing slash).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const SITE_ORIGIN = (
  process.env.REACT_APP_SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://comet-hypen-ai.netlify.app"
).replace(/\/$/, "");

const LASTMOD = new Date().toISOString().slice(0, 10);

/** Indexable public routes (canonical, stable URLs — no user-specific paths). */
const SITEMAP_ENTRIES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/auth", changefreq: "monthly", priority: "0.7" },
  { loc: "/library", changefreq: "weekly", priority: "0.8" },
  { loc: "/analytics", changefreq: "weekly", priority: "0.7" },
  { loc: "/aura-rj", changefreq: "weekly", priority: "0.8" },
  { loc: "/fuse/discover", changefreq: "weekly", priority: "0.9" },
  { loc: "/fuse/integrations", changefreq: "monthly", priority: "0.7" },
];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildSitemap = () => {
  const urls = SITEMAP_ENTRIES.map(
    ({ loc, changefreq, priority }) => `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}${loc}`)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

const buildRobots = () => `User-agent: *
Allow: /

# User-specific or editor URLs — keep out of crawl budget (use noindex in-app too).
Disallow: /c/
Disallow: /fuse/studio/
Disallow: /fuse/runs/
Disallow: /fuse/listing

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

fs.writeFileSync(path.join(PUBLIC, "sitemap.xml"), buildSitemap(), "utf8");
fs.writeFileSync(path.join(PUBLIC, "robots.txt"), buildRobots(), "utf8");

console.log(`SEO files written for ${SITE_ORIGIN} (lastmod ${LASTMOD})`);
