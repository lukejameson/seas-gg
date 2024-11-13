<script>
	/** @type {import('./$types').LayoutData} */
	import { browser } from '$app/environment';
	import { initBootstrap } from '$lib/bootstrap.js';
	import { onMount } from 'svelte';
	import Modal from '$lib/components/+Modal.svelte';

	import 'bootstrap/dist/css/bootstrap.min.css';
	import '../app.css';
	import Icon from '$lib/components/+Icon.svelte';

	let showModal = $state(false);

	let { children } = $props();

	onMount(() => {
		if (browser) {
			initBootstrap();
		}
	});
</script>

<div class="body">
	<div class="header p-3 d-flex align-items-center justify-content-start">
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

	{@render children()}

	<div class="footer">
		<div>
			<div class="d-flex justify-content-center w-100 h-100">
				<div class="d-flex align-items-center gap-2">
					<a href="https://www.instagram.com/lukej_ameson/" target="_blank" aria-label="Instagram">
						<Icon name="instagram" size="1.4rem"></Icon>
					</a>
					<a href="https://lukejameson.gg" target="_blank" aria-label="Portfolio">
						<Icon name="browser" size="1.4rem"></Icon>
					</a>
					<a href="mailto:lukejameson@live.co.uk" target="_blank" aria-label="Email">
						<Icon name="envelope" size="1.4rem"></Icon>
					</a>
				</div>
			</div>
			<div class="d-flex flex-fill justify-content-center">
				<button
					type="button"
					aria-label="Terms and Conditions"
					class="no-style"
					onclick={() => (showModal = true)}
				>
					T&Cs
				</button>
			</div>
		</div>
	</div>

	<Modal bind:showModal>
		{#snippet header()}
			<h2>Terms & Conditions</h2>
		{/snippet}

		<p>
			This is a free resource created for sea swimmers and bathing pool enthusiasts. Commercial use
			isn't permitted.
		</p>

		<section class="data-disclaimer">
			<h4>Data Disclaimer</h4>
			<p>
				Our tide predictions are estimates and shouldn't be used for critical decisions. Weather
				conditions, currents, and other factors can affect actual water conditions.
			</p>
		</section>

		<section class="safety-notice">
			<h4>Safety Information</h4>
			<p>Users swim at their own risk and should always:</p>
			<ul>
				<li>Check local weather conditions</li>
				<li>Never swim alone</li>
				<li>Follow local safety guidelines</li>
				<li>Be aware of changing conditions</li>
			</ul>
		</section>

		<section class="liability">
			<h4>Liability Notice</h4>
			<p>
				We don't accept liability for any loss or damage arising from the use of this website. Data
				accuracy is not guaranteed. For official tide information, please consult local maritime
				authorities.
			</p>
		</section>
	</Modal>
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

	@media only screen and (max-height: 864px) {
		.footer {
			position: sticky;
		}
	}

	a {
		padding: 4px;
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

	.no-style {
		background-color: transparent !important;
		border: none !important;
	}

	.no-style:hover {
		color: #0066cc !important;
	}
</style>
