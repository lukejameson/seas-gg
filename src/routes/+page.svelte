<script>
	import '$lib/styles/tides.css';
	import { format } from 'date-fns';
	import { addDays } from 'date-fns/addDays';
	import { subDays } from 'date-fns/subDays';
	import '@fortawesome/fontawesome-free/css/all.min.css'


	export let data;
	$: tide = data.tide;

	const currentDate = new Date();

	function handleYesterdayClick() {
		const date = subDays(new Date(), 1);

		loadData(date);
	}

	function handleTodayClick() {
		const date = new Date();

		loadData(date);
	}

	function handleTomorrowClick() {
		const date = addDays(new Date(), 1);

		loadData(date);
	}

	/** @param {Date} date */
	function isButtonSelected(date) {
		if (!tide) return false;

		if (!date) return false;

		if (format(tide.date, 'yyyy-MM-dd') == format(date, 'yyyy-MM-dd')) return true;
	}

	/** @param {Date} date */
	async function loadData(date) {
		const formattedDate = format(date, 'yyyy-MM-dd');
		const res = await fetch(`/tides?date=${formattedDate}`);
		const newTide = await res.json();
		data = { tide: newTide };
	}
</script>

<div class="content">
	<div class="container-header">
		{#if tide}
			<div class="date-title">
				<h3>{tide.date}</h3>
			</div>
		{/if}

		<div class="button-group">
			<button
				type="button"
				class="nav-btn"
				aria-label="Yesterday"
				on:click={() => handleYesterdayClick()}
				class:nav-btn-selected={isButtonSelected(subDays(currentDate, 1))}
				disabled={isButtonSelected(subDays(currentDate, 1))}><i class="fa-solid fa-chevron-left"></i></button
			>
			<button
				type="button"
				class="nav-btn"
				aria-label="Today"
				on:click={() => handleTodayClick()}
				class:nav-btn-selected={isButtonSelected(currentDate)}
				disabled={isButtonSelected(currentDate)}><i class="fa-solid fa-calendar-day"></i></button
			>
			<button
				type="button"
				class="nav-btn"
				aria-label="Tomorrow"
				on:click={() => handleTomorrowClick()}
				class:nav-btn-selected={isButtonSelected(addDays(currentDate, 1))}
				disabled={isButtonSelected(addDays(currentDate, 1))}><i class="fa-solid fa-chevron-right"></i></button
			>
		</div>
	</div>

	{#if isButtonSelected(currentDate)}
		<div>Current Tide Height: {tide.currentTideHeight.height}m</div>
	{/if}
</div>
