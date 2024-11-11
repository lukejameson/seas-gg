<script>
	/** @type {import('./$types').LayoutData} */
	import { browser } from '$app/environment';
	import { initBootstrap } from '$lib/bootstrap.js';
	import { onMount } from 'svelte';

	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';
	import Icon from '$lib/components/+Icon.svelte';

	onMount(() => {
		if (browser) {
			initBootstrap();
		}
	});
</script>

<div class="body">
	<div class="header p-3 d-flex align-items-center justify-content-start">
		<!-- <img width="48px" src={img} alt="" /> -->
		<div class="logo">
			<Icon name="water" size="42px"></Icon>
			<span class="icon-text">seas.gg</span>
		</div>

		<div class="pl-4" style="display:none">Guernsey Tides</div>
	</div>

	<div class="wave-background">
		<svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
			<path d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z" style="stroke: none; fill:#e8f4f8;"
			></path>
		</svg>
	</div>

	<slot></slot>

	<div class="footer">
		<div class="d-flex justify-content-center w-100 h-100">
			<div class="d-flex align-items-center gap-3">
				<a
					href="https://github.com/lukejameson"
					target="_blank"
					data-bs-toggle="tooltip"
					data-bs-placement="top"
					aria-label="GitHub"
				>
					<Icon name="github" size="1.8rem"></Icon>
				</a>
				<a href="https://www.instagram.com/lukej_ameson/" target="_blank" aria-label="Instagram">
					<Icon name="instagram" size="1.8rem"></Icon>
				</a>
				<a href="https://lukejameson.gg" target="_blank" aria-label="Portfolio">
					<Icon name="browser" size="1.8rem"></Icon>
				</a>
				<a href="mailto:lukejameson@live.co.uk" target="_blank" aria-label="Email">
					<Icon name="envelope" size="1.8rem"></Icon>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.footer {
		position: absolute;
		left: 0;
		z-index: 3;
		bottom: 0;
		width: 100%;
		height: 64px;
		background-color: #e8f4f8;
		box-shadow: 0 2px 10px -1px #e8f4f8;
	}

	a {
		padding: 8px;
		color: black;
		transition: transform 0.3s ease;
	}

	a:hover {
		color: #0066cc;
		transform: scale(1.2);
		will-change: transform;
	}

	.icon-text {
		font-family: 'Chango', sans-serif;
		font-weight: 400;
		/* font-size: 24px; */
		font-style: normal;
		color: #0066cc;
	}
</style>
