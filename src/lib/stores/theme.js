import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// Initialize with system preference or stored preference
function createThemeStore() {
	const defaultTheme = 'light';

	let initialTheme = defaultTheme;

	if (browser) {
		// Check localStorage first
		const stored = localStorage.getItem('seas-gg-theme');
		if (stored) {
			initialTheme = stored;
		} else {
			// Fall back to system preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			initialTheme = prefersDark ? 'dark' : 'light';
		}
	}

	const { subscribe, set, update } = writable(initialTheme);

	return {
		subscribe,
		set: (/** @type {string} */ theme) => {
			if (browser) {
				localStorage.setItem('seas-gg-theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
			}
			set(theme);
		},
		toggle: () => {
			update((currentTheme) => {
				const newTheme = currentTheme === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('seas-gg-theme', newTheme);
					document.documentElement.setAttribute('data-theme', newTheme);
				}
				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();
