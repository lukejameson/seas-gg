<script>
	import { browser } from '$app/environment';
	import Icon from '$lib/components/+Icon.svelte';
	import { theme } from '$lib/stores/theme.js';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', $theme);
		}
	});

	$effect(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', $theme);
		}
	});
</script>

<div class="body">
	<div class="header">
		<div class="logo pl-3 d-flex align-items-center gap-2">
			<Icon name="water" size="42px"></Icon>
			<span class="icon-text">seas.gg</span>
		</div>
		<div
			class="pb-2 pr-3"
			data-toggle="tooltip"
			data-placement="top"
			title={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<div>
				<button aria-label="Toggle theme" onclick={() => theme.toggle()}>
					{#if $theme === 'dark'}
						<Icon name="sun" size="24px"></Icon>
					{:else}
						<Icon name="moon" size="24px"></Icon>
					{/if}
				</button>
			</div>
		</div>
	</div>
	<div class="wave-background">
		<svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
			<path
				d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z"
				style="stroke: none; fill:{$theme === 'dark' ? '#1a1a1a' : '#e8f4f8'};"
			></path>
		</svg>
	</div>
	<main class="flex-1">{@render children()}</main>
	<footer class="border-t" style="z-index:100">
		<div class="container footer-inner">
			<p class="text-sm text-muted-foreground">
				&copy; {new Date().getFullYear()} seas.gg — A <a
					href="https://gyslabs.gg"
					target="_blank"
					rel="noopener noreferrer"
					class="underline underline-offset-4 hover:text-foreground transition-colors">GYSLabs</a
				> project
			</p>
		</div>
	</footer>
</div>

<style>
	.icon-text {
		font-family: 'Chango', sans-serif;
		font-weight: 400;
		color: #0066cc;
	}
	.footer-inner {
		text-align: center;
	}
	button {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
	}
</style>
