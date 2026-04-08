import { JSDOM } from 'jsdom';

import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

// ---

await fs.mkdir('_tmp', { recursive: true });
await fs.mkdir(path.join('generated-rfc'), { recursive: true });
await fs.mkdir(path.join('_includes', 'generated-rfc-toc'), {
    recursive: true,
});

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
toc: generated-rfc-toc/${name}.html
title: ${title.trim()}
description: >-
    ${meta.description.trim().replaceAll('\n', ' ')}
meta:
    authors:
${meta.authors.map((author) => `        - ${author}`).join('\n')}
    keywords:
${meta.keywords.map((keyword) => `        - ${keyword}`).join('\n')}
---
${rfcHTML.trim()}
`;
    await fs.writeFile(path.join('generated-rfc', `${name}.liquid`), template);
};

const mergeHeadingAnchors = (domParent) => {
    const document = domParent.ownerDocument;
    let textContent = '';
    let hash;
    domParent.querySelectorAll('a').forEach((domAnchor, i) => {
        if (i === 0) {
            hash = new URL(domAnchor.href).hash;
        } else if (textContent) {
            textContent += '\u00A0\u00A0';
        }
        textContent += domAnchor.textContent.trim();
    });
    domParent.innerHTML = '';
    const domAnchor = document.createElement('a');
    domAnchor.href = hash;
    domAnchor.textContent = textContent;
    domParent.append(domAnchor);
};

// ---

for (const fileName of DOCUMENTS) {
    const xmlPath = makeXMLPath(fileName);
    const html = await xml2html(xmlPath);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const meta = getMetaTags(document);

    const domBody = document.querySelector('body');

    const domTableOfContents = domBody.querySelector('#toc nav');
    // Keep ToC 2 levels deep
    domTableOfContents
        .querySelectorAll('ul > li > ul > li > ul')
        .forEach((domUl) => domUl.remove());

    const domToCAuthorsAddresses = domTableOfContents.querySelector(
        'li:has(a[href="#name-authors-addresses"], a[href="#name-authors-address"])',
    );
    domToCAuthorsAddresses.remove();

    // Each list item in the ToC links seperately to the numbered and text
    // segments of the section heading. Reformat to just link to the numeric
    // part.
    domTableOfContents.querySelectorAll('p[id]').forEach(mergeHeadingAnchors);
    domBody
        .querySelectorAll(':is(h2, h3, h4, h5)')
        .forEach(mergeHeadingAnchors);

    const domTopLevelToCList = domTableOfContents.querySelector('ul');
    domTopLevelToCList.classList.add('u-toc');

    const appendToC = (id, textContent) => {
        const html = `<li><p><a href="#${id}">${textContent}</a></p></li>`;
        domTopLevelToCList.innerHTML += html;
    };
    appendToC('status-of-memo', 'Status of This Memo');
    appendToC('copyright', 'Copyright');

    domBody.querySelector('table.ears').remove();
    domBody.querySelector('#external-metadata').remove();
    domBody.querySelector('#internal-metadata').remove();
    domBody.querySelector('#section-abstract').remove();
    domBody.querySelector('#authors-addresses').remove();
    domBody.querySelectorAll('.break').forEach((domBreak) => domBreak.remove());

    // Move these sections to the bottom of the page since they push the main
    // content down.
    const domMemoStatus = domBody.querySelector('#status-of-memo');
    const domCopyright = domBody.querySelector('#copyright');
    domMemoStatus.parentElement.appendChild(domMemoStatus);
    domCopyright.parentElement.appendChild(domCopyright);

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

    const tableOfContentsHTML = domTableOfContents.innerHTML;
    const basename = getFileNameWithoutExt(fileName);
    await fs.writeFile(
        path.join(
            path.join('_includes', 'generated-rfc-toc'),
            `${basename}.html`,
        ),
        tableOfContentsHTML,
        { encoding: 'utf-8' },
    );
    domBody.querySelector('#toc').remove();

    const rfcHTML = domBody.innerHTML;
    await fs.writeFile(
        path.join(getTempPath(basename), `${basename}-formatted.html`),
        domBody.innerHTML,
        { encoding: 'utf-8' },
    );

    await writeTemplate(basename, rfcHTML, meta, title);
}
