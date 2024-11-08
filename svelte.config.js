import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true, // Enable precompression
			envPrefix: '',
			polyfill: true
		}),
		// Add proper asset handling
		files: {
			assets: 'static'  // Directory for your static assets
		},
		// Ensure proper static asset paths
		paths: {
			base: '' // Update this if your app is not served from root
		},
		// Add proper asset configuration
		inlineStyleThreshold: 0, // Force CSS to separate files
		// Configure static asset handling
		serviceWorker: {
			register: false // Disable service worker for now until MIME issues are resolved
		}
	},
};

export default config;