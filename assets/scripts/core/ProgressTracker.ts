import {LevelConfig} from "./levelConfig";

export default class ProgressTracker {
	private _score: number;
	private _remainMoves: number;
	private _bonusBombCount: number;
	private _bonusTeleportCount: number;
	private _shuffleCount: number = 0;
	private _isGameOver = false;

	private readonly _targetScore: number;
	private readonly _maxMoves: number;
	private readonly _bonusBombMaxCount: number;
	private readonly _bonusTeleportMaxCount: number;
	private readonly _bonusBombRadius: number;
	private readonly _maxShuffleCount: number;


	constructor(level: LevelConfig) {
		this._score = 0;
		this._remainMoves = level.maxMoves;
		this._bonusBombCount = level.bonusBombCount;
		this._bonusTeleportCount = level.bonusTeleportCount;

		this._targetScore = level.targetScore;
		this._maxMoves = level.maxMoves;
		this._bonusBombMaxCount = level.bonusBombCount;
		this._bonusTeleportMaxCount = level.bonusTeleportCount;
		this._bonusBombRadius = level.bonusBombRadius;
		this._maxShuffleCount = level.maxShuffleCount;
	}

	get score(): number {
		return this._score;
	}
	get targetScore(): number {
		return this._targetScore;
	}
	get maxMoves(): number {
		return this._maxMoves;
	}
	get remainMoves(): number {
		return this._remainMoves;
	}
	get bonusBombCount(): number {
		return this._bonusBombCount;
	}
	get bonusTeleportCount(): number {
		return this._bonusTeleportCount;
	}
	get bonusBombRadius(): number {
		return this._bonusBombRadius;
	}
	get maxShuffleCount(): number {
		return this._maxShuffleCount;
	}
	get isGameOver(): boolean {
		return this._isGameOver;
	}
	get isWin(): boolean {
		return this._score >= this.targetScore;
	}
	get isOutOfMoves(): boolean {
		return this._remainMoves <= 0;
	}
	get isOutOfBombBonus(): boolean {
		return this._bonusBombCount <= 0;
	}
	get isOutOfTeleportBonus(): boolean {
		return this._bonusTeleportCount <= 0;
	}
	get isOutOfShuffle(): boolean {
		return this._shuffleCount >= this.maxShuffleCount;
	}
	set isGameOver(value: boolean) {
		this._isGameOver = value;
	}

	/**
	 * Calculates the score based count of removed tiles.
	 * Score is calculated as a square of the count of removed tiles
	 * @param {number} score
	 * @returns {number}
	 */
	private calculateScore(score: number): number {
		return score * score;
	}
	/**
	 * Updates the score based on the count of removed tiles.
	 * @param {number} score
	 */
	public updateScore(score: number): void {
		this._score += this.calculateScore(score);
	}
	/**
	 * Decrease one move only when a tile group is removed.
	 */
	public spendMove(): void {
		if (this._remainMoves > 0) {
			this._remainMoves--;
		}
	}
	/**
	 * Decrease one bomb bonus only when it was used.
	 */
	public spendBombBonus(): void {
		if (this._bonusBombCount > 0) {
			this._bonusBombCount--;
		}
	}
	/**
	 * Decrease one teleport bonus only when it was used.
	 */
	public spendTeleportBonus(): void {
		if (this._bonusTeleportCount > 0) {
			this._bonusTeleportCount--;
		}
	}
	/**
	 * Increase shuffle attempt counter.
	 */
	public spendShuffleAttempt(): void {
		this._shuffleCount++;
	}
	/**
	 * Resets shuffle attempt counter.
	 */
	public resetShuffleCount(): void {
		this._shuffleCount = 0;
	}
	/**
	 * Resets the progress tracker to its initial state.
	 */
	public restartProgress(): void {
		this._score = 0;
		this._remainMoves = this._maxMoves;
		this._bonusBombCount = this._bonusBombMaxCount;
		this._bonusTeleportCount = this._bonusTeleportMaxCount;
		this._shuffleCount = 0;
		this._isGameOver = false;
	}
}
