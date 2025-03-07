import type { LayoutServerLoad } from './$types';
import fs from 'fs';
import path from 'path';

function getFiles(dir: string, baseDir: string): any[] {
    try {
        const items = fs.readdirSync(dir);
        const result: any[] = [];

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            const relativePath = path.relative(baseDir, fullPath);

            if (stat.isDirectory()) {
                // Recursively get files and folders inside this directory
                const children = getFiles(fullPath, baseDir);
                result.push({
                    name: item,
                    path: '/' + relativePath,
                    isDirectory: true,
                    children: children
                });
            } else if (item.endsWith('.md')) {
                result.push({
                    name: item,
                    path: '/' + relativePath.replace(/\.md$/, ''),
                    isDirectory: false
                });
            }
        }

        return result.sort((a, b) => {
            if (a.isDirectory === b.isDirectory) {
                return a.name.localeCompare(b.name);
            }
            return a.isDirectory ? -1 : 1;
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

export const load = (async () => {
    const contentDir = path.join(process.cwd(), 'content');
    
    // Create content directory if it doesn't exist
    if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
    }

    const files = getFiles(contentDir, contentDir);
    return {
        files
    };
}) satisfies LayoutServerLoad;
