<script>
	import '$lib/styles/tides.css';
	import '$lib/styles/global.css';
	import { format } from 'date-fns';
	import { addDays } from 'date-fns/addDays';
	import { subDays } from 'date-fns/subDays';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import Tides from '$lib/components/+Tides.svelte';
	import Weather from '$lib/components/+Weather.svelte';

	export let data;
	$: tide = data.tide;

	const currentDate = new Date();
	let selectedDate = new Date();

	function handleYesterdayClick() {
		selectedDate = subDays(selectedDate, 1);

		loadData(selectedDate);
	}

	function handleTodayClick() {
		selectedDate = new Date();

		loadData(selectedDate);
	}

	function handleTomorrowClick() {
		selectedDate = addDays(selectedDate, 1);

		loadData(selectedDate);
	}

	/** @param {Date} date */
	function isButtonSelected(date) {
		if (!tide) return false;

		if (!date) return false;

		if (format(selectedDate, 'yyyy-MM-dd') == format(date, 'yyyy-MM-dd')) return true;
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
				on:click={() => handleYesterdayClick()}
				class:btn-selected={isButtonSelected(subDays(currentDate, 1))}
				><i class="fa-solid fa-chevron-left"></i></button
			>
			<button
				type="button"
				class="btn"
				aria-label="Today"
				on:click={() => handleTodayClick()}
				class:btn-selected={isButtonSelected(currentDate)}
				disabled={isButtonSelected(currentDate)}><i class="fa-solid fa-calendar-day"></i></button
			>
			<button
				type="button"
				class="btn"
				aria-label="Tomorrow"
				on:click={() => handleTomorrowClick()}
				class:btn-selected={isButtonSelected(addDays(currentDate, 1))}
				><i class="fa-solid fa-chevron-right"></i></button
			>
		</div>
	</div>

	<div class="card-container">
		<div class="top-card-container">
			<div class="card-item">
				<Tides tide={tide.basicTides}></Tides>
			</div>

			<div class="card-item">
				<Weather weather={data.weather}></Weather>
			</div>
		</div>
	</div>
</div>

<style>
	.card-container {
		padding-top: 0.75rem;
	}
	.top-card-container {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		width: 100%;
		gap: 0.5rem;
		flex: 1;
	}

	.card-item {
		width: 50%;
	}
</style>
