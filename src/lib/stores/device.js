// You can create a store in lib/stores/device.js
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const isMobile = writable(false);

if (browser) {
    // Update on mount
    isMobile.set(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Update on resize
    window.addEventListener('resize', () => {
        isMobile.set(window.innerWidth <= 768); // You can adjust this breakpoint
    });
}