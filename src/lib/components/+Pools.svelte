<script>
	import '../../app.css';
	import Icon from './+Icon.svelte';
	/**
	 * @type {TideData[]}
	 */
	export let tides;

	/**
	 * @typedef {Object} TideEntry
	 * @property {string} time - The time in HH:mm format
	 * @property {number} height - The tide height in meters
	 */

	/**
	 * @typedef {Object} Period
	 * @property {string|null} start - Start time of the period in HH:mm format
	 * @property {string|null} end - End time of the period in HH:mm format
	 */

	/**
	 * @typedef {Object} Tides
	 * @property {TideEntry[]|null} hourlyTides - Array of tide entries with time and height
	 */

	/**@type {Period[]|null}*/
	let ladiesPoolTimes;
	/**@type {Period[]|null}*/
	let gentsPoolsTimes;
	/**@type {Period[]|null}*/
	let kidsPoolsTimes;

	$: {
		if (tides) {
			gentsPoolsTimes = getTideTimeMinAndMaxForHeight(5, '06:00', '18:00'); // First Pool;
			ladiesPoolTimes = getTideTimeMinAndMaxForHeight(6.7, '06:00', '18:00'); // Main Big Pool;
			kidsPoolsTimes = getTideTimeMinAndMaxForHeight(7.5, '06:00', '18:00'); // Side Pool next to big pool;
		}
	}

	/**
	 * Finds periods where tide height is below a specified threshold
	 * @param {number} threshold - The height threshold in meters
	 * @param {string} earliestTime - Earliest Time to be considered
	 * @param {string} lastTime - Latest Time to be considered
	 * @returns {Period[]|null} Array of periods where tide is below threshold, or null if no tide data
	 */

	function getTideTimeMinAndMaxForHeight(threshold, earliestTime, lastTime) {
		if (!tides) {
			return null;
		}

		/**
		 * @type {TideData[]}
		 */

		let filteredHourlyTides;

		// if (!earliestTime && !lastTime) {
		filteredHourlyTides = tides.filter((x) => x.time >= earliestTime && x.time <= lastTime);

		/** @type {Period[]} */
		let periods = [];
		/** @type {Period|null} */
		let currentPeriod = null;

		/** @type {number|null}*/
		let lastHeight = null;

		filteredHourlyTides.forEach((entry, index) => {
			const isUnderThreshold = entry.height < threshold;

			if (isUnderThreshold && (!lastHeight || lastHeight >= threshold)) {
				currentPeriod = { start: entry.time, end: null };
			} else if (!isUnderThreshold && lastHeight && lastHeight < threshold) {
				if (currentPeriod) {
					currentPeriod.end = entry.time;
					periods.push(currentPeriod);
					currentPeriod = null;
				}
			}

			lastHeight = entry.height;
		});
		// Handle case where period extends to the end of the data
		if (currentPeriod) {
			currentPeriod.end = filteredHourlyTides[filteredHourlyTides.length - 1].time;
			periods.push(currentPeriod);
		}

		// Consolidate consecutive periods
		/** @type {Period[]} */
		const consolidatedPeriods = periods.reduce((acc, current, index) => {
			if (index === 0) {
				acc.push(current);
				return acc;
			}

			const lastPeriod = acc[acc.length - 1];
			const currentTimeStart = current.start ? timeToMinutes(current.start) : null;
			const lastTimeEnd = lastPeriod.end ? timeToMinutes(lastPeriod.end) : null;

			// If times are consecutive (30 min difference) or current has no start
			if (lastTimeEnd && (currentTimeStart === null || currentTimeStart - lastTimeEnd === 30)) {
				lastPeriod.end = current.end;
			} else {
				acc.push(current);
			}

			return acc;
		}, /** @type {Period[]} */ ([]));

		return consolidatedPeriods;
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
	<div>
		<h4 class="card-title">Pools</h4>
	</div>
	<div class="card-body p-2">
		<div class="row row-cols-2 row-cols-sm-3">
			<div>
				<h6 class="mb-2 font-weight-bold">Ladies Pool</h6>
				{#if !ladiesPoolTimes}
					<small class="text-muted">
						<Icon name="circleExclamation" size="0.75rem"></Icon>
						No times available
					</small>
				{:else}
					{#each ladiesPoolTimes as window}
						<div class="d-flex align-items-center gap-2 mb-1">
							<Icon name="clock" size="0.75rem"></Icon>
							<span>{window.start} - {window.end}</span>
						</div>
					{/each}
				{/if}
			</div>
			<div>
				<h6 class="mb-2 font-weight-bold">Gents Pool</h6>
				{#if !gentsPoolsTimes}
					<small class="text-muted">
						<Icon name="circleExclamation" size="0.75rem"></Icon> No times available
					</small>
				{:else}
					{#each gentsPoolsTimes as window}
						<div class="d-flex align-items-center gap-2 mb-1">
							<Icon name="clock" size="0.75rem"></Icon>
							<span>{window.start} - {window.end}</span>
						</div>
					{/each}
				{/if}
			</div>

			<div>
				<h6 class="mb-2 font-weight-bold">Kids Pool</h6>
				{#if !kidsPoolsTimes}
					<small class="text-muted">
						<Icon name="circleExclamation" size="0.75rem"></Icon> No times available
					</small>
				{:else}
					{#each kidsPoolsTimes as window}
						<div class="d-flex align-items-center gap-2 mb-1">
							<Icon name="clock" size="0.75rem"></Icon>
							<span>{window.start} - {window.end}</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
