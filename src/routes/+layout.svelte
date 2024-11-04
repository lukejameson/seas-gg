<script>
	/** @type {import('./$types').LayoutData} */
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { initBootstrap } from '$lib/bootstrap';
	import img from '$lib/images/favicon.svg';
	import '$lib/styles/global.css';
	import '$lib/styles/layout.css';
	import '../app.css';

	onMount(() => {
		if (browser) {
			initBootstrap();
		}
	});
</script>

<div class="body">
	<div class="header p-3 d-flex align-items-center justify-content-start">
		<img width="48px" height="48px" src={img} alt="" />

		<div class="pl-4">Guernsey Tides</div>
	</div>

	<div class="wave-background">
		<svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
			<path d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z" style="stroke: none; fill:#e8f4f8;"
			></path>
		</svg>
	</div>

	<slot></slot>
</div>
