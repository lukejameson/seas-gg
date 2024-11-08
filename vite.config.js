import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['bootstrap', 'chart.js']
	},
	optimizeDeps: {
		include: ['bootstrap','canvas']
	},
	server: {
		host: '0.0.0.0', // This allows external connections
		port: 3000 // Default port, you can change it
	},
	css: {
		devSourcemap: false
	}
});
