import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';

// Configure marked options
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
    headerIds: true, // Generate IDs for headings
    mangle: false, // Don't escape HTML
    pedantic: false, // Don't be too strict
    sanitize: false // Don't sanitize HTML
});

export const load = (async ({ params }) => {
    const { slug } = params;
    const contentPath = path.join(process.cwd(), 'content', `${slug}.md`);

    try {
        if (!fs.existsSync(contentPath)) {
            throw error(404, `Could not find ${slug}`);
        }

        const rawContent = fs.readFileSync(contentPath, 'utf-8');
        const content = await marked(rawContent); // Transform Markdown to HTML

        return {
            content,
            slug,
            title: slug.split('/').pop()?.replace(/-/g, ' ') || slug
        };
    } catch (e) {
        console.error(`Error loading content for ${slug}:`, e);
        throw error(404, `Could not find ${slug}`);
    }
}) satisfies PageServerLoad;
