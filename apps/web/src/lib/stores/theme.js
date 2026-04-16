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
		}
	}

	const { subscribe, set, update } = writable(initialTheme);

	return {
		subscribe,
		set: (/** @type {string} */ theme) => {
			if (browser) {
				localStorage.setItem('seas-gg-theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
				document.documentElement.classList.toggle('dark', theme === 'dark');
			}
			set(theme);
		},
		toggle: () => {
			update((currentTheme) => {
				const newTheme = currentTheme === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('seas-gg-theme', newTheme);
					document.documentElement.setAttribute('data-theme', newTheme);
					document.documentElement.classList.toggle('dark', newTheme === 'dark');
				}
				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();
