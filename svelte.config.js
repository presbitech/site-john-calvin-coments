import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import mdsvexConfig from './mdsvex.config.js';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		prerender: {
			handleMissingId: 'warn'
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
