export type JsonLdNode = {
  '@type'?: string | string[];
  '@id'?: string;
  [key: string]: unknown;
};

export type Breadcrumb = {
  name: string;
  path: string;
};

const ORG_FRAGMENT = '#organization';
const WEBSITE_FRAGMENT = '#website';
const LOGO_FRAGMENT = '#logo';

const PATH_LABELS: Record<string, string> = {
  about: 'About',
  'contact-us': 'Contact',
  'practice-areas': 'Practice Areas',
  'our-attorneys': 'Our Attorneys',
  'case-studies': 'Case Studies',
  resources: 'Resources',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'legal-notice': 'Legal Notice',
  accessibility: 'Accessibility',
};

export function absoluteUrl(site: URL | string, path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = typeof site === 'string' ? site : site.origin;
  return new URL(path, origin.endsWith('/') ? origin : `${origin}/`).href;
}

export function organizationId(site: URL | string): string {
  return absoluteUrl(site, `/${ORG_FRAGMENT}`);
}

export function websiteId(site: URL | string): string {
  return absoluteUrl(site, `/${WEBSITE_FRAGMENT}`);
}

export function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === undefined || item === null || item === '') return false;
      if (Array.isArray(item) && item.length === 0) return false;
      return true;
    }),
  ) as T;
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function breadcrumbsFromPath(
  pathname: string,
  leafLabel?: string,
): Breadcrumb[] {
  const path = normalizePath(pathname);
  if (path === '/' || path === '/404') return [];

  const segments = path.split('/').filter(Boolean);
  const crumbs: Breadcrumb[] = [{ name: 'Home', path: '/' }];
  let current = '';

  segments.forEach((segment, index) => {
    current += `/${segment}`;
    const isLast = index === segments.length - 1;
    crumbs.push({
      name:
        (isLast && leafLabel) ||
        PATH_LABELS[segment] ||
        titleFromSlug(segment),
      path: current,
    });
  });

  return crumbs;
}

export function inferPageType(
  pathname: string,
): 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ProfilePage' {
  const path = normalizePath(pathname);
  if (path === '/about') return 'AboutPage';
  if (path === '/contact-us') return 'ContactPage';
  if (
    path === '/our-attorneys' ||
    path === '/practice-areas' ||
    path === '/case-studies'
  ) {
    return 'CollectionPage';
  }
  if (path.startsWith('/our-attorneys/')) return 'ProfilePage';
  return 'WebPage';
}

function postalAddress(addressLines: string[]): JsonLdNode {
  const streetAddress = addressLines[0] ?? '';
  const cityLine = addressLines[1] ?? '';
  const match = cityLine.match(
    /^(.+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/,
  );

  return compact({
    '@type': 'PostalAddress',
    streetAddress,
    addressLocality: match?.[1] ?? cityLine,
    addressRegion: match?.[2],
    postalCode: match?.[3],
    addressCountry: 'US',
  });
}

export function organizationNode(options: {
  site: URL | string;
  name: string;
  description: string;
  telephone: string;
  email: string;
  fax?: string;
  addressLines: string[];
  mapUrl?: string;
  sameAs?: string[];
  logoUrl: string;
  imageUrl: string;
}): JsonLdNode {
  const id = organizationId(options.site);
  const logoId = absoluteUrl(options.site, `/${LOGO_FRAGMENT}`);

  return compact({
    '@type': 'LegalService',
    '@id': id,
    name: options.name,
    alternateName: ['EOP Law', 'Elliott Ostrander & Preston'],
    url: absoluteUrl(options.site, '/'),
    description: options.description,
    image: options.imageUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': logoId,
      url: options.logoUrl,
    },
    telephone: toE164(options.telephone),
    email: options.email,
    faxNumber: options.fax ? toE164(options.fax) : undefined,
    address: postalAddress(options.addressLines),
    hasMap: options.mapUrl,
    sameAs: options.sameAs,
    foundingDate: '1995',
    areaServed: [
      {
        '@type': 'City',
        name: 'Portland',
        containedInPlace: { '@type': 'State', name: 'Oregon' },
      },
      { '@type': 'State', name: 'Oregon' },
    ],
    openingHours: 'Mo-Fr 09:00-17:00',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: toE164(options.telephone),
      email: options.email,
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: 'English',
    },
  });
}

export function websiteNode(options: {
  site: URL | string;
  name: string;
}): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': websiteId(options.site),
    url: absoluteUrl(options.site, '/'),
    name: options.name,
    inLanguage: 'en-US',
    publisher: { '@id': organizationId(options.site) },
  };
}

export function webPageNode(options: {
  site: URL | string;
  url: string;
  title: string;
  description: string;
  pageType?: string;
  imageUrl?: string;
  breadcrumbs?: Breadcrumb[];
  mainEntity?: JsonLdNode;
}): JsonLdNode {
  const pageId = `${options.url}#webpage`;
  const breadcrumbId = `${options.url}#breadcrumb`;

  return compact({
    '@type': options.pageType ?? 'WebPage',
    '@id': pageId,
    url: options.url,
    name: options.title,
    description: options.description,
    inLanguage: 'en-US',
    isPartOf: { '@id': websiteId(options.site) },
    about: { '@id': organizationId(options.site) },
    primaryImageOfPage: options.imageUrl,
    breadcrumb:
      options.breadcrumbs && options.breadcrumbs.length > 0
        ? { '@id': breadcrumbId }
        : undefined,
    mainEntity: options.mainEntity,
  });
}

