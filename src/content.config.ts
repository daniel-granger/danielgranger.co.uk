import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    categories: z.array(z.string()).max(3).optional(),
    tags: z.array(z.string()).max(3).optional(),
    /** Path relative to /public/ (e.g. /uploads/my-post/cover.jpg) or an absolute URL */
    image: z.string().optional(),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string(),
    tags: z.array(z.string()).max(3).optional(),
    is_featured: z.boolean().default(false),
    /** Path relative to /public/ (e.g. /uploads/my-item/cover.jpg) or an absolute URL */
    image: z.string().optional(),
  }),
});

export const collections = { blog, portfolio };
