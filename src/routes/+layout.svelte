<script>
	import { browser } from '$app/environment';
	import Icon from '$lib/components/+Icon.svelte';
	import { theme } from '$lib/stores/theme.js';
	import { onMount } from 'svelte';
	import '$lib/styles/styles.css';
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
		<div class="logo pl-3">
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
	{@render children()}
	<footer class="border-t py-5">
		<div class="container flex items-center justify-between gap-4">
			<p class="text-sm text-muted-foreground">
				&copy; {new Date().getFullYear()} seas.gg<span class="hidden sm:inline">
					— A <a
						href="https://gyslabs.gg"
						target="_blank"
						rel="noopener noreferrer"
						class="underline underline-offset-4 hover:text-foreground transition-colors">GYSLabs</a
					> project</span
				>.
			</p>
			<div class="flex items-center gap-4 text-sm text-muted-foreground">
				<span class="sm:hidden">
					<a
						href="https://gyslabs.gg"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-foreground transition-colors">GYSLabs</a
					>
				</span>
			</div>
		</div>
	</footer>
</div>

<style>
	.icon-text {
		font-family: 'Chango', sans-serif;
		font-weight: 400;
		font-style: normal;
		color: #0066cc;
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