export function breadcrumbListNode(options: {
  url: string;
  site: URL | string;
  crumbs: Breadcrumb[];
}): JsonLdNode | null {
  if (options.crumbs.length === 0) return null;

  return {
    '@type': 'BreadcrumbList',
    '@id': `${options.url}#breadcrumb`,
    itemListElement: options.crumbs.map((crumb, index) =>
      compact({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(options.site, crumb.path),
      }),
    ),
  };
}

export function personNode(options: {
  site: URL | string;
  slug: string;
  name: string;
  description?: string;
  email?: string;
  imageUrl?: string;
  knowsAbout?: string[];
}): JsonLdNode {
  const url = absoluteUrl(options.site, `/our-attorneys/${options.slug}`);

  return compact({
    '@type': 'Person',
    '@id': `${url}#person`,
    name: options.name,
    url,
    image: options.imageUrl,
    email: options.email,
    jobTitle: 'Attorney',
    worksFor: { '@id': organizationId(options.site) },
    knowsAbout: options.knowsAbout,
    description: options.description,
    mainEntityOfPage: `${url}#webpage`,
  });
}

export function serviceNode(options: {
  site: URL | string;
  slug: string;
  name: string;
  description: string;
  services?: string[];
}): JsonLdNode {
  const url = absoluteUrl(options.site, `/practice-areas/${options.slug}`);

  return compact({
    '@type': 'Service',
    '@id': `${url}#service`,
    name: options.name,
    serviceType: options.name,
    description: options.description,
    url,
    provider: { '@id': organizationId(options.site) },
    areaServed: {
      '@type': 'City',
      name: 'Portland',
      containedInPlace: { '@type': 'State', name: 'Oregon' },
    },
    hasOfferCatalog:
      options.services && options.services.length > 0
        ? {
            '@type': 'OfferCatalog',
            name: `${options.name} services`,
            itemListElement: options.services.map((service) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: service,
              },
            })),
          }
        : undefined,
  });
}

export function faqPageNode(options: {
  url: string;
  faqs: { question: string; answer: string }[];
}): JsonLdNode | null {
  if (options.faqs.length === 0) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${options.url}#faq`,
    mainEntity: options.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function itemListNode(options: {
  id: string;
  name: string;
  items: { name: string; url: string }[];
}): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': options.id,
    name: options.name,
    numberOfItems: options.items.length,
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function articleNode(options: {
  site: URL | string;
  slug: string;
  headline: string;
  description: string;
  practiceArea: string;
  practiceAreaSlug: string;
}): JsonLdNode {
  const url = absoluteUrl(options.site, `/case-studies/${options.slug}`);
  const practiceAreaUrl = absoluteUrl(
    options.site,
    `/practice-areas/${options.practiceAreaSlug}`,
  );

  return compact({
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: options.headline,
    description: options.description,
    url,
    inLanguage: 'en-US',
    author: { '@id': organizationId(options.site) },
    publisher: { '@id': organizationId(options.site) },
    mainEntityOfPage: `${url}#webpage`,
    about: {
      '@type': 'Service',
      '@id': `${practiceAreaUrl}#service`,
      name: options.practiceArea,
      url: practiceAreaUrl,
    },
  });
}

function mainEntityFromExtras(
  pageType: string,
  extras: JsonLdNode[],
  orgId: string,
): JsonLdNode | undefined {
  const ofType = (type: string) =>
    extras.find((node) => {
      const value = node['@type'];
      return value === type || (Array.isArray(value) && value.includes(type));
    });

  if (pageType === 'ProfilePage') {
    const person = ofType('Person');
    return person?.['@id'] ? { '@id': person['@id'] } : person;
  }
  if (pageType === 'CollectionPage') {
    const list = ofType('ItemList');
    return list?.['@id'] ? { '@id': list['@id'] } : list;
  }
  if (pageType === 'ContactPage' || pageType === 'AboutPage') {
    return { '@id': orgId };
  }

  const service = ofType('Service');
  if (service?.['@id']) return { '@id': service['@id'] };

  const article = ofType('Article');
  if (article?.['@id']) return { '@id': article['@id'] };

  const list = ofType('ItemList');
  if (list?.['@id']) return { '@id': list['@id'] };

  return undefined;
}

export function buildJsonLdGraph(options: {
  site: URL | string;
  pathname: string;
  title: string;
  description: string;
  organization: {
    name: string;
    description: string;
    telephone: string;
    email: string;
    fax?: string;
    addressLines: string[];
    mapUrl?: string;
    sameAs?: string[];
    logoUrl: string;
    imageUrl: string;
  };
  pageType?: string;
  breadcrumbLabel?: string;
  breadcrumbs?: Breadcrumb[];
  extra?: JsonLdNode | JsonLdNode[] | null;
}): JsonLdNode {
  const extras = [options.extra ?? []]
    .flat()
    .filter((node): node is JsonLdNode => Boolean(node));
  const pageType = options.pageType ?? inferPageType(options.pathname);
  const url = absoluteUrl(options.site, normalizePath(options.pathname));
  const crumbs =
    options.breadcrumbs ??
    breadcrumbsFromPath(options.pathname, options.breadcrumbLabel);
  const org = organizationNode({
    site: options.site,
    ...options.organization,
  });
  const page = webPageNode({
    site: options.site,
    url,
    title: options.title,
    description: options.description,
    pageType,
    imageUrl: options.organization.imageUrl,
    breadcrumbs: crumbs,
    mainEntity: mainEntityFromExtras(
      pageType,
      extras,
      organizationId(options.site),
    ),
  });
  const breadcrumbs = breadcrumbListNode({
    url,
    site: options.site,
    crumbs,
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      websiteNode({ site: options.site, name: options.organization.name }),
      page,
      breadcrumbs,
      ...extras,
    ].filter(Boolean),
  };
}

export function serializeJsonLd(data: JsonLdNode): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
