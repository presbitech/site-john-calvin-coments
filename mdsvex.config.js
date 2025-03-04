import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const config = defineConfig({
    extensions: ['.md'],
    smartypants: {
        dashes: 'oldschool'
    },
    remarkPlugins: [
        remarkGfm,
    ],
    rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, {
            behavior: 'wrap'
        }]
    ],
    layout: {
        _: '/src/lib/layouts/MDLayout.svelte'
    }
});

export default config;
