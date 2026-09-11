import type { CollectionEntry } from 'astro:content';

export type ResolvedPracticeArea = {
  id: string;
  title: string;
  href: string;
};

type PracticeAreaRef = string | { id?: string; slug?: string } | null | undefined;

export function practiceAreaMap(
  entries: CollectionEntry<'practiceAreas'>[],
): Map<string, CollectionEntry<'practiceAreas'>> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

export function practiceAreaRefId(ref: PracticeAreaRef): string | undefined {
  if (typeof ref === 'string') return ref || undefined;
  if (ref && typeof ref === 'object') {
    if (typeof ref.id === 'string' && ref.id) return ref.id;
    if (typeof ref.slug === 'string' && ref.slug) return ref.slug;
  }
  return undefined;
}

export function resolvePracticeAreas(
  refs: PracticeAreaRef[] | undefined,
  byId: Map<string, CollectionEntry<'practiceAreas'>>,
): ResolvedPracticeArea[] {
  return (refs ?? [])
    .map((ref) => {
      const id = practiceAreaRefId(ref);
      return id ? byId.get(id) : undefined;
    })
    .filter((entry): entry is CollectionEntry<'practiceAreas'> => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      title: entry.data.title,
      href: `/practice-areas/${entry.id}`,
    }));
}

export function formatPracticeAreaTitles(
  areas: ResolvedPracticeArea[],
  separator = ', ',
): string {
  return areas.map((area) => area.title).join(separator);
}

export function joinPracticeAreasForTitle(titles: string[]): string {
  if (titles.length <= 1) return titles[0] ?? '';
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
  return `${titles.slice(0, -1).join(', ')}, and ${titles[titles.length - 1]}`;
}
