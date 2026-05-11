export default class Random {

	/**
	 * Generates a random integer between 0 and maxLimit.
	 * @param {number} maxLimit
	 * @private
	 */
    private randomizeInt(maxLimit: number): number {
		return Math.floor(Math.random() * maxLimit);
    }

	/**
	 * Picks a random item from the given array.
	 */
    public pick<T>(items: T[]): T {
       return items[this.randomizeInt(items.length)];
    }
}
