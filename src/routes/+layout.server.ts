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
                    name: item.replace(/\.md$/, ''), // Remove .md extension from the name
                    path: '/' + relativePath.replace(/\.md$/, ''),
                    isDirectory: false
                });
            }
        }

        // Natural sort implementation
        return result.sort((a, b) => {
            // First sort by directory/file (directories first)
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            
            // Natural sort for same types (both files or both directories)
            return naturalSort(a.name, b.name);
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

// Natural sort function that correctly handles numeric values within strings
function naturalSort(a: string, b: string): number {
    const aParts = a.split(/(\d+)/).filter(Boolean);
    const bParts = b.split(/(\d+)/).filter(Boolean);
    
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        // If both parts are numeric
        if (/^\d+$/.test(aParts[i]) && /^\d+$/.test(bParts[i])) {
            const aNum = parseInt(aParts[i], 10);
            const bNum = parseInt(bParts[i], 10);
            if (aNum !== bNum) {
                return aNum - bNum;
            }
        } 
        // If one is numeric and the other is not
        else if (/^\d+$/.test(aParts[i]) && !/^\d+$/.test(bParts[i])) {
            return -1; // Numbers come before strings
        }
        else if (!/^\d+$/.test(aParts[i]) && /^\d+$/.test(bParts[i])) {
            return 1; // Strings come after numbers
        }
        // Both are strings
        else if (aParts[i] !== bParts[i]) {
            return aParts[i].localeCompare(bParts[i]);
        }
    }
    
    // If we get here, the common parts are the same, so the shorter one comes first
    return aParts.length - bParts.length;
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
