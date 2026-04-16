<!-- Tides.svelte -->
<script>
	import { common } from '$lib/common/+common';
	import '$lib/styles/styles.css';

	let { seaTemperature, tides, isPredicted = false, predictionConfidence = null } = $props();

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

{#if seaTemperature?.seaTempC != 'Not available'}
	<div class="card">
		<div class="">
			<h4 class="fw-bold live-info-title">{isPredicted ? 'Predicted Info' : 'Live Info'}</h4>
		</div>

		<div class="live-info-grid">
			<div class="info-item">
				<span class="info-label">Sea Temp:</span>
				<span class="info-value">{seaTemperature.seaTempC}</span>
				{#if isPredicted}
					<span class="prediction-label" title="{predictionConfidence} confidence">Predicted</span>
				{/if}
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
		margin-top: 0.2rem;
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
		padding: 0.5rem 0.5rem 1.2rem;
		background-color: var(--bg-card-subtle);
		border-radius: 0.5rem;
		flex: 1;
		position: relative;
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

	.prediction-label {
		position: absolute;
		bottom: 0.25rem;
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		font-size: 0.65rem;
		color: #3b82f6;
		font-weight: 600;
		padding: 0.1rem 0.4rem;
		background: rgba(59, 130, 246, 0.1);
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	@media only screen and (max-width: 600px) {
		.live-info-grid {
			flex-direction: row;
			gap: 0.5rem;
		}

		.info-item {
			padding: 0.5rem 0.25rem 1.1rem;
		}

		.info-label {
			font-size: 0.8rem;
			margin-bottom: 0.25rem;
		}

		.info-value {
			font-size: 0.95rem;
		}

		.prediction-label {
			font-size: 0.6rem;
			padding: 0.05rem 0.3rem;
		}
	}
</style>
