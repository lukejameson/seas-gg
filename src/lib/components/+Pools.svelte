<script>
	import '../../app.css';
	import Icon from './+Icon.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {Array<VerboseTideData>} tides - Array of high/low tide data
	 * @property {PoolCleaningDates} poolCleaningDates - Array of hourly tide measurements
	 */

	/**
	 * @type {Props}
	 */
	let { tides, poolCleaningDates } = $props();

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
	let ladiesPoolTimes = $state(getTideTimeMinAndMaxForHeight(6.7, '06:00', '18:00'));
	/**@type {Period[]|null}*/
	let gentsPoolsTimes = $state(getTideTimeMinAndMaxForHeight(5, '06:00', '18:00'));
	/**@type {Period[]|null}*/
	let kidsPoolsTimes = $state(getTideTimeMinAndMaxForHeight(7.5, '06:00', '18:00'));

	let isLadiesBeingCleaned = $state(poolBeingCleaned('ladies'));
	let isGentsBeingCleaned = $state(poolBeingCleaned('gentlemens'));
	let isKidsBeingCleaned = $state(poolBeingCleaned('childrens'));

	$effect(() => {
		if (tides) {
			gentsPoolsTimes = getTideTimeMinAndMaxForHeight(5, '06:00', '18:00'); // First Pool;
			ladiesPoolTimes = getTideTimeMinAndMaxForHeight(6.7, '06:00', '18:00'); // Main Big Pool;
			kidsPoolsTimes = getTideTimeMinAndMaxForHeight(7.5, '06:00', '18:00'); // Side Pool next to big pool;

			isLadiesBeingCleaned = poolBeingCleaned('ladies');
			isGentsBeingCleaned = poolBeingCleaned('gentlemens');
			isKidsBeingCleaned = poolBeingCleaned('childrens');
		}
	});

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

		filteredHourlyTides.forEach((entry) => {
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

	/**
	 * @param {string} pool
	 */
	function poolBeingCleaned(pool) {
		if (!poolCleaningDates || !poolCleaningDates.pools) return null;

		if (poolCleaningDates.pools.includes(pool)) return true;
	}
</script>

<div class="card">
	<div class="pools-wrapper">
		<div class="pools-header">
			<h4 class="section-title">Pools</h4>
		</div>
		<div class="pools-container">
			<div class="pool-card">
				<h6 class="pool-title">Ladies Pool</h6>
				<div class="pool-times">
					{#if !ladiesPoolTimes}
						<small class="text-muted">
							<Icon name="circleExclamation" size="0.75rem"></Icon>
							No times available
						</small>
					{:else if isLadiesBeingCleaned}
						<span class="text-red">Closed for cleaning</span>
					{:else}
						{#each ladiesPoolTimes as window}
							<div class="time-slot">
								<Icon name="clock" size="0.75rem"></Icon>
								<span>{window.start} - {window.end}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<div class="pool-card">
				<h6 class="pool-title">Gents Pool</h6>
				<div class="pool-times">
					{#if !gentsPoolsTimes}
						<small class="text-muted">
							<Icon name="circleExclamation" size="0.75rem"></Icon> No times available
						</small>
					{:else if isGentsBeingCleaned}
						<span class="text-red">Closed for cleaning</span>
					{:else}
						{#each gentsPoolsTimes as window}
							<div class="time-slot">
								<Icon name="clock" size="0.75rem"></Icon>
								<span>{window.start} - {window.end}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<div class="pool-card">
				<h6 class="pool-title">Kids Pool</h6>
				<div class="pool-times">
					{#if !kidsPoolsTimes}
						<small class="text-muted">
							<Icon name="circleExclamation" size="0.75rem"></Icon> No times available
						</small>
					{:else if isKidsBeingCleaned}
						<span class="text-red">Closed for cleaning</span>
					{:else}
						{#each kidsPoolsTimes as window}
							<div class="time-slot">
								<Icon name="clock" size="0.75rem"></Icon>
								<span>{window.start} - {window.end}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.text-red {
		color: rgb(255, 26, 26);
	}

	.pools-wrapper {
		margin-bottom: 0.25rem;
	}

	.pools-header {
		margin-bottom: 0.5rem;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: bold;
		color: var(--text-primary);
		margin: 0;
	}

	.pools-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.pool-card {
		background-color: var(--bg-card-subtle);
		border-radius: 0.5rem;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-height: 100px;
		transition: background-color 0.3s ease;
	}

	.pool-title {
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: var(--text-primary);
	}

	.pool-times {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		align-items: center;
	}

	.time-slot {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8rem;
		justify-content: center;
		color: var(--text-primary);
	}

	@media only screen and (max-width: 600px) {
		.pools-container {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.pool-card {
			display: flex;
			flex-direction: row;
			align-items: center;
			text-align: left;
			min-height: unset;
			padding: 0.75rem;
		}

		.pool-title {
			font-size: 0.9rem;
			margin-bottom: 0;
			min-width: 80px;
			flex-shrink: 0;
			margin-right: 1rem;
		}

		.pool-times {
			flex: 1;
			gap: 0.15rem;
			align-items: flex-start;
		}

		.time-slot {
			font-size: 0.85rem;
			gap: 0.2rem;
			justify-content: flex-start;
		}
	}
</style>
