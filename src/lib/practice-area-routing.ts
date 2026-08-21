import type { CollectionEntry } from 'astro:content';

const FORMSPARK_ORIGIN = 'https://submit-form.com';

export function formsparkEndpoint(formId: string): string {
  return `${FORMSPARK_ORIGIN}/${formId}`;
}

/** Attorney work email → Formspark form ID. */
export const ATTORNEY_FORMSPARK_FORMS: Record<string, string> = {
  'robert@eoplaw.com': 'ZlDVhAQTG',
  'john@eoplaw.com': 'wWAm81dJY',
  'joel@eoplaw.com': '4vG5chyjF',
  'jerry@eoplaw.com': 'yeDkd41sS',
  'jennifer@eoplaw.com': 'bzmC9KlR9',
  'greg@eoplaw.com': 'mLNZKd9sl',
  'billd@eoplaw.com': 'NTzrpc4Lj',
};

/** Named-partner intake when the visitor is not sure which practice area applies. */
export const OTHER_INTAKE_EMAILS = [
  'jerry@eoplaw.com',
  'john@eoplaw.com',
  'robert@eoplaw.com',
];

export type RoutedAttorney = {
  name: string;
  email: string;
  formId: string;
};

export type PracticeAreaRoute = {
  id: string;
  title: string;
  attorneys: RoutedAttorney[];
};

/**
 * Practice area content id → attorney emails that should receive those inquiries.
 */
export const PRACTICE_AREA_RECIPIENTS: Record<string, string[]> = {
  'affordable-housing-development-financing': [
    'jerry@eoplaw.com',
    'jennifer@eoplaw.com',
  ],
  'business-finance': [
    'jerry@eoplaw.com',
    'jennifer@eoplaw.com',
    'robert@eoplaw.com',
  ],
  employment: ['john@eoplaw.com'],
  'entertainment-new-technologies': ['greg@eoplaw.com'],
  insurance: ['joel@eoplaw.com', 'john@eoplaw.com'],
  'intellectual-property': ['greg@eoplaw.com'],
  'litigation-appellate-practices': [
    'john@eoplaw.com',
    'billd@eoplaw.com',
    'joel@eoplaw.com',
  ],
  'real-estate': ['jerry@eoplaw.com', 'jennifer@eoplaw.com'],
  'tax-estate-planning': ['robert@eoplaw.com'],
};

export function attorneyMatchesPracticeArea(
  attorney: Pick<CollectionEntry<'attorneys'>['data'], 'practiceAreas' | 'specialty' | 'email'>,
  practiceArea: { id: string; title: string },
): boolean {
  const configured = PRACTICE_AREA_RECIPIENTS[practiceArea.id];
  if (configured) {
    return configured.includes(attorney.email.toLowerCase());
  }

  const title = practiceArea.title.toLowerCase();
  const firstWord = title.split(/\s+/)[0] ?? '';
  return (attorney.practiceAreas ?? []).some(
    (practiceAreaName) =>
      title.includes(practiceAreaName.toLowerCase()) ||
      practiceAreaName.toLowerCase().includes(firstWord),
  );
}

function sortAttorneysByEmailOrder(
  attorneys: CollectionEntry<'attorneys'>[],
  emails: string[],
): CollectionEntry<'attorneys'>[] {
  const order = new Map(emails.map((email, index) => [email.toLowerCase(), index]));
  return attorneys
    .filter((attorney) => order.has(attorney.data.email.toLowerCase()))
    .sort(
      (a, b) =>
        (order.get(a.data.email.toLowerCase()) ?? 100) -
        (order.get(b.data.email.toLowerCase()) ?? 100),
    );
}

export function toRoutedAttorney(
  attorney: CollectionEntry<'attorneys'>,
): RoutedAttorney | null {
  const email = attorney.data.email.toLowerCase();
  const formId = ATTORNEY_FORMSPARK_FORMS[email];
  if (!formId) return null;
  return {
    name: attorney.data.name,
    email: attorney.data.email,
    formId,
  };
}

export function attorneysForPracticeArea(
  attorneys: CollectionEntry<'attorneys'>[],
  practiceArea: { id: string; title: string },
): CollectionEntry<'attorneys'>[] {
  const configured = PRACTICE_AREA_RECIPIENTS[practiceArea.id]?.map((email) =>
    email.toLowerCase(),
  );

  if (configured) {
    return sortAttorneysByEmailOrder(attorneys, configured);
  }

  return attorneys
    .filter((attorney) => attorneyMatchesPracticeArea(attorney.data, practiceArea))
    .sort((a, b) =>
      a.data.name.split(' ')[0].localeCompare(b.data.name.split(' ')[0]),
    );
}

export function buildPracticeAreaRoutes(
  practiceAreas: CollectionEntry<'practiceAreas'>[],
  attorneys: CollectionEntry<'attorneys'>[],
): PracticeAreaRoute[] {
  return practiceAreas
    .slice()
    .sort((a, b) => a.data.title.localeCompare(b.data.title))
    .map((area) => ({
      id: area.id,
      title: area.data.title,
      attorneys: attorneysForPracticeArea(attorneys, {
        id: area.id,
        title: area.data.title,
      })
        .map(toRoutedAttorney)
        .filter((attorney): attorney is RoutedAttorney => attorney !== null),
    }));
}

export function buildOtherIntakeRoute(
  attorneys: CollectionEntry<'attorneys'>[],
): PracticeAreaRoute {
  return {
    id: 'other',
    title: 'Other / Not Sure',
    attorneys: sortAttorneysByEmailOrder(attorneys, OTHER_INTAKE_EMAILS)
      .map(toRoutedAttorney)
      .filter((attorney): attorney is RoutedAttorney => attorney !== null),
  };
}

export function buildInquiryRouting(
  practiceAreas: CollectionEntry<'practiceAreas'>[],
  attorneys: CollectionEntry<'attorneys'>[],
): Record<string, PracticeAreaRoute> {
  const routes = buildPracticeAreaRoutes(practiceAreas, attorneys);
  const other = buildOtherIntakeRoute(attorneys);
  return Object.fromEntries([...routes, other].map((route) => [route.id, route]));
}

