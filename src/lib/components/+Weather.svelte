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

	/**@param {number} angle*/
	function formatWindDirection(angle) {
		if (angle == undefined) {
			return 'Unknown';
		}

		const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
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

		const isNightTime = new Date(weather[currentPage].date).getHours() < 6;

		// if (paddedKey == 0 && isNightTime) {
		// 	key[1] = 'fa-solid fa-moon-stars';
		// } else {
		// 	key[1] = 'fa-solid fa-sun';
		// }

		return key;
	}

	let pages = weather.length;
	let currentPage = 0;

	function moveForward() {
		if (currentPage < pages) {
			currentPage++;
		}
	}

	function moveBackwards() {
		if (currentPage > 0) {
			currentPage--;
		}
	}

	function getCurrentWeather() {}
</script>

<div class="card">
	<div class="d-flex flex-fill justify-content-between">
		<div class="d-flex align-items-center weather-code">
			{#if getWeatherCode(weather[currentPage].weather_code)[1]}
				<i class="{getWeatherCode(weather[currentPage].weather_code)[1]} font-3rem"></i>
			{:else}
				{getWeatherCode(weather[currentPage].weather_code)[0]}
			{/if}

			<div style="padding-left: 16px; font-size: 1.25rem" class="font-weight-bold">
				{format(weather[currentPage].date, 'HH:mm')}
			</div>
			<div style="padding-left: 16px; font-size: 1.25rem" class="font-weight-bold">
				{Math.round(weather[currentPage].temperature)}c
			</div>

			<div style="padding-left: 16px; font-size: 1.25rem" class="font-weight-bold">
				{Math.round(weather[currentPage].windSpeed10m)}mph
				{formatWindDirection(weather[currentPage].windDirection10m)}
			</div>
		</div>
		<div class="buttons">
			<button class="btn btn-sm" on:click={() => moveBackwards()}
				><i class="fa-solid fa-chevron-left"></i></button
			>
			<button class="btn btn-sm" on:click={() => moveForward()}
				><i class="fa-solid fa-chevron-right"></i></button
			>
		</div>
	</div>
</div>

<style>
</style>
