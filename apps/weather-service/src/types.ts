export type HourlyWeather = {
	date: string;
	temperature: number;
	relativeHumidity: number;
	precipitation: number;
	visibility: number;
	windSpeed10m: number;
	windDirection10m: number;
	weather_code: number;
	apparent_temperature: number;
	uv_index: number;
};

export type WeatherData = {
	date: string;
	hourly: HourlyWeather[];
};
