import { main } from './main';
import { tideStorage } from './storage';

class DataCleanup {
	constructor() {}

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
