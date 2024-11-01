<script>
	import '$lib/styles/tides.css';
	import '$lib/styles/global.css';
	import { format } from 'date-fns';
	import { addDays } from 'date-fns/addDays';
	import { subDays } from 'date-fns/subDays';
	import Tides from '$lib/components/+Tides.svelte';
	import Weather from '$lib/components/+Weather.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import '@fortawesome/fontawesome-pro/css/all.min.css';
	import TideChart from '$lib/components/+TideChart.svelte';

	export let data;
	$: tide = data.tide;

	const currentDate = new Date();
	let selectedDate = new Date();

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
		console.log(selectedDate);

		if (format(selectedDate, 'yyyy-MM-dd') == format(new Date(), 'yyyy-MM-dd')) return true;

		return false;
	}

	/** @param {Date} date */
	async function loadData(date) {
		const formattedDate = format(date, 'yyyy-MM-dd');

		const [tideResponse, weatherResponse] = await Promise.all([
			fetch(`/tides?date=${formattedDate}`),
			fetch(`/weather?date=${formattedDate}`)
		]);

		if (!tideResponse.ok || !weatherResponse.ok) {
		}

		const [tide, weather] = await Promise.all([tideResponse.json(), weatherResponse.json()]);

		data = {
			tide: tide,
			weather: weather,
			date: formattedDate
		};
	}
</script>

<div class="content">
	<div class="container-header">
		{#if data}
			<div class="date-title">
				<h3>{data.date}</h3>
			</div>
		{/if}

		<div class="button-group">
			<button
				type="button"
				class="btn"
				aria-label="Yesterday"
				on:click={() => onDateNavigationClicked(-1)}
				class:btn-selected={isButtonSelected(subDays(currentDate, 1))}
				disabled={isYesterdayDisabled()}><i class="fa-solid fa-chevron-left"></i></button
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
			<button
				type="button"
				class="btn"
				aria-label="Tomorrow"
				on:click={() => onDateNavigationClicked(1)}
				class:btn-selected={isButtonSelected(addDays(currentDate, 1))}
				><i class="fa-solid fa-chevron-right"></i></button
			>
		</div>
	</div>

	<div class="container">
		<div class="col pb-2">
			<div class="row gap-2 pb-1">
				<div class="col">
					<Tides tide={tide.basicTides}></Tides>
				</div>

				<div class="col">
					<Weather weather={data.weather}></Weather>
				</div>
			</div>

			<div class="row gap-2">
				<TideChart hourlyTides={tide.hourlyTides}></TideChart>
			</div>
		</div>
	</div>
</div>

<style>
</style>
