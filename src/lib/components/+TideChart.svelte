<script>
	import { Chart } from 'chart.js/auto';
	import { onMount } from 'svelte';

	/**
	 * @type {TideData[]}
	 */
	export let hourlyTides;
	/**
	 * @type {import("chart.js").ChartItem}
	 */
	let canvas;
	/**
	 * @type {Chart<keyof import("chart.js").ChartTypeRegistry, number[], string>}
	 */
	let chartInstance;

	const formatDataset = () => {
		return {
			labels: hourlyTides.map((x) => x.time),
			datasets: [
				{
					label: 'Tide Height',
					data: hourlyTides.map((x) => x.height),
					fill: false,
					borderColor: 'rgb(75, 192, 192)',
					tension: 0.1,
					pointRadius: 5,
					pointHoverRadius: 7
				}
			]
		};
	};

	const config = {
		type: 'line',
		data: formatDataset(),
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: 'Tidal Range'
				},
				legend: {
					position: 'top'
				}
			},
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	};

	function updateChart() {
		if (chartInstance) {
			chartInstance.data = formatDataset();
			chartInstance.update('none');
		}
	}

	$: if (chartInstance && hourlyTides) {
		updateChart();
	}

	onMount(() => {
		// @ts-ignore
		chartInstance = new Chart(canvas, config);

		return () => {
			chartInstance.destroy();
		};
	});
</script>

<div class="card">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
</style>
