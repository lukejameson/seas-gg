<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Pools from '$lib/components/+Pools.svelte';
	import Tides from '$lib/components/+Tides.svelte';
	import Weather from '$lib/components/+Weather.svelte';
	import TideChartParent from '$lib/components/tide-charts/+TideChartParent.svelte';
	import '$lib/styles/global.css';
	import '$lib/styles/tides.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '@fortawesome/fontawesome-pro/css/all.min.css';
	import { format } from 'date-fns';
	import { addDays } from 'date-fns/addDays';
	import { subDays } from 'date-fns/subDays';

	$: tide = $page.data.tide;
	$: weeklyTides = $page.data.weeklyTides;
	$: weather = $page.data.weather;
	$: date = $page.data.date;

	const currentDate = new Date();
	let selectedDate = $page.data.date;

	/**
	 * Takes in a number then applies that to the date
	 * @param {number} operator
	 */
	function onDateNavigationClicked(operator) {
		if (operator == 0) {
			selectedDate = new Date();
		}

		selectedDate = addDays(selectedDate, operator);

		loadData(selectedDate);
	}

	/** @param {Date} date */
	function isButtonSelected(date) {
		if (!tide) return false;

		if (!date) return false;

		if (format(selectedDate, 'yyyy-MM-dd') == format(date, 'yyyy-MM-dd')) return true;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	function isYesterdayDisabled() {
		if (format(selectedDate, 'yyyy-MM-dd') == format(new Date(), 'yyyy-MM-dd')) return true;

		return false;
	}

	/**
	 * @returns {boolean}
	 */

	function isTomorrowDisabled() {
		const maxDate = addDays(new Date(), 4);
		const selectedDatePlusOne = addDays(selectedDate, 1);

		if (selectedDatePlusOne > maxDate) return true;

		return false;
	}

	/** @param {Date} date */
	async function loadData(date) {
		// First, update selectedDate
		selectedDate = date; // Make sure this updates first

		const formattedDate = format(selectedDate, 'yyyy-MM-dd');

		// Then navigate with the new date
		await goto(`?date=${formattedDate}`, {
			replaceState: true
		});
	}
</script>

<div class="content">
	<div class="container-header">
		{#if date}
			<div class="pl-2">
				<h3 class="font-weight-bold">{date}</h3>
			</div>
		{/if}

		<div class="d-flex gap-1">
			<div
				data-toggle="tooltip"
				data-placement="top"
				title={isYesterdayDisabled() ? 'Cannot go back before today' : 'Previous Day'}
			>
				<button
					type="button"
					class="btn"
					aria-label="-1 Day"
					on:click={() => onDateNavigationClicked(-1)}
					class:btn-selected={isButtonSelected(subDays(currentDate, 1))}
					disabled={isYesterdayDisabled()}><i class="fa-solid fa-chevron-left"></i></button
				>
			</div>

			<div
				data-toggle="tooltip"
				data-placement="top"
				title={format(currentDate, 'yyyy-MM-dd') == format(selectedDate, 'yyyy-MM-dd')
					? 'Today already selected'
					: 'Today'}
			>
				<button
					type="button"
					class="btn"
					aria-label="Today"
					on:click={() => onDateNavigationClicked(0)}
					class:btn-selected={isButtonSelected(currentDate)}
					disabled={format(currentDate, 'yyyy-MM-dd') == format(selectedDate, 'yyyy-MM-dd')}
					><i class="fa-solid fa-calendar-day"></i></button
				>
			</div>

			<div
				data-toggle="tooltip"
				data-placement="top"
				title={isTomorrowDisabled() ? 'Cannot go ahead more than 5 days' : 'Next Day'}
			>
				<button
					type="button"
					class="btn"
					aria-label="Tomorrow"
					on:click={() => onDateNavigationClicked(1)}
					disabled={isTomorrowDisabled()}
					class:btn-selected={isButtonSelected(addDays(currentDate, 1))}
					><i class="fa-solid fa-chevron-right"></i></button
				>
			</div>
		</div>
	</div>

	<div class="container">
		<div class="col gap-2">
			<div class="row pb-2 gap-2">
				<div class="col p-0">
					<Tides tide={tide.basicTides}></Tides>
				</div>

				<div class="col p-0">
					<Weather {weather}></Weather>
				</div>
			</div>

			<div class="row gap-2 pb-2">
				<Pools tides={tide.hourlyTides}></Pools>
			</div>

			<div class="row gap-2">
				<TideChartParent hourlyTides={tide.hourlyTides} {weeklyTides}></TideChartParent>
			</div>
		</div>
	</div>
</div>

<style>
</style>
