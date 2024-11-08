import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['bootstrap', 'chart.js']
	},
	optimizeDeps: {
		include: ['bootstrap']
	},
	server: {
		host: '0.0.0.0',
		port: 5000
	},
	css: {
		devSourcemap: false
	},
	build: {
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name][extname]',
				chunkFileNames: 'assets/[name]-[hash].js',
				entryFileNames: 'assets/[name]-[hash].js'
			}
		},
		// Ensure proper MIME types for different file types
		assetsInlineLimit: 0, // Prevents inlining of small assets
		sourcemap: false
	}
});
