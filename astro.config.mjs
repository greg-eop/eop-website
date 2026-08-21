import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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
        !page.includes('/cs/'),
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
      '/practice-areas/entertainment-new-technologies',
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
