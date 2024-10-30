import { differenceInMilliseconds, parseISO } from 'date-fns';

class ExtraTideProcessing {
	/**
	 *
	 * @param {TideData[] | null} tide
	 * @param {Date} date
	 */
	findClosestTime(tide, date) {
		const now = new Date();

		if (!tide) return null;

		return tide.reduce((closest, current) => {
			const currentDateTime = parseISO(`${date}T${current}`);
			const closestDateTime = parseISO(`${date}T${closest}`);

			const currentDiff = Math.abs(differenceInMilliseconds(now, currentDateTime));
			const closestDiff = Math.abs(differenceInMilliseconds(now, closestDateTime));

			return currentDiff < closestDiff ? current : closest;
		});
	}
}

export const extraTideProcessing = new ExtraTideProcessing();
