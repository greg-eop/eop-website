# EOP Law (Astro + Sveltia CMS)

This project has been migrated to Astro and uses Sveltia CMS for homepage content editing.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## CMS

- CMS entry: `/admin`
- CMS config: `public/admin/config.yml`
- Managed content: `src/data/home.json`

## Notes

- The homepage is rendered from Astro components in `src/components/astro/`.
- Structured page data is stored in `src/data/home.json`.
- Existing styles are loaded from `src/index.css`.
