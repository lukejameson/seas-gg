<script>
	import { page } from '$app/stores';
	import { Chart } from 'chart.js/auto';
	import { format } from 'date-fns';

	/** @type {{hourlyTides: TideData[], dailyStaticUrl: string}}*/
	let props = $props();

	/** @type {import("chart.js").ChartItem} */
	let canvas;

	/** @type {Chart<keyof import("chart.js").ChartTypeRegistry, number[], string>} */
	let chartInstance;

	/** @type {any}*/
	let config;

	/** @type {boolean}*/
	let hasChartLoaded = $state(false);

	function getLabel() {
		return `Tides for ${format(new Date($page.data.date), 'yyyy-MM-dd')}`;
	}

	const formatDailyDataset = () => ({
		labels: props.hourlyTides.map((x) => x.time),
		datasets: [
			{
				label: 'Daily Tide Height',
				data: props.hourlyTides.map((x) => x.height),
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.1,
				pointRadius: 5,
				pointHoverRadius: 7
			}
		]
	});

	$effect(() => {
		config = {
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

		updateChart();

		if (chartInstance && $page.data.date) {
			chartInstance.options.plugins.title.text = getLabel();
			chartInstance.update('none');
		}
	});

	function updateChart() {
		if (chartInstance) {
			chartInstance.data = formatDailyDataset();
			chartInstance.update('none');
		}
	}

	/**@param {any} node*/
	function myAction(node) {
		$effect(() => {
			chartInstance = new Chart(canvas, config);
			return () => chartInstance.destroy();
		});
	}
</script>

<canvas class="p-0" use:myAction bind:this={canvas}></canvas>
