import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/posts" }),
    schema: z.object({
        id: z.number(),
        title: z.string(),
        date: z.coerce.date(),
        updated: z.coerce.date().optional(),
        author: z.string(),
        excerpt: z.string(),
        permalink: z.string(),
        image: z.string().optional(),
        categories: z.array(z.string()).optional().default([]),
        tags: z.array(z.string()).optional().default([]),
        draft: z.boolean().optional().default(false),
    })
});

export const collections = { posts };
