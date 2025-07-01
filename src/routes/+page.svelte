<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Pools from '$lib/components/+Pools.svelte';
  import Tides from '$lib/components/+Tides.svelte';
  import Weather from '$lib/components/+Weather.svelte';
  import Icon from '$lib/components/+Icon.svelte';
  import Info from '$lib/components/+Info.svelte';
  import {
    format,
    isBefore,
    parseISO,
    addDays
  } from 'date-fns';
  import { onMount } from 'svelte';
  import '../app.css';

  // raw date (could be ISO string) from load()
  $: rawDate = $page.data.date;

  // normalize to a real Date object
  $: selectedDate =
    typeof rawDate === 'string' ? parseISO(rawDate) : rawDate;

  $: tide = $page.data.tide;
  $: weather = $page.data.weather;
  $: seaTemperature = $page.data.seaTemperature;
  $: poolsBeingCleaned = $page.data.poolsBeingCleaned;

  onMount(() => {
    // page-specific initialization (none needed currently)
  });

  /**
   * Navigate forwards or backwards by a given number of days.
   * @param {number} delta - Number of days to shift selectedDate by.
   */
  function onDateNavigationClicked(delta) {
    const nextDate = addDays(selectedDate, delta);
    loadData(nextDate);
  }

  /**
   * Determine if the "Previous Day" button should be disabled.
   * @returns {boolean} True if selectedDate is today or earlier.
   */
  function isYesterdayDisabled() {
    const today = new Date();
    return !isBefore(today, selectedDate);
  }

  /**
   * Determine if the "Next Day" button should be disabled.
   * @returns {boolean} True if the next day exceeds 12 days from today.
   */
  function isTomorrowDisabled() {
    const maxDate = addDays(new Date(), 12);
    const tomorrow = addDays(selectedDate, 1);
    return tomorrow > maxDate;
  }

  /**
   * Load data for a specific date by updating the URL query param.
   * @async
   * @param {Date} date - The date to load data for.
   */
  async function loadData(date) {
    const qs = format(date, 'yyyy-MM-dd');
    await goto(`?date=${qs}`, { replaceState: true });
  }
</script>

<div class="content">
  <div class="container-header">
    {#if rawDate}
      <div class="pl-2">
        <h3 class="font-weight-bold f-20">{rawDate}</h3>
      </div>
    {/if}

    <div class="d-flex gap-1 align-items-center">
      <div
        data-toggle="tooltip"
        data-placement="top"
        title={isYesterdayDisabled() ? 'Cannot go back before today' : 'Previous Day'}
      >
        <button
          data-sveltekit-preload-data="hover"
          type="button"
          class="btn"
          aria-label="Previous Day"
          on:click={() => onDateNavigationClicked(-1)}
          disabled={isYesterdayDisabled()}
        >
          <Icon name="chevronLeft" size="18px" />
        </button>
      </div>

      <div
        data-toggle="tooltip"
        data-placement="top"
        title={isTomorrowDisabled() ? 'Cannot go ahead more than 12 days' : 'Next Day'}
      >
        <button
          type="button"
          class="btn"
          aria-label="Next Day"
          on:click={() => onDateNavigationClicked(1)}
          disabled={isTomorrowDisabled()}
        >
          <Icon name="chevronRight" size="18px" />
        </button>
      </div>
    </div>
  </div>

  <div>
    <div class="component">
      <Weather {rawDate} {weather} />
    </div>

    <div class="component">
      <Info tides={tide.hourlyTides} {seaTemperature} />
    </div>

    <div class="component">
      <Tides tides={tide.basicTides} />
    </div>

    <div class="component">
      <Pools
        tides={tide.hourlyTides}
        poolCleaningDates={poolsBeingCleaned}
      />
    </div>
  </div>
</div>
