<script>
	import { common } from '$lib/common/+common';
	import { format } from 'date-fns';
	import '../../app.css';
	import Icon from './+Icon.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {Array<VerboseTideData>} tides - Array of high/low tide data
	 * @property {Array<TideData>} hourlyTides - Array of hourly tide measurements
	 * @property {Date} selectedDate
	 */

	/**
	 * @typedef {Object} TideData
	 * @property {string} time - Time of tide measurement
	 * @property {number} height - Height of tide in meters
	 * @property {'High'|'Low'} [typeof] - Type of tide (optional)
	 * @property {boolean} current
	 */

	/**
	 * @typedef {Object} VerboseTideData
	 * @property {string} time - Time of tide measurement
	 * @property {number} height - Height of tide in meters
	 * @property {'High'|'Low'} typeof - Type of tide
	 */

	/**
	 * @typedef {Object} ShownRange
	 * @property {number} startIndex - Start index in hourlyTides array
	 * @property {number} endIndex - End index in hourlyTides array
	 */

	/** @type {Props} */
	let { tides, hourlyTides, selectedDate } = $props();
	let detailedMode = $state(false);
	/** @type {TideData[]|null} */
	let filteredTides = $state(null);
	/** @type {ShownRange} */
	let currentShownRange = $state({ startIndex: 0, endIndex: 0 });
	/** @type {HTMLElement|null} */
	let tideTimesElement = $state(null);

	const currentTideIndex = common.closestTideRecordIndex(hourlyTides);

	$effect(() => {
		if (!tideTimesElement) return;
		const width = tideTimesElement.offsetWidth;
		const maxItems = Math.max(1, Math.round((width / 70 - 1) / 2));
		const currentTideIndex = common.closestTideRecordIndex(hourlyTides);

		currentShownRange = {
			startIndex: Math.max(0, currentTideIndex ? currentTideIndex - maxItems : 0),
			endIndex: Math.min(
				hourlyTides.length,
				currentTideIndex ? currentTideIndex + maxItems : maxItems * 2
			)
		};
	});

	$effect(() => {
		filteredTides =
			hourlyTides?.filter((item, index) => {
				if (
					index == currentTideIndex &&
					format(new Date(), 'yyyy-MM-dd') == format(selectedDate, 'yyyy-MM-dd')
				) {
					item.current = true;
				}

				return index >= currentShownRange.startIndex && index < currentShownRange.endIndex;
			}) ?? null;
	});

	/**
	 *
	 * @param {TideData} tide
	 */
	function risingOrFalling(tide) {
		if (!tide) return;

		const currentTideIndex = hourlyTides.findIndex((x) => x.time == tide.time);

		const currentTide = hourlyTides[currentTideIndex];

		const nextTide = hourlyTides[currentTideIndex + 1];

		if (nextTide.height > currentTide.height) {
			return true;
		}

		return false;
	}

	function moveBackOnTidalRange() {
		if (currentShownRange.startIndex <= 0) return;
		currentShownRange = {
			startIndex: currentShownRange.startIndex - 1,
			endIndex: currentShownRange.endIndex - 1
		};
	}

	function moveForwardOnTidalRange() {
		if (currentShownRange.endIndex >= hourlyTides.length) return;
		currentShownRange = {
			startIndex: currentShownRange.startIndex + 1,
			endIndex: currentShownRange.endIndex + 1
		};
	}
</script>

<div class="card">
	<div class="d-flex flex-fill justify-content-between mb-2">
		<h4 class="card-title">
			Tides {#if detailedMode}Timeline
			{/if}
		</h4>
		<div class="d-flex align-items-center gap-2">
			{#if detailedMode}
				<div class="d-flex align-items-center gap-2">
					<button
						type="button"
						class="btn btn-sm"
						aria-label="Move Back"
						onclick={() => moveBackOnTidalRange()}
					>
						<Icon name="chevronLeft" size="1rem" />
					</button>
					<button
						type="button"
						class="btn btn-sm"
						aria-label="Move Forward"
						onclick={() => moveForwardOnTidalRange()}
					>
						<Icon name="chevronRight" size="1rem" />
					</button>
				</div>
			{/if}
			<button
				type="button"
				class="btn btn-sm"
				aria-label="Toggle Detail Mode"
				onclick={() => (detailedMode = !detailedMode)}
			>
				{#if detailedMode}
					<Icon name="shrink" size="1rem" />
				{:else}
					<Icon name="expand" size="1rem" />
				{/if}
			</button>
		</div>
	</div>

	{#if detailedMode}
		<div
			bind:this={tideTimesElement}
			class="d-flex justify-content-center timeline-container px-3 pb-3"
		>
			{#if filteredTides != null}
				{#each filteredTides as item}
					<div class="tide-item text-center">
						<div class="time-label" class:current-tide={item.current}>{item.time}</div>
						<div class="height-value" class:current-tide={item.current}>{item.height}m</div>

						<div class="timeline-dot" class:current-tide={item.current}>
							{#if risingOrFalling(item)}
								<div class="timeline-icon">
									<Icon name="chevronUp" size="12px"></Icon>
								</div>
							{:else if !risingOrFalling(item)}
								<div class="timeline-icon">
									<Icon name="chevronDown" size="12px"></Icon>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{:else if tides && tides.length > 0}
		<div class="row row-cols-1 row-cols-sm-2 g-1">
			{#each tides as item}
				<div class="col-6 col-md-4">
					<small style="display: block;">
						<Icon name={item.typeof === 'High' ? 'chevronUp' : 'chevronDown'} size="12px" />
						<span class="fw-bold">{item.typeof}</span>
						{item.height}m @ {item.time}
					</small>
				</div>
			{/each}
		</div>
	{:else}
		<small class="text-muted">No tide data available</small>
	{/if}
</div>

<style>
	.timeline-container {
		position: relative;
		margin: 20px 0;
	}

	.tide-item {
		width: 70px;
		position: relative;
		padding-bottom: 25px;
	}

	.current-tide {
		transition: all 0.3s;
		scale: 1.15;
	}
	.time-label {
		font-size: 0.875rem;
		color: #6c757d;
	}

	.height-value {
		font-weight: bold;
		color: #212529;
	}

	.timeline-dot {
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		background-color: #0066cc;
		border-radius: 50%;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		padding-bottom: 4px; /* OR */
	}

	.tide-item:not(:last-child)::after {
		content: '';
		position: absolute;
		bottom: 0px;
		right: -43px;
		width: 70px;
		height: 2px;
		background-color: #dee2e6;
	}
</style>
