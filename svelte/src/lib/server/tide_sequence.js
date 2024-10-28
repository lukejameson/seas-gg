/**
 * @typedef {Object} CycleData
 * @property {string} startTime
 * @property {TideData[]} points
 */

class TideSequence {
	constructor() {
		/**
		 * @type {TideData[]}
		 */
		this.tideData = [];

		/**
		 * @type {number}
		 */

		this.threshold = 6.5;
	}
	/**
	 *
	 * @param {TideData[]} records
	 */
	parseTideData(records) {
		try {
			this.tideData = records.map((record) => ({
				time: record.time,
				height: record.height
			}));
			return true;
		} catch (error) {
			console.error('Error parsing tide data:', error);
			return false;
		}
	}

	/**
	 * @private
	 * @returns {TideCycle[]}
	 */
	findCycles() {
		/**
            @typedef {TideCycle[]} 
         */
		const cycles = [];

		/**
		 * @type {CycleData|null} currentCycle
		 */
		let currentCycle = null;

		for (let i = 0; i < this.tideData.length; i++) {
			const current = this.tideData[i];
			const prev = i > 0 ? this.tideData[i - 1] : null;

			if (prev && prev.height >= this.threshold && current.height < this.threshold) {
				if (currentCycle) {
					const cycle = this.createCycle(currentCycle);
					if (cycle) cycles.push(cycle);
				}

				currentCycle = {
					startTime: current.time,
					points: [current]
				};
			} else if (currentCycle) {
				currentCycle.points.push(current);

				if (prev && prev.height < this.threshold && current.height >= this.threshold) {
					const cycle = this.createCycle(currentCycle);
					if (cycle) cycles.push(cycle);
					currentCycle = null;
				}
			}
		}

		if (currentCycle) {
			const cycle = this.createCycle(currentCycle);
			if (cycle) cycles.push(cycle);
		}

		return cycles;
	}

	/**
	 * @param {CycleData} cycleData
	 * @returns {TideCycle|null}
	 */
	createCycle(cycleData) {
		if (!cycleData.startTime || cycleData.startTime.length == 0) return null;

		const lowestPoint = cycleData.points.reduce(
			(max, point) => (point.height < max.height ? point : max),
			cycleData.points[0]
		);
		const highestPoint = cycleData.points.reduce(
			(max, point) => (point.height > max.height ? point : max),
			cycleData.points[0]
		);

		return {
			startTime: cycleData.startTime,
			endTime: cycleData.points[cycleData.points.length - 1].time,
			lowestPoint,
			highestPoint
		};
	}

	/**
	 *
	 * @returns {DailyExtremes[]}
	 */
	getDailyExtremes() {
		const cycles = this.findCycles();
		return cycles.map((cycle) => {
			return { cycles, cycle };
		});
	}

	/**
	 *
	 * @param {TideData[]|null} records
	 * @returns {DailyExtremes[]|null}
	 */
	processTideData(records) {
		if (!records) return null;

		if (this.parseTideData(records)) {
			return this.getDailyExtremes();
		}
		return null;
	}
}

export const tideSequence = new TideSequence();
