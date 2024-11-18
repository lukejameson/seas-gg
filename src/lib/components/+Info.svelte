<!-- Tides.svelte -->
<script>
	import { common } from '$lib/common/+common';
	import '../../app.css';
	/** @type {SeaTemperature|null} */
	export let seaTemperature = null;
	/**
	 * @type {TideData[]|null}
	 */
	export let tides = null;

	function getCurrentTideState() {
		if (!tides) return;

		const currentTideIndex = common.closestTideRecordIndex(tides);

		if (!currentTideIndex) return;
		if (currentTideIndex == 47) return;

		const currentTideRecord = tides[currentTideIndex];
		const nextTideRecord = tides[currentTideIndex + 1];

		if (nextTideRecord.height > currentTideRecord.height) {
			return 'Rising';
		} else {
			return 'Falling';
		}
	}

	function getCurrentTideHeight() {
		if (!tides) return;

		const currentTideIndex = common.closestTideRecordIndex(tides);

		if (!currentTideIndex) return 'Unknown';

		return tides[currentTideIndex].height;
	}
</script>

{#if seaTemperature?.sea_temp_c != 'Not available'}
	<div class="card">
		<div class="mb-2">
			<h4 class="card-title">Live Info</h4>
		</div>
		{#if seaTemperature && seaTemperature.sea_temp_c != 'Not available'}
			<div class="row row-cols-2 row-cols-sm-3 g-1 px-2">
				<div>
					<span class="font-weight-bold">Sea Temp:</span>
					<span>{seaTemperature.sea_temp_c}</span>
				</div>
				<div>
					<span class="font-weight-bold">Tide: </span>
					{getCurrentTideState()}
				</div>
				<div>
					<span class="font-weight-bold">Tide Height:</span>
					{getCurrentTideHeight()}m
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div></div>
{/if}
