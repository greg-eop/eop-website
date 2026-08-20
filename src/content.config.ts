import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const attorneys = defineCollection({
  loader: glob({
    base: './src/content/attorneys',
    pattern: '**/*.md',
  }),
  schema: z.object({
    name: z.string(),
    practiceAreas: z.array(z.string()).optional(),
    role: z.string().optional(),
    specialty: z.string(),
    photo: z.string().optional(),
    email: z.string().email(),
    order: z.number().int().default(100),
  }),
});

const practiceAreas = defineCollection({
  loader: glob({
    base: './src/content/practice-areas',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    overview: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    clientProblem: z.array(z.string()).default([]),
    faqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),
    order: z.number().int().default(100),
    showCta: z.boolean().default(false),
    ctaDescription: z.string().optional(),
    ctaText: z.string().optional(),
    ctaHref: z.string().optional(),
  }),
});

const caseStudies = defineCollection({
  loader: glob({
    base: './src/content/case-studies',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    practiceArea: z.string(),
    practiceAreaSlug: z.string(),
    clientDescription: z.string(),
    isAnonymized: z.boolean().default(true),
    challenge: z.string(),
    solution: z.string(),
    outcome: z.string(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    quote: z.string().optional(),
    quoteAttribution: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().int().default(100),
  }),
});

export const collections = {
  attorneys,
  practiceAreas,
  caseStudies,
};
