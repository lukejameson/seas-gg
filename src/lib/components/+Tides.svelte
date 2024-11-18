<script>
	import { common } from '$lib/common/+common';
	import '../../app.css';
	import Icon from './+Icon.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {Array<VerboseTideData>} tides - Array of high/low tide data
	 * @property {Array<TideData>} hourlyTides - Array of hourly tide measurements
	 */

	/**
	 * @typedef {Object} TideData
	 * @property {string} time - Time of tide measurement
	 * @property {number} height - Height of tide in meters
	 * @property {'High'|'Low'} [typeof] - Type of tide (optional)
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
	let { tides, hourlyTides } = $props();
	let detailedMode = $state(false);
	/** @type {TideData[]|null} */
	let filteredTides = $state(null);
	/** @type {ShownRange} */
	let currentShownRange = $state({ startIndex: 0, endIndex: 0 });
	/** @type {HTMLElement|null} */
	let tideTimesElement = $state(null);

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
			hourlyTides?.filter(
				(item, index) => index >= currentShownRange.startIndex && index < currentShownRange.endIndex
			) ?? null;
	});

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
		<h4 class="card-title">Tides</h4>
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
					<Icon name="toggleOn" size="1rem" />
				{:else}
					<Icon name="toggleOff" size="1rem" />
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
						<div class="time-label">{item.time}</div>
						<div class="height-value">{item.height}m</div>
						<div class="timeline-dot"></div>
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
		border-bottom: 2px solid #dee2e6;
		margin: 20px 0;
	}

	.tide-item {
		width: 70px;
		position: relative;
		padding-bottom: 25px;
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
		width: 12px;
		height: 12px;
		background-color: #0066cc;
		border-radius: 50%;
	}

	.tide-item:not(:last-child)::after {
		content: '';
		position: absolute;
		bottom: -2px;
		right: -42px;
		width: 70px;
		height: 2px;
		background-color: #dee2e6;
	}
</style>
