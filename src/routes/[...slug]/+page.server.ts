import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';

// Helper function to create slug-friendly IDs
function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

// Configure marked options with custom heading renderer
const renderer = new marked.Renderer();

// Override heading renderer to add IDs
renderer.heading = function(text, level) {
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
};

marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
    renderer: renderer,
    pedantic: false // Don't be too strict
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
