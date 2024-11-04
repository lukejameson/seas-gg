<script>
	import { page } from '$app/stores';
	import { Chart } from 'chart.js/auto';
	import { format } from 'date-fns';
	import { onMount } from 'svelte';

	/** @type {TideData[]} */
	export let hourlyTides;

	/** @type {import("chart.js").ChartItem} */
	let canvas;

	/** @type {Chart<keyof import("chart.js").ChartTypeRegistry, number[], string>} */
	let chartInstance;

	function getLabel() {
		return `Tides for ${format(new Date($page.data.date), 'yyyy-MM-dd')}`;
	}

	const formatDailyDataset = () => ({
		labels: hourlyTides.map((x) => x.time),
		datasets: [
			{
				label: 'Daily Tide Height',
				data: hourlyTides.map((x) => x.height),
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.1,
				pointRadius: 5,
				pointHoverRadius: 7
			}
		]
	});

	$: config = {
		type: 'line',
		data: formatDailyDataset(),
		options: {
			responsive: true,
			animation: false,
			plugins: {
				title: {
					display: true,
					text: getLabel()
				},
				legend: { display: false }
			},
			scales: {
				y: {
					grid: { display: false },
					min: 0,
					suggestedMax: 10
				},
				x: {
					grid: { display: false },
					ticks: {
						maxRotation: 60,
						minRotation: 60
					}
				}
			}
		}
	};

	function updateChart() {
		if (chartInstance) {
			chartInstance.data = formatDailyDataset();
			chartInstance.update('none');
		}
	}

	// Update chart data when hourlyTides changes
	$: if (hourlyTides) {
		updateChart();
	}

	$: if (chartInstance && $page.data.date) {
		chartInstance.options.plugins.title.text = getLabel();
		chartInstance.update('none');
	}
	onMount(() => {
		chartInstance = new Chart(canvas, config);
		return () => chartInstance.destroy();
	});
</script>

<canvas class="p-0" bind:this={canvas}></canvas>
