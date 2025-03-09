import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import mdsvexConfig from './mdsvex.config.js';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			handleMissingId: 'warn',
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore 404s from content pages
				if (path.endsWith('.md')) {
					return;
				}
				
				// Otherwise, fail the build
				throw new Error(message);
			}
		},
		paths: {
			// Update this to match your GitHub repository name
			base: '' //process.env.NODE_ENV === 'production' ? '/site-john-calvin-coments' : ''
		}
	},
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess({
			script: {
				runes: true
			}
		}),
		mdsvex(mdsvexConfig)
	]
};

export default config;
