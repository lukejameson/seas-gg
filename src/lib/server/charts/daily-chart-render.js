import { createCanvas } from 'canvas';
import { Chart } from 'chart.js';
import { format } from 'date-fns';

/**
 *
 * @param {TideData[]} hourlyTides
 * @param {Date} date
 */

export async function renderStaticTideChart(hourlyTides, date) {
	const canvas = createCanvas(800, 400);

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

	const config = {
		type: 'line',
		data: formatDailyDataset(),
		options: {
			responsive: true,
			animation: false,
			plugins: {
				title: {
					display: true,
					text: `Tides for ${format(date, 'yyyy-MM-dd')}`
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

	// @ts-ignore
	const chart = new Chart(canvas.getContext('2d'), config);

	const dataUrl = canvas.toDataURL();

	chart.destroy();

	return dataUrl;
}
