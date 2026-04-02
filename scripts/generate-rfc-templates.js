import { JSDOM } from 'jsdom';

import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

// ---

await fs.mkdir('_tmp', { recursive: true });

// ---

const DOCUMENTS = [
    'calendars.xml',
    'contacts.xml',
    'keywords.xml',
    'oauth.xml',
    'rfc8620.xml',
    'rfc8621.xml',
    'rfc9610.xml',
    'rfc9670.xml',
    'sharing.xml',
];

// ---

const makeXMLPath = (name) =>
    path.join('_includes', 'jmap', 'rfc', 'src', name);

const getFileNameWithoutExt = (filePath) => path.parse(filePath).name;

const getTempPath = (name) => path.join('_tmp', name);

const xml2html = async (xmlPath) => {
    const basename = getFileNameWithoutExt(xmlPath);
    const outPath = getTempPath(basename);
    await fs.mkdir(outPath, { recursive: true });
    execFileSync(path.join('.venv', 'bin', 'xml2rfc'), [
        xmlPath,
        '--html',
        '-p',
        outPath,
    ]);
    const outFilePath = path.join(outPath, `${basename}.html`);
    return await fs.readFile(outFilePath, { encoding: 'utf-8' });
};

const getMetaTags = (document) => {
    const authors = [...document.querySelectorAll('meta[name=author]')].map(
        (meta) => meta.getAttribute('content'),
    );
    const keywords = [...document.querySelectorAll('meta[name=keyword]')].map(
        (meta) => meta.getAttribute('content'),
    );
    const description = document
        .querySelector('meta[name=description]')
        .getAttribute('content');
    return { authors, keywords, description };
};

const writeTemplate = async (name, rfcHTML, meta, title) => {
    const template = `---
layout: article-rfc
permalink: /spec/${name}/index.html
title: ${title.trim()}
description: >-
    ${meta.description.trim().replaceAll('\n', ' ')}
meta:
    authors:
${meta.authors.map((author) => `        - ${author}`).join('\n')}
    keywords:
${meta.keywords.map((keyword) => `        - ${keyword}`).join('\n')}
---
${rfcHTML}
`;
    await fs.mkdir('generated-rfc', { recursive: true });
    await fs.writeFile(path.join('generated-rfc', `${name}.liquid`), template);
};

// ---

for (const fileName of DOCUMENTS) {
    const xmlPath = makeXMLPath(fileName);
    const html = await xml2html(xmlPath);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const meta = getMetaTags(document);

    const domBody = document.querySelector('body');

    const domTableOfContents = document.querySelector('#toc nav');
    const tableOfContentsHTML = domTableOfContents.innerHTML;
    const basename = getFileNameWithoutExt(fileName);
    await fs.writeFile(
        path.join(getTempPath(basename), `${basename}-toc.html`),
        tableOfContentsHTML,
        { encoding: 'utf-8' },
    );
    domBody.remove(document.querySelector('#toc'));

    const domH1 = domBody.querySelectorAll('h1');
    const title = [...domH1].map((el) => el.textContent).join(' – ');
    domH1.forEach((h1) => h1.remove());
    domBody.querySelectorAll('script').forEach((script) => script.remove());
    domBody
        .querySelectorAll('[style]')
        .forEach((el) => el.removeAttribute('style'));
    domBody.querySelectorAll('table').forEach((table) => {
        const domTableWrapper = document.createElement('div');
        table.replaceWith(domTableWrapper);
        domTableWrapper.classList.add('table-wrapper');
        domTableWrapper.append(table);
    });

    const rfcHTML = domBody.innerHTML;
    await fs.writeFile(
        path.join(getTempPath(basename), `${basename}-formatted.html`),
        domBody.innerHTML,
        { encoding: 'utf-8' },
    );

    await writeTemplate(basename, rfcHTML, meta, title);
}
