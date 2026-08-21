import { getCollection } from 'astro:content';

export async function getPublishedCaseStudies() {
  return (await getCollection('caseStudies'))
    .filter((entry) => entry.data.published)
    .sort((a, b) => a.data.order - b.data.order);
}

export async function hasPublishedCaseStudies() {
  const studies = await getCollection('caseStudies');
  return studies.some((entry) => entry.data.published);
}
