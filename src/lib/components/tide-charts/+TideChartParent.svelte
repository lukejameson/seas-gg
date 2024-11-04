<script>
	import { applyAction } from '$app/forms';
	import { invalidateAll, pushState } from '$app/navigation';
	import { format, nextMonday } from 'date-fns';
	import WeeklyTideChart from './+WeeklyTideChart.svelte';
	import DailyTideChart from './+DailyTideChart.svelte';

	/** @type {TideData[]} */
	export let hourlyTides;
	/** @type {WeeklyTides} */
	export let weeklyTides;

	/**
	 * @param {Date} date
	 */
	async function fetchWeeklyTides(date) {
		const formattedDate = format(date, 'yyyy-MM-dd');

		// Use SvelteKit's pushState instead of window.history
		await pushState('', { date: formattedDate });

		const response = await fetch('?/getWeeklyTides', {
			method: 'POST',
			headers: {
				'x-sveltekit-action': 'true'
			},
			body: new URLSearchParams({
				date: formattedDate
			})
		});

		const result = await response.json();
		if (result.type === 'success') {
			await invalidateAll();
		}
		await applyAction(result);
	}
	/** @enum {('day'|'week')} chartType*/
	let chartType = 'day';

	function onChartChangeButtonClick() {
		if (chartType == 'day') {
			chartType = 'week';
		} else {
			chartType = 'day';
		}
	}
</script>

<div class="card p-2">
	<div class="col">
		<div class="d-flex flex-fill justify-content-end pb-2">
			<button type="button" class="btn" on:click={onChartChangeButtonClick}>
				<span>{chartType == 'day' ? 'Week' : 'Day'}</span>
			</button>
		</div>
		<div class="row px-3">
			{#if chartType == 'day'}
				<DailyTideChart {hourlyTides}></DailyTideChart>
			{:else if chartType == 'week'}
				<WeeklyTideChart {weeklyTides}></WeeklyTideChart>
			{/if}
		</div>
	</div>
</div>

<style>
	.btn {
		width: 100px;
	}
</style>
