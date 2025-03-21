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

// This function generates all possible URL paths for static site generation
export const entries = () => {
  console.log('Generating static paths for all content...');
  const contentDir = path.join(process.cwd(), 'content');
  
  if (!fs.existsSync(contentDir)) {
    console.warn('Content directory does not exist at:', contentDir);
    return [];
  }
  
  const paths = [];
  
  // Add the base content files (like getting-started.md)
  const baseContentFiles = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))
    .map(file => ({ slug: file.replace('.md', '') }));
  
  paths.push(...baseContentFiles);
  
  // Process directories like 'genesis'
  const directories = fs.readdirSync(contentDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const dir of directories) {
    const dirPath = path.join(contentDir, dir);
    
    // Get all chapter files (like genesis/1.md)
    const chapterFiles = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const chapter = file.replace('.md', '');
        return { 
          slug: `${dir}/${chapter}` 
        };
      });
    
    paths.push(...chapterFiles);
    
    // Add paths with verse numbers (like genesis/1/1)
    // Note: This is simplified - ideally we would parse each MD file to find actual verses
    const chapterWithVerses = chapterFiles.flatMap(({ slug }) => {
      // Just create entries for first 30 verses of each chapter for simplicity
      return Array.from({ length: 30 }, (_, i) => ({
        slug: `${slug}/${i + 1}`
      }));
    });
    
    paths.push(...chapterWithVerses);
  }
  
  console.log(`Generated ${paths.length} static paths`);
  return paths;
};

export const load = (async ({ params }) => {
    const { slug } = params;
    console.log('Loading slug:', slug); // Log the raw slug
    
    // Handle nested paths (e.g., "genesis/1/1")
    const pathParts = slug.split('/');
    console.log('Path parts:', pathParts); // Log the path parts
    
    let filePath;
    
    // Keep the original case for the book name
    const bookName = pathParts[0];
    console.log('Book name:', bookName); // Log the book name
    
    // For paths like "genesis/1/1", we need "genesis/1.md"
    // We don't care about the verse (pathParts[2]) for file resolution
    if (pathParts.length >= 2) {
        filePath = path.join(bookName, `${pathParts[1]}.md`);
    } else {
        filePath = `${slug}.md`;
    }
    console.log('File path:', filePath); // Log the constructed file path
    
    // First try in the regular content directory
    const contentPath = path.join(process.cwd(), 'content', filePath);
    
    // If we're in a build environment, also check for content in the build directory
    const buildContentPath = path.join(process.cwd(), 'build', 'content', filePath);
    
    try {
        let rawContent;
        console.log('Trying paths:', { contentPath, buildContentPath, slug, pathParts }); // Debug log
        
        // Check if the content directory exists
        console.log('Content dir exists?', fs.existsSync(path.join(process.cwd(), 'content')));
        console.log('Build content dir exists?', fs.existsSync(path.join(process.cwd(), 'build', 'content')));
        
        // Check if genesis directory exists
        console.log('genesis dir exists?', fs.existsSync(path.join(process.cwd(), 'content', 'genesis')));
        console.log('Build genesis dir exists?', fs.existsSync(path.join(process.cwd(), 'build', 'content', 'genesis')));
        
        // Now check if the specific chapter file exists
        console.log('Chapter file exists?', fs.existsSync(contentPath));
        console.log('Build chapter file exists?', fs.existsSync(buildContentPath));
        
        // First check if file exists in the regular content path
        if (fs.existsSync(contentPath)) {
            console.log('Found file in content path');
            rawContent = fs.readFileSync(contentPath, 'utf-8');
        } 
        // If not, check if it exists in the build content path
        else if (fs.existsSync(buildContentPath)) {
            console.log('Found file in build content path');
            rawContent = fs.readFileSync(buildContentPath, 'utf-8');
        }
        // If neither exist, throw a 404
        else {
            console.log('File not found in either location:', { contentPath, buildContentPath }); // Debug log
            throw error(404, `Could not find ${slug}`);
        }

        const content = await marked(rawContent); // Transform Markdown to HTML

        // Format title nicely with capitalized book name for display
        const displayBookName = bookName.charAt(0).toUpperCase() + bookName.slice(1).toLowerCase();

        // If we have a verse number (pathParts[2]), we could potentially scroll to it
        // This would require adding an anchor in the markdown or processing the content
        return {
            content,
            slug,
            title: pathParts.length > 1 
                ? `${displayBookName} ${pathParts[1]}${pathParts[2] ? ':' + pathParts[2] : ''}`
                : pathParts[0]?.replace(/-/g, ' ') || slug,
            verse: pathParts[2] // Pass the verse number if it exists
        };
    } catch (e) {
        console.error(`Error loading content for ${slug}:`, e);
        throw error(404, `Could not find ${slug}`);
    }
}) satisfies PageServerLoad;
