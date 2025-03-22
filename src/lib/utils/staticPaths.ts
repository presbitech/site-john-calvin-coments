import fs from 'fs';
import path from 'path';

/**
 * Generates all possible URL paths for static site generation
 * This scans the content directory and creates appropriate slug patterns for:
 * - Base content files (e.g., getting-started.md)
 * - Book chapters (e.g., genesis/1)
 * - Individual verses (e.g., genesis/1/1)
 * 
 * @returns Array of objects with slug property representing all possible content paths
 */
export function generateStaticPaths() {
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
}
