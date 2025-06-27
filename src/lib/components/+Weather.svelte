<script>
	import { page } from '$app/stores';
	import { format, isSameDay } from 'date-fns';
	import '../../app.css';
	import { isMobile } from '../stores/device.js';
	import Icon from './+Icon.svelte';

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
	 * @property {number} apparentTemperatureAvg
	 * @property {number} uvIndexAverage
	 */

	/**@type {WeatherSummary}*/
	let weatherSummary;

	let pages = weather.length;
	let currentPage = 0;
	let isSummaryMode = false;
	let iconSize = isMobile ? '2rem' : '3rem';

	$: if (weather) {
		setCurrentTime();
		setWeatherAverage();
		setIsSummaryMode();
	}

	/** @typedef {[string, string]} codeAndIcon */
	/** @type {Record<number, codeAndIcon>}[] */
	const weatherCodes = {
		0: ['Clear', 'sun'],
		1: ['Clear', 'sunCloud'],
		2: ['Cloudy', 'cloudSun'],
		3: ['Overcast', 'cloud'],
		45: ['Fog', 'fog'],
		48: ['Smog', 'smog'],
		51: ['Drizzle', 'cloudDrizzle'],
		53: ['Drizzle', 'cloudDrizzle'],
		55: ['Heavy Drizzle', 'cloudShowersHeavy'],
		56: ['Freezing', 'snowflake'],
		57: ['Freezing', 'snowflake'],
		61: ['Rain', 'cloudRain'],
		63: ['Rain', 'cloudShowers'],
		65: ['Heavy Rain', 'cloudShowersHeavy'],
		66: ['Sleet', 'cloudSleet'],
		67: ['Sleet', 'cloudSleet'],
		71: ['Snow', 'snowflake'],
		73: ['Snow', 'snowflakes'],
		75: ['Heavy Snow', 'cloudSnow'],
		77: ['Snow', 'snowflake'],
		80: ['Showers', 'cloudRain'],
		81: ['Showers', 'cloudShowers'],
		82: ['Heavy Rain', 'cloudShowersHeavy'],
		85: ['Snow', 'snowflake'],
		86: ['Heavy Snow', 'cloudSnow'],
		95: ['Storm', 'cloudBolt'],
		96: ['Storm', 'cloudBolt'],
		99: ['Storm', 'cloudBoltSun']
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

		const apparentTempAvg = Math.round(
			dayTimeWeather.map((x) => x.apparent_temperature).reduce((a, b) => a + b) /
				dayTimeWeather.length
		);

		const uvIndexAvg = Math.round(
			dayTimeWeather.map((x) => x.uv_index).reduce((a, b) => a + b) / dayTimeWeather.length
		);

		weatherSummary = {
			weatherCodeMode: modeWeatherCode,
			modeWeatherCodeAndIcon: getWeatherCode(modeWeatherCode),
			tempAvg: tempAvg,
			windSpeedAvg: windSpeedAvg,
			windDirectionAvg: formattedWindDirectionAvg,
			humidityAvg: humidityAvg,
			precipitationTotal: precipitationTotal,
			apparentTemperatureAvg: apparentTempAvg,
			uvIndexAverage: uvIndexAvg
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
	<div class="weather-container">
		<div class="weather-content">
			{#if isSummaryMode}
				<div class="weather-summary">
					<div class="weather-icon-section">
						<div class="weather-icon-container">
							<Icon name={weatherSummary.modeWeatherCodeAndIcon[1]} size="3rem"></Icon>
							<span class="weather-condition">{weatherSummary.modeWeatherCodeAndIcon[0]}</span>
						</div>
					</div>

					<div class="weather-details">
						<div class="weather-row primary-row">
							<div class="weather-item">
								<span class="weather-value">{weatherSummary.tempAvg}°C</span>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-value">{weatherSummary.apparentTemperatureAvg}°C</span>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-value"
									>{weatherSummary.windDirectionAvg}
									{weatherSummary.windSpeedAvg}<span class="font-12">mph</span></span
								>
							</div>
						</div>

						<div class="weather-row secondary-row">
							<div class="weather-item">
								<span class="weather-label">H:</span>
								<span class="weather-value">{weatherSummary.humidityAvg}%</span>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-label">P:</span>
								<span class="weather-value">{weatherSummary.precipitationTotal}mm</span>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-label">UV:</span>
								<span class="weather-value">{weatherSummary.uvIndexAverage}</span>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="weather-hourly">
					<div class="weather-icon-section">
						{#if getWeatherCode(weather[currentPage].weather_code)[1]}
							<div class="weather-icon-container">
								<Icon name={getWeatherCode(weather[currentPage].weather_code)[1]} size={iconSize}
								></Icon>
								<span class="weather-condition"
									>{getWeatherCode(weather[currentPage].weather_code)[0]}</span
								>
							</div>
						{:else}
							<span class="weather-condition"
								>{getWeatherCode(weather[currentPage].weather_code)[0]}</span
							>
						{/if}
					</div>

					<div class="weather-details">
						<div class="weather-row primary-row">
							<div class="weather-item">
								<span class="weather-value">{format(weather[currentPage].date, 'ha')}</span>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-value">{Math.round(weather[currentPage].temperature)}°C</span>
								<span class="weather-feels-like"
									>({Math.round(weather[currentPage].apparent_temperature)}°C)</span
								>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-value"
									>{formatWindDirection(weather[currentPage].windDirection10m)[0]}
									{Math.round(weather[currentPage].windSpeed10m)}<span class="font-12">mph</span
									></span
								>
							</div>
						</div>

						<div class="weather-row secondary-row">
							<div class="weather-item">
								<span class="weather-label">H:</span>
								<span class="weather-value">{weather[currentPage].relativeHumidity}%</span>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-label">P:</span>
								<span class="weather-value">{Math.round(weather[currentPage].precipitation)}mm</span
								>
							</div>
							<div class="weather-separator">|</div>
							<div class="weather-item">
								<span class="weather-label">UV:</span>
								<span class="weather-value">{Math.round(weather[currentPage].uv_index)}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
		<div class="weather-controls">
			<button
				class="btn btn-sm"
				on:click={() => onSummaryClick()}
				class:btn-selected={isSummaryMode}
				data-toggle="tooltip"
				data-placement="top"
				title={'Summary Mode'}
				aria-label="1 Hour Forward"><Icon name="list" size="14px"></Icon></button
			>
			<button
				class="btn btn-sm"
				on:click={() => moveBackwards()}
				aria-label="1 Hour Back"
				data-toggle="tooltip"
				data-placement="top"
				title={'1 Hour Back'}
				class:disabled={currentPage == 0}><Icon name="chevronLeft" size="14px"></Icon></button
			>
			<button
				class="btn btn-sm"
				on:click={() => moveForward()}
				aria-label="1 Hour Forward"
				data-toggle="tooltip"
				data-placement="top"
				title={'1 Hour Forward'}
				class:disabled={currentPage == 23}><Icon name="chevronRight" size="14px"></Icon></button
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

	.weather-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.weather-content {
		flex: 1;
	}

	.weather-summary,
	.weather-hourly {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 1rem;
	}

	.weather-icon-section {
		flex-shrink: 0;
	}

	.weather-icon-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 60px;
		text-align: center;
	}

	.weather-condition {
		font-size: 0.875rem;
		margin-top: 0.25rem;
		color: var(--text-primary);
	}

	.weather-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.weather-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.weather-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--text-primary);
	}

	.weather-value {
		font-weight: bold;
		font-size: 1rem;
		color: var(--text-primary);
	}

	.weather-label {
		font-weight: bold;
		font-size: 1rem;
		color: var(--text-primary);
	}

	.weather-feels-like {
		font-size: 0.7rem;
		opacity: 0.8;
	}

	.weather-separator {
		color: var(--text-muted);
		font-weight: normal;
	}

	.weather-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	@media only screen and (max-width: 600px) {
		.weather-summary,
		.weather-hourly {
			flex-direction: row;
			align-items: flex-start;
			text-align: left;
			gap: 0.75rem;
		}

		.weather-icon-container {
			width: 50px;
		}

		.weather-details {
			width: 100%;
		}

		.weather-row {
			justify-content: flex-start;
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.primary-row .weather-item {
			flex-direction: row;
			align-items: center;
			text-align: left;
		}

		.secondary-row {
			margin-top: 0.25rem;
		}

		.weather-value {
			font-size: 1rem;
		}

		.weather-label {
			font-size: 0.9rem;
		}

		.weather-feels-like {
			font-size: 0.9rem;
			margin-top: 0;
			margin-left: 0.25rem;
		}

		.weather-separator {
			color: var(--text-muted);
			font-weight: normal;
		}

		.weather-controls {
			margin-top: 0.5rem;
			gap: 0.25rem;
		}
	}

	@media only screen and (min-width: 600px) {
		.weather-controls {
			align-self: flex-end;
			margin-top: 0;
		}

		.weather-container {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
		}
	}
</style>
