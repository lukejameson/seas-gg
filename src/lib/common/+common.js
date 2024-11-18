class Common {
	/**
	 *
	 * @param {Array<TideData>} tides
	 * @returns
	 */
	closestTideRecordIndex(tides) {
		if (!tides) return;

		const dates = tides.map((tide, index) => {
			return { time: tide.time, height: tide.height, index };
		});

		const refDate = new Date();
		const currentMinutes = refDate.getHours() * 60 + refDate.getMinutes();

		return dates.reduce((closest, current) => {
			const closestDiff = Math.abs(this.timeToMinutes(closest.time) - currentMinutes);
			const currentDiff = Math.abs(this.timeToMinutes(current.time) - currentMinutes);

			return currentDiff < closestDiff ? current : closest;
		}).index;
	}

	/**
	 * Converts time string to minutes since midnight
	 * @param {string} time - Time in HH:mm format
	 * @returns {number} Minutes since midnight
	 */
	timeToMinutes(time) {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}
}

export const common = new Common();
