<script>
	import '../../app.css';
	import Icon from './+Icon.svelte';

	/**
	 * @typedef {Object} VerboseTideData
	 * @property {string} time - Time of tide measurement
	 * @property {number} height - Height of tide in meters
	 * @property {'High'|'Low'} typeof - Type of tide
	 */

	/** @type {{ tides: Array<VerboseTideData> }} */
	let { tides } = $props();
</script>

<div class="card">
	<div class="mb-2">
		<h4 class="card-title">Tides</h4>
	</div>

	{#if tides && tides.length > 0}
		<div class="tides-grid">
			{#each tides as item}
				<div class="tide-item">
					<div class="tide-type">
						<Icon name={item.typeof === 'High' ? 'chevronUp' : 'chevronDown'} size="14px" />
						<span class="tide-type-text">{item.typeof}</span>
					</div>
					<div class="tide-details">
						<span class="tide-time">{item.time}</span>
						<span class="tide-height">{item.height}m</span>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<small class="text-muted">No tide data available</small>
	{/if}
</div>

<style>
	.tides-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.5rem;
	}

	.tide-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		background-color: var(--bg-card-subtle);
		border-radius: 0.5rem;
		text-align: center;
		transition: background-color 0.3s ease;
	}

	.tide-type {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.25rem;
	}

	.tide-type-text {
		font-weight: bold;
		font-size: 0.85rem;
		color: var(--text-primary);
	}

	.tide-details {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.tide-height {
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.tide-time {
		font-weight: bold;
		font-size: 0.9rem;
		color: var(--text-primary);
	}

	@media only screen and (max-width: 600px) {
		.tides-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 0.25rem;
		}

		.tide-item {
			padding: 0.4rem 0.2rem;
		}

		.tide-type-text {
			font-size: 0.75rem;
		}

		.tide-height {
			font-size: 0.8rem;
		}

		.tide-time {
			font-size: 0.7rem;
		}

		.tide-type {
			gap: 0.15rem;
			margin-bottom: 0.15rem;
		}
	}
</style>
