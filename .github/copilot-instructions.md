# Copilot instructions for danielgranger.co.uk

## Commands

Run commands from the repository root. The project requires Node.js `>=22.12.0` and uses npm.

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Astro development server at `http://localhost:4321` |
| `npm run build` | Build the static production site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- check` | Run Astro’s type and project checks |
| `npm run astro -- <command>` | Run another Astro CLI command |

There are no test or lint scripts in `package.json`, so there is currently no configured test-suite or single-test command. Do not add a test runner just to satisfy this file; use the existing Astro check and production build unless the project gains a testing setup.

## Architecture

- This is a static Astro site with no server adapter. Files under `src/pages/` define routes and are prerendered at build time.
- `src/components/Layout.astro` is the shared page shell. It imports the global stylesheet, renders the header and footer, and owns canonical, Open Graph, and page metadata. New pages should use `Layout` rather than duplicating document markup.
- Blog and portfolio content are Astro content collections defined in `src/content.config.ts`. Markdown files are expected under `src/content/blog/` and `src/content/portfolio/`; their frontmatter is validated by the collection schemas.
  - Blog entries require `title`, `date`, and `description`; `draft` defaults to `false`; `categories`, `tags`, and `image` are optional, with at most three categories or tags. Draft posts are excluded from all public routes and generated metadata.
  - Portfolio entries require `title` and `description`; `draft` and `is_featured` default to `false`; `date`, `tags`, and `image` are optional. Draft entries are excluded from all public routes and generated metadata.
- `src/pages/blog/index.astro` and `src/pages/portfolio/index.astro` query collections for listing pages. The matching `[slug].astro` routes use `getStaticPaths()` and `render()` for individual Markdown pages.
- The home page is composed from `src/components/Home/`. `LatestPosts.astro` shows the three newest blog posts; `FeaturedWork.astro` selects featured portfolio items and sorts them by date; `About.astro` renders Markdown stored in the homepage data.
- Editable site copy is kept in `src/data/*.json` and consumed directly by components. The Netlify CMS configuration in `public/admin/config.yml` maps these files and the two content collections to the `/admin` interface.
- Build-time endpoints generate `sitemap.xml`, `llms.txt`, and PNG Open Graph cards. The OG route uses Satori and Resvg and fetches Inter fonts during the build; `astro.config.mjs` supplies the canonical site URL and Markdown code-block transforms.
- The contact page is a Netlify form (`data-netlify="true"`) that posts to `/contact/thanks/`; preserve the hidden `form-name` field and honeypot when changing the form.

## Repository conventions

- Keep page-specific text in the relevant JSON data file instead of hard-coding it in the Astro component. Keep empty-state messages in `src/data/empty-states.json`.
- Use absolute `/...` URLs for assets in `public/`. Content `image` fields may be a `/public` path or an absolute URL; `Layout.astro` resolves them into OG metadata.
- Blog and portfolio indexes use `TaxonomyFilter.astro`: each item must expose comma-separated values through `data-filter-values`, and the filter’s `itemSelector` must match the rendered item class.
- Preserve the existing date behavior: blog lists sort newest first, dates are displayed with `en-GB` formatting, and portfolio featured items sort newest first while undated items sort last.
- Use typed frontmatter and props in `.astro` files. The repository extends Astro’s strict TypeScript configuration; do not edit generated `.astro/types.d.ts`.
- Keep interactive behavior as small client-side scripts in the relevant Astro component. The site otherwise relies on Astro’s static rendering and Bootstrap CSS rather than a client framework.
- When changing navigation or page metadata, update the shared `Header.astro` or `Layout.astro` so all routes remain consistent. New content routes should also be represented by the sitemap and OG-card route if they are not covered by the existing collection logic.
- Keep generated output (`dist/`, `.astro/`) and dependencies (`node_modules/`) out of changes. Do not create commits unless explicitly requested.
