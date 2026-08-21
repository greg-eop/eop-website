import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

function hasPublishedCaseStudies() {
  const dir = join(process.cwd(), 'src/content/case-studies');
  try {
    return readdirSync(dir).some((file) => {
      if (!file.endsWith('.md')) return false;
      return /^published:\s*true\s*$/m.test(
        readFileSync(join(dir, file), 'utf8'),
      );
    });
  } catch {
    return false;
  }
}

const includeCaseStudies = hasPublishedCaseStudies();

function isCaseStudiesUrl(page) {
  try {
    const path = new URL(page).pathname.replace(/\/+$/, '') || '/';
    return path === '/case-studies' || path.startsWith('/case-studies/');
  } catch {
    return page.includes('/case-studies');
  }
}

export default defineConfig({
  site: 'https://eoplaw.com',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/category/') &&
        !page.includes('/northwestlawfirm/') &&
        !page.includes('/www.uspto.gov') &&
        !page.includes('/home-not-attorneys') &&
        !page.includes('/cs/') &&
        (includeCaseStudies || !isCaseStudiesUrl(page)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 4321,
    host: true,
  },
  redirects: {
    '/category/attorneys/[slug]': '/our-attorneys/[slug]',
    '/category/attorneys': '/our-attorneys',
    '/category/attorney-category/attorney': '/our-attorneys',

    '/category/employment': '/practice-areas/employment',
    '/category/insurance': '/practice-areas/insurance',
    '/category/litigation-and-appellate-practices':
      '/practice-areas/litigation-appellate-practices',
    '/category/business-finance-and-real-estate':
      '/practice-areas/business-finance',
    '/category/tax-and-estate-planning': '/practice-areas/tax-estate-planning',
    '/category/entertainment-and-new-technologies':
      '/practice-areas/intellectual-property',
    '/practice-areas/entertainment-new-technologies':
      '/practice-areas/intellectual-property',
    '/category/intellectual-property': '/practice-areas/intellectual-property',
    '/category/affordable-housing-development-and-financing':
      '/practice-areas/affordable-housing-development-financing',

    '/category/resources': '/resources',

    '/home-not-attorneys': '/',
    '/cs/uncategorized': '/',

    '/www.uspto.gov': 'https://www.uspto.gov/',

    '/northwestlawfirm/about-elliot-ostrander-preston': '/about',
    '/northwestlawfirm/attorneys/business-finance-and-real-estate/advocate-beware-oregon-products-claims':
      '/practice-areas/business-finance',
  },
});
