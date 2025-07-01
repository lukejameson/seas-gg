// src/lib/types.js

/**
 * @typedef {Object} WeeklyTides
 * @property {string} id
 * @property {Date} startofweekdate
 * @property {Date} endofweekdate
 * @property {TideRecord[]} data
 */

/**
 * @typedef {Object} TideRecord
 * @property {Date} date
 * @property {TideData[]|null} tideData
 */

/**
 * @typedef {Object} TideData
 * @property {string} time;
 * @property {number} height;
 */

/**
 * @typedef {Object} VerboseTideData
 * @property {string|null} typeof;
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
 * @property {number} apparent_temperature
 * @property {number} uv_index
 */

/**
 * @typedef {Object} Tide
 * @property {string} id
 * @property {string} date
 * @property {VerboseTideData[]|null} basicTides
 * @property {TideData[]|null} hourlyTides
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

/**
 * @typedef {Object} SeaTemperature
 * @property {Date} date
 * @property {string} sea_temp_c
 */

/**
 * @typedef {Object} Pools
 * @property {string} poolName
 */

/**
 * @typedef {Object} PoolCleaningDates
 * @property {Date} date
 * @property {Pools[]} pools
 */
