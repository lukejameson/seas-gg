<script>
	import DailyTideChart from './+DailyTideChart.svelte';
	import WeeklyTideChart from './+WeeklyTideChart.svelte';

	/**@type {{hourlyTides: TideData[], weeklyTides: WeeklyTides}}*/
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
				<DailyTideChart hourlyTides={props.hourlyTides}></DailyTideChart>
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
