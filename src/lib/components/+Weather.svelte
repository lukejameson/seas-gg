<script>
	import '../../app.css';
	import { page } from '$app/stores';
	import { format, isSameDay } from 'date-fns';

	/**@type {HourlyWeather[]}*/
	export let weather;

	/**
	 * @type {Date}
	 */
	export let date;

	/**
	 * @typedef {Object} WeatherSummary
	 * @property {number} weatherCodeMode
	 * @property {codeAndIcon} modeWeatherCodeAndIcon
	 * @property {number} tempAvg
	 * @property {number} windSpeedAvg
	 * @property {string} windDirectionAvg
	 * @property {number} humidityAvg
	 * @property {number} precipitationTotal
	 */

	/**@type {WeatherSummary}*/
	let weatherSummary;

	let pages = weather.length;
	let currentPage = 0;
	let isSummaryMode = false;

	$: if (weather) {
		setCurrentTime();
		setWeatherAverage();
		setIsSummaryMode();
	}

	/** @typedef {[string, string]} codeAndIcon */
	/** @type {Record<number, codeAndIcon>}[] */
	const weatherCodes = {
		0: ['Clear', 'fa-solid fa-sun'],
		1: ['Clear', 'fa-solid fa-sun-cloud'],
		2: ['Cloudy', 'fa-solid fa-cloud-sun'],
		3: ['Overcast', 'fa-solid fa-cloud'],
		45: ['Fog', 'fa-solid fa-fog'],
		48: ['Smog', 'fa-solid fa-smog'],
		51: ['Drizzle', 'fa-solid fa-cloud-drizzle'],
		53: ['Drizzle', 'fa-solid fa-cloud-drizzle'],
		55: ['Heavy Drizzle', 'fa-solid fa-cloud-showers-heavy'],
		56: ['Freezing', 'fa-solid fa-snowflake'],
		57: ['Freezing', 'fa-solid fa-snowflake'],
		61: ['Rain', 'fa-solid fa-cloud-rain'],
		63: ['Rain', 'fa-solid fa-cloud-showers'],
		65: ['Heavy Rain', 'fa-solid fa-cloud-showers-heavy'],
		66: ['Sleet', 'fa-solid fa-cloud-sleet'],
		67: ['Sleet', 'fa-solid fa-cloud-sleet'],
		71: ['Snow', 'fa-solid fa-snowflake'],
		73: ['Snow', 'fa-solid fa-snowflakes'],
		75: ['Heavy Snow', 'fa-solid fa-cloud-snow'],
		77: ['Snow', 'fa-solid fa-snowflake'],
		80: ['Showers', 'fa-solid fa-cloud-rain'],
		81: ['Showers', 'fa-solid fa-cloud-showers'],
		82: ['Heavy Rain', 'fa-solid fa-cloud-showers-heavy'],
		85: ['Snow', 'fa-solid fa-snowflake'],
		86: ['Heavy Snow', 'fa-solid fa-cloud-snow'],
		95: ['Storm', 'fa-solid fa-cloud-bolt'],
		96: ['Storm', 'fa-solid fa-cloud-bolt'],
		99: ['Storm', 'fa-solid fa-cloud-bolt-sun']
	};
	function setWeatherAverage() {
		/**@type{HourlyWeather[]}*/
		const dayTimeWeather = weather.filter(
			(x) => new Date(x.date).getHours() >= 0o6 && new Date(x.date).getHours() <= 18
		);

		const weatherCodes = dayTimeWeather.map((x) => x.weather_code);
		const modeWeatherCode =
			weatherCodes
				.sort(
					(a, b) =>
						weatherCodes.filter((v) => v === a).length - weatherCodes.filter((v) => v === b).length
				)
				.pop() || 0;

		/**@type{number}*/
		const tempAvg = Math.round(
			dayTimeWeather.map((x) => x.temperature).reduce((a, b) => a + b) / dayTimeWeather.length
		);

		/**@type{number}*/
		const windSpeedAvg = Math.round(
			dayTimeWeather.map((x) => x.windSpeed10m).reduce((a, b) => a + b) / dayTimeWeather.length
		);

		/**@type {number}*/
		const windDirectionAvg = dayTimeWeather.map((x) => x.windDirection10m).reduce((a, b) => a + b);

		const formattedWindDirectionAvg = formatWindDirection(windDirectionAvg)[0];

		/**@type{number}*/
		const humidityAvg = Math.round(
			dayTimeWeather.map((x) => x.relativeHumidity).reduce((a, b) => a + b) / dayTimeWeather.length
		);

		/**@type{number}*/
		const precipitationTotal = Math.round(
			dayTimeWeather.map((x) => x.precipitation).reduce((a, b) => a + b)
		);

		weatherSummary = {
			weatherCodeMode: modeWeatherCode,
			modeWeatherCodeAndIcon: getWeatherCode(modeWeatherCode),
			tempAvg: tempAvg,
			windSpeedAvg: windSpeedAvg,
			windDirectionAvg: formattedWindDirectionAvg,
			humidityAvg: humidityAvg,
			precipitationTotal: precipitationTotal
		};
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

	function setIsSummaryMode() {
		const currentDate = new Date();

		if (!isSameDay(currentDate, date)) {
			isSummaryMode = true;
		} else {
			isSummaryMode = false;
		}
	}

	/**
	 * @param {number} code
	 * @returns {codeAndIcon}
	 */
	function getWeatherCode(code) {
		const paddedKey = Number(String(code).padStart(3, '0'));
		let key = weatherCodes[paddedKey];

		const isNightTime =
			new Date(weather[currentPage].date).getHours() < 6 ||
			new Date(weather[currentPage].date).getHours() > 18;

		if (isNightTime) {
			key[1] = key[1].replace('sun', 'moon');
		} else {
			key[1] = key[1].replace('moon', 'sun');
		}

		return key;
	}

	function moveForward() {
		isSummaryMode = false;

		if (currentPage <= pages) {
			currentPage++;
		}
	}

	function moveBackwards() {
		isSummaryMode = false;

		if (currentPage > 0) {
			currentPage--;
		}
	}

	function onSummaryClick() {
		isSummaryMode = !isSummaryMode;
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
		const formattedDate = format(new Date($page.data.date), 'yyyy-MM-dd');

		if (formattedDate != format(new Date(), 'yyyy-MM-dd')) {
			currentPage = 12;

			return;
		}

		currentPage = getCurrentWeather();
	}
</script>

<div class="card h-100 w-100">
	<div class="d-flex flex-fill flex-wrap justify-content-between">
		<div class="d-flex align-items-center flex-wrap gap-2">
			{#if isSummaryMode}
				<div>
					<div class="text-center">
						<i
							class="{weatherSummary.modeWeatherCodeAndIcon[1]} fa-2xl"
							data-toggle="tooltip"
							data-placement="top"
							title={weatherSummary.modeWeatherCodeAndIcon[0]}
						></i>
					</div>

					<span>{weatherSummary.modeWeatherCodeAndIcon[0]}</span>
				</div>

				<div class="pl-3">
					<div class="d-flex flex-gap-2">
						<div class="font-weight-bold f-16">
							{weatherSummary.tempAvg}°C
						</div>
						&nbsp;|&nbsp;
						<div class="font-weight-bold f-16">
							{weatherSummary.windDirectionAvg}
							{weatherSummary.windSpeedAvg}<span class="font-14">mph</span>
						</div>
					</div>

					<div class="d-flex flex-gap-2">
						<div class="font-weight-bold f-16">
							H: {weatherSummary.humidityAvg}%
						</div>
						&nbsp; | &nbsp;
						<div class="font-weight-bold f-16">
							P: {weatherSummary.precipitationTotal}mm
						</div>
					</div>
				</div>
			{:else}
				{#if getWeatherCode(weather[currentPage].weather_code)[1]}
					<div>
						<div class="text-center">
							<i class="{getWeatherCode(weather[currentPage].weather_code)[1]} fa-2xl"></i>
						</div>
						<span>{getWeatherCode(weather[currentPage].weather_code)[0]}</span>
					</div>
				{:else}
					{getWeatherCode(weather[currentPage].weather_code)[0]}
				{/if}
				<div class="pl-1">
					<div class="d-flex flex-gap-2">
						<div class="font-weight-bold f-16">
							{format(weather[currentPage].date, 'HH:mm')}
						</div>
						&nbsp;|&nbsp;
						<div class="font-weight-bold f-16">
							{Math.round(weather[currentPage].temperature)}°C
						</div>
						&nbsp;|&nbsp;
						<div class="font-weight-bold f-16">
							{formatWindDirection(weather[currentPage].windDirection10m)[0]}
							{Math.round(weather[currentPage].windSpeed10m)}<span class="font-14">mph</span>
						</div>
					</div>

					<div class="d-flex flex-gap-2">
						<div class="font-weight-bold f-16">
							H: {weather[currentPage].relativeHumidity}%
						</div>
						&nbsp;|&nbsp;
						<div class="font-weight-bold f-16">
							P: {Math.round(weather[currentPage].precipitation)}mm
						</div>
					</div>
				</div>
			{/if}
		</div>
		<div class="d-flex align-items-center gap-1 ms-auto me-auto ms-sm-0 me-sm-0 pt-2 pt-sm-0">
			<button
				class="btn btn-sm"
				on:click={() => onSummaryClick()}
				class:btn-selected={isSummaryMode}
				data-toggle="tooltip"
				data-placement="top"
				title={'Summary Mode'}
				aria-label="1 Hour Forward"
				class:disabled={currentPage == 23}><i class="fa-solid fa-list"></i></button
			>
			<button
				class="btn btn-sm"
				on:click={() => moveBackwards()}
				aria-label="1 Hour Back"
				data-toggle="tooltip"
				data-placement="top"
				title={'1 Hour Back'}
				class:disabled={currentPage == 0}><i class="fa-solid fa-chevron-left"></i></button
			>
			<button
				class="btn btn-sm"
				on:click={() => moveForward()}
				aria-label="1 Hour Forward"
				data-toggle="tooltip"
				data-placement="top"
				title={'1 Hour Forward'}
				class:disabled={currentPage == 23}><i class="fa-solid fa-chevron-right"></i></button
			>
		</div>
	</div>
</div>

<style>
	@media only screen and (min-width: 600px) {
		.card {
			width: 500px;
		}
	}
</style>
