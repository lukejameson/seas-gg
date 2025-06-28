<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Pools from '$lib/components/+Pools.svelte';
	import Tides from '$lib/components/+Tides.svelte';
	import Weather from '$lib/components/+Weather.svelte';

	import Icon from '$lib/components/+Icon.svelte';
	import Info from '$lib/components/+Info.svelte';
	import { format } from 'date-fns';
	import { addDays } from 'date-fns/addDays';
	import { onMount } from 'svelte';
	import '../app.css';

	$: tide = $page.data.tide;
	$: weather = $page.data.weather;
	$: date = $page.data.date;
	$: seaTemperature = $page.data.seaTemperature;
	$: poolsBeingCleaned = $page.data.poolsBeingCleaned;

	// Keep selectedDate in sync with page data
	$: selectedDate = $page.data.date;

	// No theme initialization needed here - handled by layout
	onMount(() => {
		// Any page-specific initialization can go here
	});

	/**
	 * Takes in a number then applies that to the date
	 * @param {number} operator
	 */
	function onDateNavigationClicked(operator) {
		selectedDate = addDays(selectedDate, operator);
		loadData(selectedDate);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	function isYesterdayDisabled() {
		const today = new Date();
		const todayString = format(today, 'yyyy-MM-dd');
		const selectedString = format(selectedDate, 'yyyy-MM-dd');

		// Disable if selected date is today or before today
		return selectedString <= todayString;
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
				<h3 class="font-weight-bold f-20">{date}</h3>
			</div>
		{/if}

		<div class="d-flex gap-1 align-items-center">
			<div
				data-toggle="tooltip"
				data-placement="top"
				title={isYesterdayDisabled() ? 'Cannot go back before today' : 'Previous Day'}
			>
				<button
					data-sveltekit-preload-data="hover"
					type="button"
					class="btn"
					aria-label="Previous Day"
					on:click={() => onDateNavigationClicked(-1)}
					disabled={isYesterdayDisabled()}
				>
					<Icon name="chevronLeft" size="18px"></Icon>
				</button>
			</div>

			<div
				data-sveltekit-preload-data="hover"
				data-toggle="tooltip"
				data-placement="top"
				title={isTomorrowDisabled() ? 'Cannot go ahead more than 5 days' : 'Next Day'}
			>
				<button
					type="button"
					class="btn"
					aria-label="Next Day"
					on:click={() => onDateNavigationClicked(1)}
					disabled={isTomorrowDisabled()}
				>
					<Icon name="chevronRight" size="18px"></Icon>
				</button>
			</div>

			<!-- <div class="theme-divider"></div> -->
		</div>
	</div>

	<div>
		<div class="component">
			<Weather {date} {weather}></Weather>
		</div>

		<div class="component">
			<Info tides={tide.hourlyTides} {seaTemperature}></Info>
		</div>

		<div class="component">
			<Tides tides={tide.basicTides}></Tides>
		</div>

		<div class="component">
			<Pools tides={tide.hourlyTides} poolCleaningDates={poolsBeingCleaned}></Pools>
		</div>
	</div>
</div>
