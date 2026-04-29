import fs from 'node:fs/promises';
import path from 'node:path';

// ---

const URLS = [
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9749.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9670.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc8887.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9425.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9404.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9661.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9007.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9219.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9610.notprepped.xml',
    'https://www.rfc-editor.org/in-notes/prerelease/rfc9553.notprepped.xml',
    // Only RFC 8650 and above are available directly from rfc-editor as XML
    'https://raw.githubusercontent.com/jmapio/jmap/refs/heads/master/rfc/src/rfc8620.xml',
    'https://raw.githubusercontent.com/jmapio/jmap/refs/heads/master/rfc/src/rfc8621.xml',
    // Drafts
    'https://www.ietf.org/archive/id/draft-ietf-jmap-calendars-26.xml',
    'https://www.ietf.org/archive/id/draft-ietf-calext-jscalendarbis-15.xml',
];

const OUTDIR = path.join('_tmp', 'rfc-xml');

// ---

const dirExists = async (pathlike) => {
    try {
        const stat = await fs.stat(pathlike);
        return stat.isDirectory();
    } catch {
        return false;
    }
};
if (await dirExists(OUTDIR)) {
    await fs.rmdir(OUTDIR, { recursive: true, force: true });
}
await fs.mkdir(OUTDIR, { recursive: true });

// ---

for (const url of URLS) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'jmap.io/1.0', 'Accept': 'application/xml' },
    });
    if (!res.ok) {
        throw new Error(
            `Failed to fetch "${url}"\nHTTP status: ${res.status} ${res.statusText}`,
        );
    }
    const xml = await res.text();
    let fileName = path.basename(url).replace(/\.notprepped\./, '.');
    switch (fileName) {
        case 'draft-ietf-jmap-calendars-26.xml':
            fileName = 'calendars-draft.xml';
            break;
        case 'draft-ietf-calext-jscalendarbis-15.xml':
            fileName = 'jscalendar-draft.xml';
            break;
    }
    await fs.writeFile(path.join(OUTDIR, fileName), xml, {
        encoding: 'utf8',
    });
}
