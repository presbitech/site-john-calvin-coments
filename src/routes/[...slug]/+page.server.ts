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
    // First try in the regular content directory
    const contentPath = path.join(process.cwd(), 'content', `${slug}.md`);
    
    // If we're in a build environment, also check for content in the build directory
    const buildContentPath = path.join(process.cwd(), 'build', 'content', `${slug}.md`);
    
    try {
        let rawContent;
        
        // First check if file exists in the regular content path
        if (fs.existsSync(contentPath)) {
            rawContent = fs.readFileSync(contentPath, 'utf-8');
        } 
        // If not, check if it exists in the build content path
        else if (fs.existsSync(buildContentPath)) {
            rawContent = fs.readFileSync(buildContentPath, 'utf-8');
        }
        // If neither exist, throw a 404
        else {
            throw error(404, `Could not find ${slug}`);
        }

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
