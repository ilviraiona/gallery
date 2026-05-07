import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_ORIGIN = 'https://ilviran.com';
const OG_TITLE = 'Ilvira Nasreddinova Artist';

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toAbsoluteUrl(siteOrigin, relPath) {
  const clean = String(relPath || '').replace(/^\//, '');
  return `${siteOrigin}/${clean}`;
}

function pageHtml({ id, ogImageAbs }) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" href="favicon-96x96.png" sizes="96x96">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="manifest" href="site.webmanifest">
  <meta name="theme-color" content="#ffffff">
  <title>${escapeHtml(OG_TITLE)}</title>

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(OG_TITLE)}">
  <meta property="og:title" content="${escapeHtml(OG_TITLE)}">
  <meta property="og:url" content="${escapeHtml(`${SITE_ORIGIN}/work-${id}.html`)}">
  <meta property="og:image" content="${escapeHtml(ogImageAbs)}">
  <meta property="og:image:alt" content="${escapeHtml(OG_TITLE)}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(OG_TITLE)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageAbs)}">

  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-work-id="${escapeHtml(id)}">
  <div class="layout">
    <div id="sidebar-placeholder"></div>
    <div id="mobile-header-placeholder"></div>

    <main class="main-content">
      <div id="work-content">
        <!-- Dynamic Content -->
      </div>
    </main>
  </div>

  <script src="js/components.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;
}

async function main() {
  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  const worksJsonPath = path.join(rootDir, 'data', 'works.json');
  const raw = await readFile(worksJsonPath, 'utf8');
  const works = JSON.parse(raw);

  await Promise.all(
    works.map(async (work) => {
      const outPath = path.join(rootDir, `work-${work.id}.html`);
      const ogImageAbs = toAbsoluteUrl(SITE_ORIGIN, work.image);
      await writeFile(outPath, pageHtml({ id: work.id, ogImageAbs }), 'utf8');
    })
  );

  // eslint-disable-next-line no-console
  console.log(`Generated ${works.length} work-*.html pages in repo root`);
}

await main();

