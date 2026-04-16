import { db, seaTemp } from '@seas/database';

/**
 * Get seasonal average for a specific date from historical data
 * Looks at same day-of-year from previous years
 * @param {Array<{date: string, temp: number}>} allData - All historical data
 * @param {Date} targetDate - Date to get seasonal average for
 * @returns {{avg: number|null, count: number}} Average temperature and count of historical records
 */
function getSeasonalAverage(allData, targetDate) {
	const targetMonth = targetDate.getMonth() + 1;
	const targetDay = targetDate.getDate();

	// Include data from nearby days (±3 days) using day-of-year circular arithmetic
	// so the window correctly crosses month and year boundaries
	const getDOY = (d) => {
		const start = new Date(d.getFullYear(), 0, 0);
		return Math.floor((d - start) / (1000 * 60 * 60 * 24));
	};
	const targetDOY = getDOY(targetDate);

	const sameDayData = allData.filter((record) => {
		const recordDOY = getDOY(new Date(record.date));
		const rawDiff = Math.abs(recordDOY - targetDOY);
		const circularDiff = Math.min(rawDiff, 365 - rawDiff);
		return circularDiff <= 3;
	});

	if (sameDayData.length === 0) return { avg: null, count: 0 };

	const sum = sameDayData.reduce((acc, record) => acc + record.temp, 0);
	return { avg: sum / sameDayData.length, count: sameDayData.length };
}

/**
 * Get recent trend as a small adjustment factor
 * @param {Array<{date: string, temp: number}>} recentData - Recent temperature records
 * @returns {number} Trend adjustment (typically -0.2 to +0.2)
 */
function getTrendAdjustment(recentData) {
	if (recentData.length < 3) return 0;

	// Simple trend: compare last 3 days average vs previous 3 days
	const recent = recentData.slice(-3);
	const previous = recentData.slice(-6, -3);

	if (previous.length < 3) return 0;

	const recentAvg = recent.reduce((a, b) => a + b.temp, 0) / 3;
	const previousAvg = previous.reduce((a, b) => a + b.temp, 0) / 3;

	// Return the difference, but dampened
	const trend = recentAvg - previousAvg;

	// Dampen extreme trends - sea temps don't change fast
	return Math.max(-0.15, Math.min(0.15, trend));
}

/**
 * Get seasonal warming/cooling trend
 * Detects if we're in a warming period (spring/summer) or cooling period (autumn/winter)
 * @param {Array<{date: string, temp: number}>} allData - All historical data
 * @param {Date} targetDate - Target prediction date
 * @returns {number} Expected temperature change per day based on seasonal cycle
 */
function getSeasonalWarmingTrend(allData, targetDate) {
	const targetMonth = targetDate.getMonth(); // 0-11

	// Spring/Summer (Mar-Aug): Warming trend
	// Autumn/Winter (Sep-Feb): Cooling trend
	const isWarmingSeason = targetMonth >= 2 && targetMonth <= 7; // Mar-Aug

	// Filter to same meteorological season so warming and cooling periods don't cancel out
	const getSeasonMonths = (month) => {
		if (month >= 2 && month <= 4) return [2, 3, 4];   // Spring
		if (month >= 5 && month <= 7) return [5, 6, 7];   // Summer
		if (month >= 8 && month <= 10) return [8, 9, 10]; // Autumn
		return [11, 0, 1];                                 // Winter
	};
	const seasonMonths = getSeasonMonths(targetMonth);

	const sorted = [...allData]
		.filter((r) => seasonMonths.includes(new Date(r.date).getMonth()))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	// Get week-over-week changes
	const weekChanges = [];
	for (let i = 7; i < sorted.length; i++) {
		const currentWeek = sorted.slice(i - 3, i + 1);
		const prevWeek = sorted.slice(i - 10, i - 6);

		if (currentWeek.length >= 4 && prevWeek.length >= 4) {
			const currentAvg = currentWeek.reduce((a, b) => a + b.temp, 0) / currentWeek.length;
			const prevAvg = prevWeek.reduce((a, b) => a + b.temp, 0) / prevWeek.length;
			weekChanges.push(currentAvg - prevAvg);
		}
	}

	if (weekChanges.length === 0) {
		// Default rates if no data
		return isWarmingSeason ? 0.05 : -0.05;
	}

	// Average the weekly changes and convert to daily rate
	const avgWeeklyChange = weekChanges.reduce((a, b) => a + b, 0) / weekChanges.length;
	const dailyRate = avgWeeklyChange / 7;

	// Ensure direction matches season (warming in spring/summer, cooling in autumn/winter)
	if (isWarmingSeason && dailyRate < 0) {
		return 0.03; // Force small warming if data shows cooling
	} else if (!isWarmingSeason && dailyRate > 0) {
		return -0.03; // Force small cooling if data shows warming
	}

	// Cap the rate
	return Math.max(-0.1, Math.min(0.1, dailyRate));
}

/**
 * Calculate year-over-year offset
 * Compares recent temps to same period last year to detect if we're running warmer/cooler
 * @param {Array<{date: string, temp: number}>} allData - All historical data
 * @returns {number} Year-over-year offset to apply to predictions
 */
