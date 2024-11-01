<script>
	/** @type {import('./$types').LayoutData} */
	import img from '$lib/images/favicon.svg';
	import '../app.css';
	import '$lib/styles/layout.css';
</script>

<div class="body">
	<div class="header">
		<img class="page-icon" src={img} alt="" />

		<div class="title">
			<h4>GG Tides</h4>
		</div>
	</div>

	<div class="wave-background">
		<svg viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet">
			<path d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z" style="stroke: none; fill:#e8f4f8;"></path>
		</svg>
	</div>bar

	<slot></slot>
</div>
