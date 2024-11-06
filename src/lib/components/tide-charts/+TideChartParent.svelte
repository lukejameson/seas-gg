<script>
	import { applyAction } from '$app/forms';
	import { invalidateAll, pushState } from '$app/navigation';
	import { format, nextMonday } from 'date-fns';
	import WeeklyTideChart from './+WeeklyTideChart.svelte';
	import DailyTideChart from './+DailyTideChart.svelte';

	/**@type {{hourlyTides: TideData[], weeklyTides: WeeklyTides, dailyStaticUrl: string}}*/
	let props = $props();

	/** @enum {('day'|'week')} chartType*/
	let chartType = $state('day');

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
			<button type="button" class="btn" onclick={onChartChangeButtonClick}>
				<span>{chartType == 'day' ? 'Week' : 'Day'}</span>
			</button>
		</div>
		<div class="row px-3">
			{#if chartType == 'day'}
				<DailyTideChart hourlyTides={props.hourlyTides} dailyStaticUrl={props.dailyStaticUrl}></DailyTideChart>
			{:else if chartType == 'week'}
				<WeeklyTideChart weeklyTides={props.weeklyTides}></WeeklyTideChart>
			{/if}
		</div>
	</div>
</div>

<style>
	.btn {
		width: 100px;
	}
</style>
