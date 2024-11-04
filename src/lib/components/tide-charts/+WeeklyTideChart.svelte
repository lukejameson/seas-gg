<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-date-fns';

	/** @type {WeeklyTides} */
	export let weeklyTides;

	/** @type {HTMLCanvasElement} */
	let canvas;

	/** @type {Chart} */
	let chartInstance;

	// Watch weeklyTides and update chart when it changes
	$: if (weeklyTides && chartInstance) {
		// @ts-ignore
		chartInstance.data = formatChart();
		// @ts-ignore
		chartInstance.options.scales.x.min = new Date(weeklyTides.startofweekdate);
		// @ts-ignore
		chartInstance.options.scales.x.max = new Date(weeklyTides.endofweekdate);
		// @ts-ignore
		chartInstance.options.plugins.title.text = `Tide Heights: ${new Date(weeklyTides.startofweekdate).toLocaleDateString()} - ${new Date(weeklyTides.endofweekdate).toLocaleDateString()}`;
		chartInstance.update('none');
	}

	const formatData = () =>
		weeklyTides.data
			.flatMap((dayRecord) => {
				if (!dayRecord.tideData) return [];
				return dayRecord.tideData.map((tide) => {
					const dateObj = new Date(dayRecord.date);
					const [hours, minutes] = tide.time.split(':').map((num) => parseInt(num));
					dateObj.setHours(hours, minutes);
					return {
						x: dateObj,
						y: tide.height
					};
				});
			})
			.sort((a, b) => a.x.getTime() - b.x.getTime());

	const formatChart = () => ({
		datasets: [
			{
				type: 'line',
				label: 'Tide Height',
				data: formatData(),
				borderColor: 'rgb(75, 192, 192)',
				tension: 0.5,
				pointRadius: 5,
				pointHoverRadius: 7,
				fill: false
			}
		]
	});

	onMount(() => {
		const config = {
			type: 'line',
			data: formatChart(),
			options: {
				animation: false,
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'hour',
							displayFormats: {
								hour: 'MM/d, HH:mm'
							}
						},
						title: {
							display: false,
							text: 'Date/Time'
						},
						min: new Date(weeklyTides.startofweekdate),
						max: new Date(weeklyTides.endofweekdate)
					},
					y: {
						title: {
							display: false,
							text: 'Height (m)'
						},
						grid: { display: false },
						min: 0,
						suggestedMax: 10,
						ticks: {
							maxRotation: 60,
							minRotation: 60
						}
					}
				},
				plugins: {
					legend: { display: false },
					title: {
						display: true,
						text: `Tide Heights: ${new Date(weeklyTides.startofweekdate).toLocaleDateString()} - ${new Date(weeklyTides.endofweekdate).toLocaleDateString()}`
					}
				}
			}
		};

		// @ts-ignore
		chartInstance = new Chart(canvas, config);
		return () => chartInstance.destroy();
	});
</script>

<canvas class="p-0" bind:this={canvas}></canvas>
