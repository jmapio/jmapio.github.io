import { chromium } from 'playwright';
import matter from 'gray-matter';

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

// ---

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTDIR = path.join(ROOT, 'images', 'og');
const TMPDIR = path.join(ROOT, '_tmp', 'og');

// ---

await fs.mkdir(OUTDIR, { recursive: true });
await fs.mkdir(TMPDIR, { recursive: true });

// ---

const parseFrontMatter = (content) => {
    return matter(content).data;
};

const slugFromPermalink = (permalink) => {
    const stripped = permalink
        .replace(/\/index\.html$/, '')
        .replace(/^\//, '')
        .replace(/\/$/, '');
    if (!stripped) {
        return 'home';
    }
    return stripped.replace(/\//g, '-');
};

const collectPages = async () => {
    const pages = [];

    for await (const entry of glob('pages/**/*.{liquid,md}', { cwd: ROOT })) {
        const filePath = path.join(ROOT, entry);
        const content = await fs.readFile(filePath, 'utf-8');
        const fm = parseFrontMatter(content);

        if (!fm.permalink) {
            continue;
        }

        const slug = slugFromPermalink(fm.permalink);
        const isRFC = fm.layout === 'article-rfc';
        const isHome = slug === 'home';

        const eyebrow = fm.og_image?.eyebrow ?? fm.hero?.eyebrow ?? '';
        const title = fm.og_image?.title ?? fm.hero?.title ?? fm.title ?? slug;
        const description =
            fm.og_image?.description ?? fm.hero?.sub ?? fm.description ?? '';

        const titleLen = title.length;
        const titleClass = fm.og_image?.class
            ? `og-title ${fm.og_image.class}`
            : titleLen > 90
              ? 'og-title og-title--sm'
              : titleLen > 60
                ? 'og-title og-title--md'
                : 'og-title';

        pages.push({ slug, eyebrow, title, description, titleClass });
    }

    return pages;
};

// ---

const htmlTemplate = await fs.readFile(
    path.join(ROOT, '_scripts', 'og-image.html'),
    { encoding: 'utf8' },
);

const buildHTML = (
    tokensCSS,
    { eyebrow, title, description, slug, titleClass },
) => {
    const replacements = {
        title,
        eyebrow,
        description,
        tokensCSS,
        titleClass,
    };

    let finalTemplate = htmlTemplate;
    for (const [key, value] of Object.entries(replacements)) {
        finalTemplate = finalTemplate.replaceAll(`{{ ${key} }}`, value);
    }
    return finalTemplate;
};

// ---

const tokensCSS = await fs.readFile(
    path.join(ROOT, 'css', 'module', 'tokens.css'),
    'utf-8',
);

const pages = await collectPages();

await fs.mkdir(OUTDIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
});

for (const page of pages) {
    const html = buildHTML(tokensCSS, page);
    const tmpFile = path.join(TMPDIR, `og-${page.slug}.html`);
    await fs.writeFile(tmpFile, html, {
        encoding: 'utf-8',
    });
    const bPage = await context.newPage();
    await bPage.goto(`file://${tmpFile}`, { waitUntil: 'domcontentloaded' });
    await bPage.evaluate(() => document.fonts.ready);
    const outPath = path.join(OUTDIR, `${page.slug}.png`);
    await bPage.screenshot({ path: outPath, type: 'png' });
    await bPage.close();
    console.log(`  ${page.slug}.png`);
}

await browser.close();
console.log(`\nGenerated ${pages.length} OG images in img/og/`);
