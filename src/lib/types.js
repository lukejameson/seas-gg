// src/lib/types.js

/**
 * @typedef {Object} TideData
 * @property {string} time;
 * @property {number} height;
 */

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
 * @typedef {Object} Tide
 * @property {string} id
 * @property {string} date
 * @property {HourlyWeather[]|null} weather
 * @property {TideData[]|null} basicTides
 * @property {TideData[]|null} hourlyTides
 * @property {DailyExtremes[]|null} dailyExtremes
 * @property {TideData | null} currentTideHeight
 */

/**
 * @typedef {Object} TideCycle
 * @property {string} startTime
 * @property {string} endTime
 * @property {TideData} lowestPoint
 * @property {TideData} highestPoint
 */

/**
 * @typedef {Object} DailyExtremes
 * @property {TideCycle[]} cycles
 */