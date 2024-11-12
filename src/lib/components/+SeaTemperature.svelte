<!-- Tides.svelte -->
<script>
	import '../../app.css';
	/** @type {SeaTemperature} */
	export let seaTemperature;
	/**
	 * @type {TideData[]}
	 */
	export let tides;

	function closestTideRecordIndex() {
		if (!tides) return;

		const dates = tides.map((tide, index) => {
			return { time: tide.time, height: tide.height, index };
		});

		const refDate = new Date();
		const currentMinutes = refDate.getHours() * 60 + refDate.getMinutes();

		return dates.reduce((closest, current) => {
			const closestDiff = Math.abs(timeToMinutes(closest.time) - currentMinutes);
			const currentDiff = Math.abs(timeToMinutes(current.time) - currentMinutes);

			return currentDiff < closestDiff ? current : closest;
		}).index;
	}

	function getCurrentTideState() {
		const currentTideIndex = closestTideRecordIndex();

		if (!currentTideIndex) return;
		if (currentTideIndex == 47) return;

		const currentTideRecord = tides[currentTideIndex];
		const nextTideRecord = tides[currentTideIndex + 1];

		if (currentTideRecord.height > nextTideRecord.height) {
			return 'Rising';
		} else {
			return 'Falling';
		}
	}

	function getCurrentTideHeight() {
		const currentTideIndex = closestTideRecordIndex();

		if (!currentTideIndex) return 'Unknown';

		return tides[currentTideIndex].height;
	}

	/**
	 * Converts time string to minutes since midnight
	 * @param {string} time - Time in HH:mm format
	 * @returns {number} Minutes since midnight
	 */
	function timeToMinutes(time) {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}
</script>

<div class="card">
	<div class="card-title">Live Info</div>
	{#if seaTemperature && seaTemperature.sea_temp_c != 'Not available'}
		<div class="row row-cols-2 row-cols-sm-3 g-1 px-2">
			<div>
				<span class="font-weight-bold">Temp:</span>
				{seaTemperature.sea_temp_c}
			</div>
			<div>
				<span class="font-weight-bold">Tide Status: </span>
				{getCurrentTideState()}
			</div>
			<div>
				<span class="font-weight-bold">Tide Height:</span>
				{getCurrentTideHeight()}m
			</div>
		</div>
	{:else}
		<small class="text-muted">No tide data available</small>
	{/if}
</div>
