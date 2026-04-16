<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Pools from '$lib/components/+Pools.svelte';
	import Tides from '$lib/components/+Tides.svelte';
	import Weather from '$lib/components/+Weather.svelte';
	import Info from '$lib/components/+Info.svelte';
	import Icon from '$lib/components/+Icon.svelte';
	import { format, parseISO, addDays } from 'date-fns';

	// raw date (could be ISO string) from load()
	$: rawDate = $page.data.date;

	// normalize to a real Date object
	$: selectedDate = typeof rawDate === 'string' ? parseISO(rawDate) : rawDate;

	$: tide = $page.data.tide;
	$: weather = $page.data.weather;
	$: seaTemperature = $page.data.seaTemperature;
	$: isPredicted = $page.data.isPredicted;
	$: predictionConfidence = $page.data.predictionConfidence;
	$: poolsBeingCleaned = $page.data.poolsBeingCleaned;
	$: navigation = $page.data.navigation;

	/**
	 * Navigate forwards or backwards by a given number of days.
	 * @param {number} delta - Number of days to shift selectedDate by.
	 */
	function onDateNavigationClicked(delta) {
		const nextDate = addDays(selectedDate, delta);
		loadData(nextDate);
	}

	/**
	 * Load data for a specific date by updating the URL query param.
	 * @async
	 * @param {Date} date - The date to load data for.
	 */
	async function loadData(date) {
		const qs = format(date, 'yyyy-MM-dd');
		await goto(`?date=${qs}`, { replaceState: true });
	}
</script>

<div class="content">
	<div class="container-header">
		{#if rawDate}
			<div class="pl-2">
				<h3 class="font-weight-bold f-20">{rawDate}</h3>
			</div>
		{/if}

		<div class="d-flex gap-1 align-items-center">
			<div>
				<button
					data-sveltekit-preload-data="hover"
					type="button"
					class="btn"
					aria-label="Previous Day"
					disabled={!navigation?.canGoBack}
					onclick={() => onDateNavigationClicked(-1)}
				>
					<Icon name="chevronLeft" size="18px" />
				</button>
			</div>

			<div>
				<button
					type="button"
					class="btn"
					aria-label="Next Day"
					disabled={!navigation?.canGoForward}
					onclick={() => onDateNavigationClicked(1)}
				>
					<Icon name="chevronRight" size="18px" />
				</button>
			</div>
		</div>
	</div>

	<div class="component">
		{#if weather}
			<Weather date={rawDate} {weather} />
		{/if}
	</div>

	<div class="component">
		{#if seaTemperature && tide}
			<Info tides={tide.hourlyTides} {seaTemperature} {isPredicted} {predictionConfidence} />
		{/if}
	</div>

	<div class="component">
		{#if tide?.basicTides}
			<Tides tides={tide.basicTides} />
		{/if}
	</div>

	<div class="component">
		{#if tide?.hourlyTides}
			<Pools tides={tide.hourlyTides} poolCleaningDates={poolsBeingCleaned} />
		{/if}
	</div>
</div>
