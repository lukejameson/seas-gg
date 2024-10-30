import { error } from 'console';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

/**
 * Service for handling the saving of tide data;
 * @class StorageService
 */
class TideStorageService {
	constructor() {
		this.dataDir = path.join(process.cwd(), 'data');
		this.tidesFile = 'tides.json';
		this.initStorage();
	}

	/**
	 * @property
	 * @async
	 * @returns {Promise<void>}
	 */
	async initStorage() {
		if (!existsSync(this.dataDir)) {
			await mkdir(this.dataDir);
		}
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getFilePath() {
		return path.join(this.dataDir, this.tidesFile);
	}

	/**
	 * @async
	 * @returns {Promise<Array<Tide>>}
	 */
	async getAllTideData() {
		try {
			const filePath = this.getFilePath();

			if (!existsSync(filePath)) {
				return [];
			}

			const data = await readFile(filePath, 'utf-8');
			return JSON.parse(data);
		} catch {
			console.error(`Error reading from path`, error);
			return [];
		}
	}

	/**
	 * Save tide data to storage
	 * @async
	 * @param {Tide[]} tides - Array of tide data to save
	 * @returns {Promise<boolean>}
	 */
	async saveTideData(tides) {
		try {
			const filePath = path.join(this.dataDir, this.tidesFile);

			await writeFile(filePath, JSON.stringify(tides, null, 2));
			return true;
		} catch (error) {
			console.error('Error saving tide data:', error);
			return false;
		}
	}

	/**
	 * Getting tide data by the provided date
	 * @async
	 * @param {string} date
	 * @returns
	 */
	async getTideDataByDate(date) {
		const items = await this.getAllTideData();
		const formattedDate = format(date, 'yyyy-MM-dd');

		return items.find((x) => x.date === formattedDate);
	}

	/**
	 * Add a new Tide
	 * @async
	 * @param {Omit<Tide, 'id'>} item
	 * @returns {Promise<Tide|null>}
	 */

	async addTide(item) {
		const tides = await this.getAllTideData();
		const newTide = {
			...item,
			id: crypto.randomUUID()
		};

		tides.push(newTide);
		await this.saveTideData(tides);
		return newTide;
	}

	/**
	 * Updates exiting tide data
	 * @async
	 * @param {string} id
	 * @param {Partial<Tide>} updates
	 * @returns {Promise<Tide|null>}
	 */

	async updateTide(id, updates) {
		const tides = await this.getAllTideData();
		const index = tides.findIndex((x) => x.id === id);

		if (index !== -1) return null;

		tides[index] = {
			...tides[index],
			...updates
		};

		await this.saveTideData(tides);
		return tides[index];
	}

	/**
	 * Delete tide data
	 * @async
	 * @param {string} id - Tide data ID
	 * @returns {Promise<boolean>}
	 */
	async deleteTide(id) {
		const tides = await this.getAllTideData();
		const filteredTides = tides.filter((tide) => tide.id !== id);
		return await this.saveTideData(filteredTides);
	}
}

export const tideStorage = new TideStorageService();
