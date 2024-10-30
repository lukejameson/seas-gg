import { main } from './main';
import { tideStorage } from './storage';

/**
 * Used to remove data that is older than yesterday.
 * @class DataCleanup
 */
class DataCleanup {
	constructor() {}

	/**
	 * Reads all the current tides then removed all records that are > 1 away
	 */
	async processOldTideRecords() {
		const existingTides = await tideStorage.getAllTideData();

		/**@type {string[]} */
		const oldRecordsIds = existingTides
			.filter((x) => !main.isWithinOneDays(new Date(x.date)))
			.map((x) => x.id);

		oldRecordsIds.forEach(async (x) => {
			await tideStorage.deleteTide(x)
		});
	}
}

export const dataCleanup = new DataCleanup();
