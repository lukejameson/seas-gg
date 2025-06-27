<!-- Tides.svelte -->
<script>
	import { common } from '$lib/common/+common';
	import '../../app.css';

	let { seaTemperature, tides } = $props();

	function getCurrentTideState() {
		if (!tides) return;

		const currentTideIndex = common.closestTideRecordIndex(tides);

		if (typeof currentTideIndex !== 'number') return;

		const currentTideRecord = tides[currentTideIndex];

		// If we're at the last record, use the previous record for comparison
		if (currentTideIndex >= tides.length - 1) {
			if (currentTideIndex === 0) return 'Unknown'; // Only one record available

			const previousTideRecord = tides[currentTideIndex - 1];

			if (currentTideRecord.height > previousTideRecord.height) {
				return 'Rising';
			} else {
				return 'Falling';
			}
		}

		// Normal case: compare with next record
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

		if (typeof currentTideIndex !== 'number') return 'Unknown';

		return tides[currentTideIndex].height;
	}
</script>

{#if seaTemperature?.sea_temp_c != 'Not available'}
	<div class="card">
		<div class="mb-2">
			<h4 class="fw-bold live-info-title">Live Info</h4>
		</div>

		<div class="live-info-grid">
			<div class="info-item">
				<span class="info-label">Sea Temp:</span>
				<span class="info-value">{seaTemperature.sea_temp_c}</span>
			</div>

			<div class="info-item">
				<span class="info-label">Tide:</span>
				<span class="info-value">{getCurrentTideState()}</span>
			</div>

			<div class="info-item">
				<span class="info-label">Height:</span>
				<span class="info-value">{getCurrentTideHeight()}m</span>
			</div>
		</div>
	</div>
{:else}
	<div></div>
{/if}

<style>
	.live-info-title {
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.live-info-grid {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 0.5rem;
		background-color: var(--bg-card-subtle);
		border-radius: 0.5rem;
		flex: 1;
		transition: background-color 0.3s ease;
	}

	.info-label {
		font-weight: bold;
		font-size: 0.85rem;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.info-value {
		font-weight: bold;
		font-size: 1rem;
		color: var(--text-primary);
	}

	@media only screen and (max-width: 600px) {
		.live-info-grid {
			flex-direction: row;
			gap: 0.5rem;
		}

		.info-item {
			padding: 0.5rem 0.25rem;
		}

		.info-label {
			font-size: 0.8rem;
			margin-bottom: 0.25rem;
		}

		.info-value {
			font-size: 0.95rem;
		}
	}
</style>
