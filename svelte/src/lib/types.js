// src/lib/types.js
/**
 * @typedef {Object} HourlyWeather
 * @property {Date} date
 * @property {number} temperature
 * @property {number} relativeHumidity
 * @property {number} precipitation
 * @property {number} visibility
 * @property {number} windSpeed10m
 * @property {number} windDirection10m
 * @property {number} weather_code
 */

/**
 * @typedef {Object} TideData
 * @property {string} id
 * @property {string} date
 * @property {HourlyWeather[]|null} weather
 * @property {Record<string, string>[]|null} basicTides
 * @property {Record<string, string>[]|null} hourlyTides
 */
