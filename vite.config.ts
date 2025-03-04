import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			experimental: {
				runes: true
			}
		})
	],
	optimizeDeps: {
		exclude: ['@sveltejs/kit']
	},
	server: {
		fs: {
			allow: ['content']
		}
	}
});
