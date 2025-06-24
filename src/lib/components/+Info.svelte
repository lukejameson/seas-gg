<!-- Tides.svelte -->
<script>
	import { common } from '$lib/common/+common';
	import '../../app.css';
	import Icon from './+Icon.svelte';

	let { seaTemperature, tides, seaTempTrend } = $props();

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
			<h4 class="fw-bold">Live Info</h4>
		</div>

		<div class="row row-cols-1 row-cols-sm-3 g-3">
			<div>
				<span class="fw-bold me-2">Sea Temp:</span>
				<span>{seaTemperature.sea_temp_c}</span>
			</div>

			<div>
				<span class="fw-bold me-2">Tide:</span>
				<span>{getCurrentTideState()}</span>
			</div>

			<div>
				<span class="fw-bold me-2">Height:</span>
				<span>{getCurrentTideHeight()}m</span>
			</div>
		</div>
	</div>
{:else}
	<div></div>
{/if}
