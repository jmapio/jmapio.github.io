# jmap.io

Source for [jmap.io](https://jmap.io), the website for the JSON Meta Application
Protocol (JMAP).

## Local development

Install docker and run the `local-build` script:

```sh
_bin/local-build
```

This will launch a Jekyll dev server with the `--livereload` flag.

<!-- prettier-ignore -->
> [!NOTE] 
> The LightningCSS and esbuild post-write hooks only run for
> non-development builds. When `JEKYLL_ENV=development` (the default for
> `jekyll serve`), CSS and JS are emitted as-is from the bundled `module/`
> sources.

Generating a full build of the site can be done locally via:

```sh
_bin/full-build
```

This will update RFC pages, generate new OG images, and process JS/CSS assets.

## Generating RFC pages

The files in `pages/generated-rfc/` are derived from upstream IETF XML and
should not be edited by hand. The pages can be updated by running:

```sh
_bin/generate-rfcs
```

The pipeline is two steps:

```sh
node _scripts/fetch-rfc-xml.js          # fetches RFC and draft XMLs into _tmp/rfc-xml/
node _scripts/generate-rfc-templates.js # runs xml2rfc and writes Liquid templates + ToC includes
```

The list of source documents (RFCs and active drafts) lives at the top of
`_scripts/fetch-rfc-xml.js` — update it there when a new RFC or draft revision
is published.

## Generating OG images

```sh
_bin/generate-og-images
```

This uses Playwright to screenshot `_scripts/og-image.html` for each page in
`pages/` and writes the results to `images/og/`.

## Linting and formatting

Requires Node 24.

```sh
npm ci
npm run lint-prettier
npm run lint-stylelint
```

## Deployment

- Pushes to `master` trigger `.github/workflows/deploy.yml`, which builds with
  `JEKYLL_ENV=production` and publishes to GitHub Pages at
  [jmap.io](https://jmap.io).
- Pushes to any other branch trigger `.github/workflows/preview.yml`, which
  builds with the `/jmapio.github.io` baseurl and removes the CNAME so the
  preview is served from the `*.github.io` domain instead.
