import ProgressTracker from "../../assets/scripts/core/ProgressTracker";
import {LevelConfig, TileColor} from "../../assets/scripts/core/levelConfig";

// Config for testing ProgressTracker class
const mockConfig: LevelConfig = {
    colors: [TileColor.Red, TileColor.Blue], // Don't test for this class
    columns: 10,                            // Don't test for this class
    rows: 10,                               // Don't test for this class
    targetScore: 100,
    maxMoves: 10,
    bonusBombCount: 3,
    bonusTeleportCount: 2,
    bonusBombRadius: 1,                     // Don't test for this class
    maxShuffleCount: 3,
    checkHasMovesDuration: 3,                // Don't test for this class
};

describe('ProgressTracker tests', () => {
    let tracker: ProgressTracker;

    beforeEach(() => {
        jest.clearAllMocks();
        // Create a new ProgressTracker instance
        tracker = new ProgressTracker(mockConfig);
    });

    // Constructor tests
    describe('Constructor tests', () => {
        // Positive cases
        it('should set correct initial values from config', () => {
            expect(tracker.targetScore).toBe(mockConfig.targetScore);
            expect(tracker.maxMoves).toBe(mockConfig.maxMoves);
            expect(tracker.remainMoves).toBe(mockConfig.maxMoves);
            expect(tracker.bonusBombCount).toBe(mockConfig.bonusBombCount);
            expect(tracker.bonusTeleportCount).toBe(mockConfig.bonusTeleportCount);
            expect(tracker.maxShuffleCount).toBe(mockConfig.maxShuffleCount);
            expect(tracker.score).toBe(0);
            expect(tracker.isGameOver).toBe(false);
        });

        // Edge cases
        it('should set bonusBombRadius even if not explicitly tested', () => {
             expect(tracker.bonusBombRadius).toBe(mockConfig.bonusBombRadius);
        });

        // Negative cases
        it('should handle zero values in config correctly', () => {
            const zeroConfig = { ...mockConfig, targetScore: 0, maxMoves: 0, bonusBombCount: 0, bonusTeleportCount: 0 };
            const zeroTracker = new ProgressTracker(zeroConfig);
            expect(zeroTracker.targetScore).toBe(0);
            expect(zeroTracker.maxMoves).toBe(0);
            expect(zeroTracker.bonusBombCount).toBe(0);
        });
    });

    // Getters and logic tests
    describe('isWin getter tests', () => {
        // Positive cases
        it('should return true when score equals targetScore', () => {
            tracker.updateScore(10); // 10*10 = 100
            expect(tracker.isWin).toBe(true);
        });
        it('should return true when score exceeds targetScore', () => {
            tracker.updateScore(11); // 11*11 = 121
            expect(tracker.isWin).toBe(true);
        });

        // Edge cases
        it('should return false when score is just below targetScore', () => {
            tracker.updateScore(9); // 9*9 = 81
            expect(tracker.isWin).toBe(false);
        });

        // Negative cases
        it('should return false when score is 0 and targetScore is positive', () => {
            expect(tracker.isWin).toBe(false);
        });
    });

    describe('isOutOfMoves getter tests', () => {
        // Positive cases
        it('should return true when remainMoves is 0', () => {
            for (let i = 0; i < mockConfig.maxMoves; i++) {
                tracker.spendMove();
            }
            expect(tracker.isOutOfMoves).toBe(true);
        });

        // Edge cases
        it('should return false when 1 move remains', () => {
            for (let i = 0; i < mockConfig.maxMoves - 1; i++) {
                tracker.spendMove();
            }
            expect(tracker.isOutOfMoves).toBe(false);
        });
    });

    describe('isOutOfBombBonus getter tests', () => {
        // Positive cases
        it('should return true when bonusBombCount is 0', () => {
            for (let i = 0; i < mockConfig.bonusBombCount; i++) {
                tracker.spendBombBonus();
            }
            expect(tracker.isOutOfBombBonus).toBe(true);
        });

        // Edge cases
        it('should return false when bonusBombCount is 1', () => {
            for (let i = 0; i < mockConfig.bonusBombCount - 1; i++) {
                tracker.spendBombBonus();
            }
            expect(tracker.isOutOfBombBonus).toBe(false);
        });

        // Negative cases
        it('should return false when bonusBombCount is at initial state', () => {
            expect(tracker.isOutOfBombBonus).toBe(false);
        });
    });

    describe('isOutOfTeleportBonus getter tests', () => {
        // Positive cases
        it('should return true when bonusTeleportCount is 0', () => {
            for (let i = 0; i < mockConfig.bonusTeleportCount; i++) {
                tracker.spendTeleportBonus();
            }
            expect(tracker.isOutOfTeleportBonus).toBe(true);
        });

        // Edge cases
        it('should return false when bonusTeleportCount is 1', () => {
            for (let i = 0; i < mockConfig.bonusTeleportCount - 1; i++) {
                tracker.spendTeleportBonus();
            }
            expect(tracker.isOutOfTeleportBonus).toBe(false);
        });

        // Negative cases
        it('should return false when bonusTeleportCount is at initial state', () => {
            expect(tracker.isOutOfTeleportBonus).toBe(false);
        });
    });

    describe('isOutOfShuffle getter tests', () => {
        // Positive cases
        it('should return true when shuffleCount reaches maxShuffleCount', () => {
            for (let i = 0; i < mockConfig.maxShuffleCount; i++) {
                tracker.spendShuffleAttempt();
            }
            expect(tracker.isOutOfShuffle).toBe(true);
        });

        // Edge cases
        it('should return false when shuffleCount is 0', () => {
            expect(tracker.isOutOfShuffle).toBe(false);
        });

        // Negative cases
        it('should return true when shuffleCount exceeds maxShuffleCount', () => {
            for (let i = 0; i < mockConfig.maxShuffleCount + 1; i++) {
                tracker.spendShuffleAttempt();
            }
            expect(tracker.isOutOfShuffle).toBe(true);
        });
    });

    // Public methods tests
    describe('updateScore method tests', () => {
        // Positive cases
        it('should add squared value of tiles to score', () => {
            tracker.updateScore(3); // 3*3 = 9
            expect(tracker.score).toBe(9);
            tracker.updateScore(4); // 4*4 = 16. Total = 9 + 16 = 25
            expect(tracker.score).toBe(25);
        });

        // Edge cases
        it('should add 0 to score when 0 tiles removed', () => {
            tracker.updateScore(0);
            expect(tracker.score).toBe(0);
        });

        // Negative cases
        it('should handle 1 tile correctly', () => {
            tracker.updateScore(1);
            expect(tracker.score).toBe(1);
        });
    });

    describe('spendMove method tests', () => {
        // Positive cases
        it('should decrement remainMoves by 1', () => {
            tracker.spendMove();
            expect(tracker.remainMoves).toBe(mockConfig.maxMoves - 1);
        });

        // Edge cases
        it('should not decrement remainMoves below 0', () => {
            for (let i = 0; i < mockConfig.maxMoves + 1; i++) {
                tracker.spendMove();
            }
            expect(tracker.remainMoves).toBe(0);
        });

        // Negative cases
        it('should stay at 0 moves when called multiple times after depletion', () => {
            for (let i = 0; i < mockConfig.maxMoves; i++) {
                tracker.spendMove();
            }
            tracker.spendMove();
            expect(tracker.remainMoves).toBe(0);
        });
    });

    describe('spendBombBonus method tests', () => {
        // Positive cases
        it('should decrement bonusBombCount by 1', () => {
            tracker.spendBombBonus();
            expect(tracker.bonusBombCount).toBe(mockConfig.bonusBombCount - 1);
        });

        // Edge cases
        it('should not decrement bonusBombCount below 0', () => {
            for (let i = 0; i < mockConfig.bonusBombCount + 1; i++) {
                tracker.spendBombBonus();
            }
            expect(tracker.bonusBombCount).toBe(0);
        });

        // Negative cases
        it('should stay at 0 bonus counts when called multiple times after depletion', () => {
            for (let i = 0; i < mockConfig.bonusBombCount; i++) {
                tracker.spendBombBonus();
            }
            tracker.spendBombBonus();
            expect(tracker.bonusBombCount).toBe(0);
        });
    });

    describe('spendTeleportBonus method tests', () => {
        // Positive cases
        it('should decrement bonusTeleportCount by 1', () => {
            tracker.spendTeleportBonus();
            expect(tracker.bonusTeleportCount).toBe(mockConfig.bonusTeleportCount - 1);
        });

        // Edge cases
        it('should not decrement bonusTeleportCount below 0', () => {
            for (let i = 0; i < mockConfig.bonusTeleportCount + 1; i++) {
                tracker.spendTeleportBonus();
            }
            expect(tracker.bonusTeleportCount).toBe(0);
        });

        // Negative cases
        it('should stay at 0 bonus counts when called multiple times after depletion', () => {
            for (let i = 0; i < mockConfig.bonusTeleportCount; i++) {
                tracker.spendTeleportBonus();
            }
            tracker.spendTeleportBonus();
            expect(tracker.bonusTeleportCount).toBe(0);
        });
    });

    describe('spendShuffleAttempt method tests', () => {
        // Positive cases
        it('should increment shuffleCount', () => {
            tracker.spendShuffleAttempt();
            expect(tracker.isOutOfShuffle).toBe(false); // since max is 3
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            expect(tracker.isOutOfShuffle).toBe(true);
        });

        // Edge cases
        it('should continue incrementing shuffleCount beyond max (internal state)', () => {
            // While getter caps it logically, the count might keep increasing
            // We check behavior via isOutOfShuffle
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            expect(tracker.isOutOfShuffle).toBe(true);
        });

        // Negative cases
        it('should start at 0 shuffle attempts', () => {
            expect(tracker.isOutOfShuffle).toBe(false);
        });
    });

    describe('resetShuffleCount method tests', () => {
        // Positive cases
        it('should reset shuffleCount to 0', () => {
            tracker.spendShuffleAttempt();
            tracker.resetShuffleCount();
            expect(tracker.isOutOfShuffle).toBe(false);
        });

        // Edge cases
        it('should work when shuffleCount is already 0', () => {
            tracker.resetShuffleCount();
            expect(tracker.isOutOfShuffle).toBe(false);
        });

        // Negative cases
        it('should work when shuffleCount was above max', () => {
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            tracker.spendShuffleAttempt();
            tracker.resetShuffleCount();
            expect(tracker.isOutOfShuffle).toBe(false);
        });
    });

    describe('restartProgress method tests', () => {
        // Positive cases
        it('should reset all values to initial state from config', () => {
            tracker.updateScore(5);
            tracker.spendMove();
            tracker.spendBombBonus();
            tracker.spendTeleportBonus();
            tracker.spendShuffleAttempt();
            tracker.isGameOver = true;

            tracker.restartProgress();

            expect(tracker.score).toBe(0);
            expect(tracker.remainMoves).toBe(mockConfig.maxMoves);
            expect(tracker.bonusBombCount).toBe(mockConfig.bonusBombCount);
            expect(tracker.bonusTeleportCount).toBe(mockConfig.bonusTeleportCount);
            expect(tracker.isOutOfShuffle).toBe(false);
            expect(tracker.isGameOver).toBe(false);
        });

        // Edge cases
        it('should not change initial config values after multiple restarts', () => {
            tracker.restartProgress();
            tracker.restartProgress();
            expect(tracker.remainMoves).toBe(mockConfig.maxMoves);
        });

        // Negative cases
        it('should handle restart even if no progress was made', () => {
            tracker.restartProgress();
            expect(tracker.score).toBe(0);
            expect(tracker.remainMoves).toBe(mockConfig.maxMoves);
        });
    });

    describe('isGameOver setter/getter tests', () => {
        // Positive cases
        it('should set and get isGameOver state', () => {
            tracker.isGameOver = true;
            expect(tracker.isGameOver).toBe(true);
            tracker.isGameOver = false;
            expect(tracker.isGameOver).toBe(false);
        });

        // Edge cases
        it('should be false by default', () => {
            expect(tracker.isGameOver).toBe(false);
        });

        // Negative cases
        it('should retain true state if set to true twice', () => {
            tracker.isGameOver = true;
            tracker.isGameOver = true;
            expect(tracker.isGameOver).toBe(true);
        });
    });
});