function getYearOverYearOffset(allData) {
	if (allData.length < 30) return 0;

	const sorted = [...allData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	const now = new Date();

	// Get recent 7 days average
	const recent = sorted.slice(0, 7);
	const recentAvg = recent.reduce((a, b) => a + b.temp, 0) / recent.length;

	// Find same period last year (±3 days)
	const lastYearData = sorted.filter((record) => {
		const recordDate = new Date(record.date);
		const daysDiff = Math.abs(
			(now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24) - 365
		);
		return daysDiff <= 10; // Within 10 days of 1 year ago
	});

	if (lastYearData.length < 3) return 0;

	const lastYearAvg = lastYearData.reduce((a, b) => a + b.temp, 0) / lastYearData.length;
	const offset = recentAvg - lastYearAvg;

	// Cap the offset to avoid extreme adjustments
	return Math.max(-0.8, Math.min(0.8, offset));
}

/**
 * Filter out invalid temperature records
 * @param {Array<{date: string, seaTempC: string | null}>} data - Raw data from DB
 * @returns {Array<{date: string, temp: number}>} Valid records with parsed temp
 */
function filterValidRecords(data) {
	return data
		.map((record) => ({
			date: record.date,
			rawTemp: record.seaTempC,
			temp: parseFloat(record.seaTempC || '')
		}))
		.filter((record) => !isNaN(record.temp) && record.rawTemp !== 'No Data');
}

/**
 * Predict sea temperature for a specific date
 * Primary method: Use seasonal average from historical data
 * Secondary: Apply small trend adjustment from recent temps
 * @param {string | undefined} targetDateStr - Target date in YYYY-MM-DD format
 * @returns {Promise<object>} Prediction result
 */
export async function predictSeaTemperature(targetDateStr) {
	// Fetch last 500 days of historical data
	const historicalData = await db.query.seaTemp.findMany({
		orderBy: (seaTemp, { desc }) => [desc(seaTemp.date)],
		limit: 500
	});

	const validData = filterValidRecords(historicalData);

	if (validData.length < 14) {
		throw new Error('Insufficient data for prediction (need at least 14 days)');
	}

	// Sort by date ascending
	const sortedData = [...validData].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	// Get current temp for reference
	const currentTemp = sortedData[sortedData.length - 1].temp;
	const lastDate = new Date(sortedData[sortedData.length - 1].date);

	// Determine target date
	const tomorrow = new Date(lastDate);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const targetDate = targetDateStr ? new Date(targetDateStr) : tomorrow;

	// Calculate days ahead
	const daysAhead = Math.max(1, Math.round(
		(targetDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
	));

	// Get seasonal average for target date
	const seasonal = getSeasonalAverage(sortedData, targetDate);

	// Get trend adjustment from recent 7 days
	const trendAdjustment = getTrendAdjustment(sortedData.slice(-7));

	// Get year-over-year offset (how much warmer/cooler we are vs last year)
	const yearOffset = getYearOverYearOffset(sortedData);

	// Get seasonal warming/cooling trend
	const seasonalTrend = getSeasonalWarmingTrend(sortedData, targetDate);

	// Calculate prediction
	// Always start from current temp and apply gradual changes
	// Don't jump toward historical seasonal averages
	let predictedTemp;
	let confidence;

	// Get historical seasonal trend for this time period
	// This tells us if sea temps typically rise or fall at this time of year
	const todaySeasonal = getSeasonalAverage(sortedData, lastDate);
	const targetSeasonal = getSeasonalAverage(sortedData, targetDate);
	const typicalChange = (targetSeasonal.avg ?? currentTemp) - (todaySeasonal.avg ?? currentTemp);

	// Blend the calculated seasonal warming trend with typical historical change
	// weighted by how much data we have
	const seasonalWeight = Math.min(0.7, targetSeasonal.count / 10); // 0-0.7 based on data
	const calculatedWarming = seasonalTrend * daysAhead;
	const historicalWarming = typicalChange;
	const blendedWarming = (calculatedWarming * (1 - seasonalWeight)) + (historicalWarming * seasonalWeight);

	// Cap total change (sea temps don't change fast)
	const maxChange = 0.15 * daysAhead;
	const cappedWarming = Math.max(-maxChange, Math.min(maxChange, blendedWarming));

	// Base prediction: current temp + warming/cooling trend + small recent trend
	predictedTemp = currentTemp + cappedWarming + trendAdjustment + (yearOffset * 0.3);

	// Confidence based on data quality
	if (daysAhead <= 2) {
		confidence = 'high';
	} else if (targetSeasonal.count >= 5) {
		confidence = 'medium';
	} else {
		confidence = 'low';
	}

	// Round to 1 decimal place
	predictedTemp = Math.round(predictedTemp * 10) / 10;

	// Sanity clamp: Guernsey sea temps realistically stay within 8–21°C
	predictedTemp = Math.max(8, Math.min(21, predictedTemp));

	return {
		predicted_temp: predictedTemp,
		confidence,
		factors: {
			seasonal_average: seasonal.avg !== null ? Math.round(seasonal.avg * 10) / 10 : null,
			seasonal_data_points: seasonal.count,
			seasonal_warming_rate: Math.round(seasonalTrend * 1000) / 1000,
			seasonal_warming_total: Math.round(seasonalTrend * daysAhead * 100) / 100,
			typical_historical_change: Math.round(typicalChange * 100) / 100,
		blended_warming: Math.round(blendedWarming * 100) / 100,
		capped_warming: Math.round(cappedWarming * 100) / 100,
			year_over_year_offset: Math.round(yearOffset * 100) / 100,
			trend_adjustment: Math.round(trendAdjustment * 100) / 100,
			current_temp: currentTemp,
			days_ahead: daysAhead
		},
		historical_days_used: validData.length,
		prediction_for: targetDate.toISOString().split('T')[0]
	};
}
