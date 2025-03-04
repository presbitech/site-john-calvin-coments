import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const contentPath = path.join(process.cwd(), 'content', `${slug}.md`);

    try {
        if (!fs.existsSync(contentPath)) {
            throw error(404, `Could not find ${slug}`);
        }

        const content = fs.readFileSync(contentPath, 'utf-8');
        return {
            content,
            slug
        };
    } catch (e) {
        throw error(404, `Could not find ${slug}`);
    }
};
