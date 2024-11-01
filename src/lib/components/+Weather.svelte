<script>
	import '$lib/styles/card.css';
	import '$lib/styles/global.css';
	import { format } from 'date-fns';

	/**@type {HourlyWeather[]}*/
	export let weather;

	/** @typedef {[string, string]} codeAndIcon */
	/** @type {Record<number, codeAndIcon>}[] */
	const weatherCodes = {
		0: ['Clear', 'fa-solid fa-sun'],
		1: ['Mainly clear', 'fa-solid fa-sun-cloud'],
		2: ['Partly cloudy', 'fa-solid fa-cloud-sun'],
		3: ['Overcast', 'fa-solid fa-cloud'],
		45: ['Fog', 'fa-solid fa-fog'],
		48: ['Depositing rime fog', 'fa-solid fa-smog'],
		51: ['Drizzle: Light intensity', 'fa-solid fa-cloud-drizzle'],
		53: ['Drizzle: Moderate intensity', 'fa-solid fa-cloud-drizzle'],
		55: ['Drizzle: Dense intensity', 'fa-solid fa-cloud-showers-heavy'],
		56: ['Freezing Drizzle: Light intensity', 'fa-solid fa-snowflake'],
		57: ['Freezing Drizzle: Dense intensity', 'fa-solid fa-snowflake'],
		61: ['Rain: Slight intensity', 'fa-solid fa-cloud-rain'],
		63: ['Rain: Moderate intensity', 'fa-solid fa-cloud-showers'],
		65: ['Rain: Heavy intensity', 'fa-solid fa-cloud-showers-heavy'],
		66: ['Freezing Rain: Light intensity', 'fa-solid fa-cloud-sleet'],
		67: ['Freezing Rain: Heavy intensity', 'fa-solid fa-cloud-sleet'],
		71: ['Snow fall: Slight intensity', 'fa-solid fa-snowflake'],
		73: ['Snow fall: Moderate intensity', 'fa-solid fa-snowflakes'],
		75: ['Snow fall: Heavy intensity', 'fa-solid fa-cloud-snow'],
		77: ['Snow grains', 'fa-solid fa-snowflake'],
		80: ['Rain showers: Slight intensity', 'fa-solid fa-cloud-rain'],
		81: ['Rain showers: Moderate intensity', 'fa-solid fa-cloud-showers'],
		82: ['Rain showers: Violent intensity', 'fa-solid fa-cloud-showers-heavy'],
		85: ['Snow showers: Slight intensity', 'fa-solid fa-snowflake'],
		86: ['Snow showers: Heavy intensity', 'fa-solid fa-cloud-snow'],
		95: ['Thunderstorm: Slight or moderate', 'fa-solid fa-cloud-bolt'],
		96: ['Thunderstorm with slight hail', 'fa-solid fa-cloud-bolt'],
		99: ['Thunderstorm with heavy hail', 'fa-solid fa-cloud-bolt-sun']
	};

	$: {
		setCurrentTime();
	}

	/**@param {number} angle*/
	function formatWindDirection(angle) {
		if (angle == undefined) {
			return 'Unknown';
		}

		/**@type {Array<codeAndIcon>}*/
		const directions = [
			['N', ''],
			['NE', ''],
			['E', ''],
			['SE', ''],
			['S', ''],
			['SW', ''],
			['W', ''],
			['NW', '']
		];
		const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;

		return directions[index];
	}

	/**
	 * @param {number} code
	 * @returns {codeAndIcon}
	 */
	function getWeatherCode(code) {
		const paddedKey = Number(String(code).padStart(3, '0'));
		let key = weatherCodes[paddedKey];

		const isNightTime = new Date(weather[currentPage].date).getHours() < 6 || new Date(weather[currentPage].date).getHours() > 18;

		if (isNightTime) {
			key[1] = key[1].replace('sun', 'moon');
		} else {
			key[1] = key[1].replace('moon', 'sun');
		}

		return key;
	}

	let pages = weather.length;
	let currentPage = 0;

	function moveForward() {
		if (currentPage <= pages) {
			currentPage++;
		}
	}

	function moveBackwards() {
		if (currentPage > 0) {
			currentPage--;
		}
	}

	function getCurrentWeather() {
		const refDate = new Date();

		const dates = weather.map((date, index) => {
			return { date: date.date, index };
		});

		return dates.reduce((closest, current) => {
			const closestDiff = Math.abs(new Date(closest.date).getTime() - refDate.getTime());
			const currentDiff = Math.abs(new Date(current.date).getTime() - refDate.getTime());

			return currentDiff < closestDiff ? current : closest;
		}).index;
	}

	function setCurrentTime() {
		currentPage = getCurrentWeather();
	}
</script>

<div class="card">
	<div class="d-flex flex-fill justify-content-between">
		<div class="d-flex align-items-center flex-wrap flex-gap-2">
			{#if getWeatherCode(weather[currentPage].weather_code)[1]}
				<i class="{getWeatherCode(weather[currentPage].weather_code)[1]} fa-2xl"></i>
			{:else}
				{getWeatherCode(weather[currentPage].weather_code)[0]}
			{/if}

			<div class="pl-3">
				<div class="d-flex flex-gap-2">
					<div class="font-weight-bold f-18">
						{format(weather[currentPage].date, 'HH:mm')}
					</div>
					|
					<div class="font-weight-bold f-18">
						{Math.round(weather[currentPage].temperature)}°C
					</div>
					|
					<div class="font-weight-bold f-18">
						{formatWindDirection(weather[currentPage].windDirection10m)[0]}
						{Math.round(weather[currentPage].windSpeed10m)}<span class="font-14">mph</span>
					</div>
				</div>

				<div class="d-flex flex-gap-2">
					<div class="font-weight-bold f-16">
						H: {weather[currentPage].relativeHumidity}%
					</div>
					|
					<div class="font-weight-bold f-16">
						P: {Math.round(weather[currentPage].precipitation)}mm
					</div>
				</div>
			</div>
		</div>
		<div class="d-flex align-items-center">
			<button
				class="btn btn-sm"
				on:click={() => moveBackwards()}
				aria-label="1 Hour Back"
				class:disabled={currentPage == 0}><i class="fa-solid fa-chevron-left"></i></button
			>
			<button
				class="btn btn-sm"
				on:click={() => moveForward()}
				aria-label="1 Hour Forward"
				class:disabled={currentPage == 23}><i class="fa-solid fa-chevron-right"></i></button
			>
		</div>
	</div>
</div>

<style>
</style>
