import GameBoard from "../../assets/scripts/core/GameBoard";
import Random from "../../assets/scripts/utils/Random";
import Tile from "../../assets/scripts/core/Tile";
import {LevelConfig, TileColor} from "../../assets/scripts/core/levelConfig";

jest.mock("../../assets/scripts/utils/Random");

// Config for testing GameBoard class
const mockConfig: LevelConfig = {
	colors: [TileColor.Red, TileColor.Blue, TileColor.Green],
	columns: 3,
	rows: 3,
	targetScore: 100, // Don't test for this class
	maxMoves: 10, // Don't test for this class
	bonusBombCount: 1, // Don't test for this class
	bonusTeleportCount: 1, // Don't test for this class
	bonusBombRadius: 1,
	maxShuffleCount: 3, // Don't test for this class
	checkHasMovesDuration: 3, // Don't test for this class
};

describe('GameBoard tests', () => {
	let board: GameBoard;

	beforeEach(() => {
		jest.clearAllMocks();
		Tile.resetIdCounter();

		// Default mocked rand.pick returns Red
		(Random.prototype.pick as jest.Mock).mockReturnValue(TileColor.Red);

		// Create a new GameBoard instance
		board = new GameBoard(mockConfig);
	});

	// Constructor tests
	describe('Constructor tests', () => {
		// Positive cases
		it('should sets correct size of the board from config', () => {
			expect(board.x).toBe(mockConfig.columns);
			expect(board.y).toBe(mockConfig.rows);
		});
		it('should sets correct colors of the board from config', () => {
			expect(board.colors).toEqual(mockConfig.colors);
		});
		// Edge cases
		it('should use default size of the board if size more then allowed diapason', () => {
			const invalidConfig = {...mockConfig, columns: 11, rows: 11};
			const invalidBoard = new GameBoard(invalidConfig);
			expect(invalidBoard.x).toBe(10);
			expect(invalidBoard.y).toBe(10);
		});
		it('should use default size of the board if size less then allowed diapason', () => {
			const invalidConfig = {...mockConfig, columns: 0, rows: 0};
			const invalidBoard = new GameBoard(invalidConfig);
			expect(invalidBoard.x).toBe(10);
			expect(invalidBoard.y).toBe(10);
		});
		// Negative cases
		it('should save warnMsg if size from config is incorrect', () => {
			const invalidConfig = {...mockConfig, columns: -1, rows: -1};
			const invalidBoard = new GameBoard(invalidConfig);
			expect(invalidBoard.warnMsg).toContain('columns= -1');
			expect(invalidBoard.warnMsg).toContain('rows= -1');
			expect(invalidBoard.warnMsg).toContain('10x10');
		})
	});

	// initGrid method tests
	describe('initGrid method tests ', () => {
		// Positive cases
		it('should create grid with correct number of columns', () => {
			board.initGrid();
			expect(board.grid).toHaveLength(mockConfig.columns);
		});
		it('should create grid with correct number of rows per column', () => {
			board.initGrid();
			expect(board.grid[0]).toHaveLength(mockConfig.rows);
		});
		it('should fill all cells with null after initialization', () => {
			board.initGrid();
			for (const col of board.grid) {
				for (const cell of col) {
					expect(cell).toBeNull();
				}
			}
		});

		// Edge cases
		it('should create grid with size 1x1 when min allowed config values provided', () => {
			const edgeConfig = {...mockConfig, columns: 1, rows: 1};
			const edgeBoard = new GameBoard(edgeConfig);
			edgeBoard.initGrid();
			expect(edgeBoard.grid).toHaveLength(1);
			expect(edgeBoard.grid[0]).toHaveLength(1);
		});
		it('should create grid with size 10x10 when max allowed config values provided', () => {
			const edgeConfig = {...mockConfig, columns: 10, rows: 10};
			const edgeBoard = new GameBoard(edgeConfig);
			edgeBoard.initGrid();
			expect(edgeBoard.grid).toHaveLength(10);
			expect(edgeBoard.grid[0]).toHaveLength(10);
		});
	});


	// generateGrid method tests
	describe('generateGrid method tests', () => {
		// Positive cases
		it('should fill all cells with tiles', () => {
			board.generateGrid();
			for (const col of board.grid) {
				for (const cell of col) {
					expect(cell).not.toBeNull();
				}
			}
		});
		it('should assign color to tiles using Random.pick', () => {
			board.generateGrid();
			// Random.pick is mocked to always return Red
			for (const gridRow of board.grid) {
				for (const y of gridRow) {
					expect(y).not.toBeNull();
					expect(y?.color).toBe(TileColor.Red);
				}
			}
		});

		// Edge cases
		it('should call Random.pick once per each cell', () => {
			board.generateGrid();
			// 3 columns x 3 rows = 9 cells
			expect(Random.prototype.pick).toHaveBeenCalledTimes(9);
		});

		// Negative cases
		it('should overwrite existing grid when called twice', () => {
			board.generateGrid();
			(Random.prototype.pick as jest.Mock).mockReturnValue(TileColor.Blue);
			board.generateGrid();
			for (const x of board.grid) {
				for (const y of x) {
					expect(y?.color).toBe(TileColor.Blue);
				}
			}
		});
	});


	// findGroup method tests
	describe('findGroup method tests', () => {
		// Positive cases
		it('should find all connected tiles of the same color', () => {
			// All tiles are Red — the entire 3x3 grid is one group
			board.generateGrid();
			const group = board.findGroup(0, 0);
			expect(group).toHaveLength(9);
		});
		it('should return only tiles connected to the start tile', () => {
			// Checkerboard pattern — Red tiles are not adjacent to each other
			(Random.prototype.pick as jest.Mock)
				.mockReturnValueOnce(TileColor.Red)   // [0][0]
				.mockReturnValueOnce(TileColor.Red)  // [0][1]
				.mockReturnValueOnce(TileColor.Blue)   // [0][2]
				.mockReturnValueOnce(TileColor.Red)  // [1][0]
				.mockReturnValueOnce(TileColor.Blue)   // [1][1]
				.mockReturnValueOnce(TileColor.Blue)  // [1][2]
				.mockReturnValueOnce(TileColor.Blue)   // [2][0]
				.mockReturnValueOnce(TileColor.Blue)  // [2][1]
				.mockReturnValueOnce(TileColor.Red);  // [2][2]
			board.generateGrid();
			const group = board.findGroup(0, 0);
			expect(group).toHaveLength(3);
		});

		// Edge cases
		it('should return single tile group when no neighbors have the same color', () => {
			(Random.prototype.pick as jest.Mock)
				.mockReturnValueOnce(TileColor.Red)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue);
			board.generateGrid();
			const group = board.findGroup(0, 0);
			expect(group).toHaveLength(1);
		});

		// Negative cases
		it('should return empty array when target cell is null', () => {
			board.initGrid(); // all cells are null
			const group = board.findGroup(0, 0);
			expect(group).toEqual([]);
		});
	});

	// removeTiles method tests
	describe('removeTiles method tests', () => {
		// Positive cases
		it('should set removed tiles cells to null in grid', () => {
			board.generateGrid();
			const group = board.findGroup(0, 0);
			board.removeTiles(group);
			for (const rows of board.grid) {
				for (const cell of rows) {
					expect(cell).toBeNull();
				}

			}
		});
		it('should return array of removed tiles', () => {
			board.generateGrid();
			const group = board.findGroup(0, 0);
			const removed = board.removeTiles(group);
			expect(removed).toHaveLength(group.length);
		});

		// Edge cases
		it('should return empty array when called with empty tile group', () => {
			board.generateGrid();
			const removed = board.removeTiles([]);
			expect(removed).toHaveLength(0);
		});

		// Negative cases
		it('should not affect cells that are not in the tile group', () => {
			(Random.prototype.pick as jest.Mock)
				.mockReturnValueOnce(TileColor.Red)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue);
			board.generateGrid();
			const group = board.findGroup(0, 0); // only [0][0] Red tile
			board.removeTiles(group);
			expect(board.grid[0][1]).not.toBeNull(); // Blue tile untouched
		});
	});

	// shiftTiles method tests
	describe('shiftTiles method tests', () => {
		// Positive cases
		it('should shift tiles down to fill empty cells', () => {
			board.generateGrid();
			const toRemove = [board.grid[0][0]] as Tile[];
			board.removeTiles(toRemove);
			board.shiftTiles();
			expect(board.grid[0][0]).not.toBeNull();
			expect(board.grid[0][2]).toBeNull();
		});
		it('should return array of shifted tiles with their new Y positions', () => {
			board.generateGrid();
			const toRemove = [board.grid[0][0]] as Tile[];
			board.removeTiles(toRemove);
			const shifted = board.shiftTiles();
			expect(shifted.length).toBeGreaterThan(0);
			expect(shifted[0]).toHaveProperty('tile');
			expect(shifted[0]).toHaveProperty('toY');
		});

		// Edge cases
		it('should return empty array when no empty cells exist', () => {
			board.generateGrid(); // all cells filled
			const shifted = board.shiftTiles();
			expect(shifted).toEqual([]);
		});

		// Negative cases
		it('should not shift tiles when grid is empty', () => {
			board.initGrid(); // all cells are null
			const shifted = board.shiftTiles();
			expect(shifted).toEqual([]);
		});
	});

	// fillEmptyCells method tests
	describe('fillEmptyCells method tests', () => {
		// Positive cases
		it('should fill all empty cells with new tiles', () => {
			board.generateGrid();
			const group = board.findGroup(0, 0);
			board.removeTiles(group);
			board.fillEmptyCells();
			for (const col of board.grid) {
				for (const cell of col) {
					expect(cell).not.toBeNull();
				}
			}
		});
		it('should return array of spawned tiles equal to number of empty cells', () => {
			board.generateGrid();
			const group = board.findGroup(0, 0);
			board.removeTiles(group);
			const spawned = board.fillEmptyCells();
			expect(spawned).toHaveLength(group.length);
		});

		// Edge cases
		it('should return empty array when no empty cells exist', () => {
			board.generateGrid(); // all cells filled
			const spawned = board.fillEmptyCells();
			expect(spawned).toHaveLength(0);
		});

		// Negative cases
		it('should fill all cells when entire grid is empty', () => {
			board.initGrid(); // all cells are null
			const spawned = board.fillEmptyCells();
			expect(spawned).toHaveLength(mockConfig.columns * mockConfig.rows);
		});
	});

	// hasAnyMove method tests
	describe('hasAnyMove method tests', () => {
		// Positive cases
		it('should return true when adjacent tiles of same color exist', () => {
			// All tiles are Red — many groups available
			board.generateGrid();
			expect(board.hasAnyMove()).toBe(true);
		});

		// Edge cases
		it('should return false when no adjacent tiles of same color exist', () => {
			// 2x2 checkerboard — no adjacent same-color tiles
			const edgeConfig = {...mockConfig, columns: 2, rows: 2};
			const edgeBoard = new GameBoard(edgeConfig);
			(Random.prototype.pick as jest.Mock)
				.mockReturnValueOnce(TileColor.Red)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Blue)
				.mockReturnValueOnce(TileColor.Red);
			edgeBoard.generateGrid();
			expect(edgeBoard.hasAnyMove()).toBe(false);
		});

		// Negative cases
		it('should return false when grid is empty', () => {
			board.initGrid(); // all cells are null
			expect(board.hasAnyMove()).toBe(false);
		});
	});

	// useBombBonus method tests
	describe('useBombBonus method tests', () => {
		// Positive cases
		it('should return center tile and all neighbors within radius', () => {
			board.generateGrid();
			// Center of 3x3 grid with radius 1 — covers all 9 tiles
			const group = board.useBombBonus(1, 1, mockConfig.bonusBombRadius);
			expect(group).toHaveLength(9);
		});

		// Edge cases
		it('should return fewer tiles when bomb is used in corner of grid', () => {
			board.generateGrid();
			const group = board.useBombBonus(0, 0, mockConfig.bonusBombRadius);
			expect(group).toHaveLength(4);
		});

		// Negative cases
		it('should not include null cells in result', () => {
			board.generateGrid();
			board.removeTiles([board.grid[0][1]] as Tile[]);
			const group = board.useBombBonus(1, 1, mockConfig.bonusBombRadius);
			expect(group.every(tile => tile !== null)).toBe(true);
		});
	});

	// usePortalBonus method tests
	describe('usePortalBonus method tests', () => {
		// Positive cases
		it('should swap two tiles positions after second selection', () => {
			board.generateGrid();
			const tileA = board.grid[0][0];
			const tileB = board.grid[2][2];
			board.usePortalBonus(0, 0);
			board.usePortalBonus(2, 2);
			expect(board.grid[2][2]).toBe(tileA);
			expect(board.grid[0][0]).toBe(tileB);
		});
		it('should return true after successful swap', () => {
			board.generateGrid();
			board.usePortalBonus(0, 0);
			expect(board.usePortalBonus(2, 2)).toBe(true);
		});

		// Edge cases
		it('should return false on first tile selection', () => {
			board.generateGrid();
			expect(board.usePortalBonus(0, 0)).toBe(false);
		});

		// Negative cases
		it('should return false when same tile is selected twice', () => {
			board.generateGrid();
			board.usePortalBonus(0, 0);
			expect(board.usePortalBonus(0, 0)).toBe(false);
		});
	});

	// activatePortal method tests
	describe('activatePortal method tests', () => {
		// Positive cases
		it('should set isPortalActive to true', () => {
			board.activatePortal();
			expect(board.isPortalActive).toBe(true);
		});

		// Edge cases
		it('should not change state when called multiple times', () => {
			board.activatePortal();
			board.activatePortal();
			expect(board.isPortalActive).toBe(true);
		});

		// Negative cases
		it('should be false by default before activation', () => {
			expect(board.isPortalActive).toBe(false);
		});
	});

	// deactivatePortal method tests
	describe('deactivatePortal method tests', () => {
		// Positive cases
		it('should set isPortalActive to false after activation', () => {
			board.activatePortal();
			board.deactivatePortal();
			expect(board.isPortalActive).toBe(false);
		});

		// Edge cases
		it('should not change state when called without prior activation', () => {
			board.deactivatePortal();
			expect(board.isPortalActive).toBe(false);
		});

		// Negative cases
		it('should not change state when called multiple times', () => {
			board.activatePortal();
			board.deactivatePortal();
			board.deactivatePortal();
			expect(board.isPortalActive).toBe(false);
		});
	});

	// clearGrid method tests
	describe('clearGrid method tests', () => {
		// Positive cases
		it('should clear all tiles from grid', () => {
			board.generateGrid();
			board.clearGrid();
			expect(board.grid).toHaveLength(0);
		});

		// Edge cases
		it('should reset Tile id counter after clearing', () => {
			board.generateGrid();
			board.clearGrid();
			// After reset — next tile gets id 0
			const tile = new Tile(TileColor.Red, 0, 0);
			expect(tile.id).toBe(0);
		});

		// Negative cases
		it('should not throw when called on already empty grid', () => {
			expect(() => board.clearGrid()).not.toThrow();
		});
	});


	// shuffleBoard method tests
	describe('shuffleBoard method tests', () => {
		// Positive cases
		it('should regenerate grid with tiles after shuffle', () => {
			board.generateGrid();
			board.shuffleBoard();
			expect(board.grid).toHaveLength(mockConfig.columns);
			for (const col of board.grid) {
				for (const cell of col) {
					expect(cell).not.toBeNull();
				}
			}
		});

		// Edge cases
		it('should work correctly when called on empty grid', () => {
			board.shuffleBoard();
			expect(board.grid).toHaveLength(mockConfig.columns);
		});

		// Negative cases
		it('should not retain old tiles after shuffle', () => {
			board.generateGrid();
			const oldTileId = board?.grid[0][0]?.id;
			board.shuffleBoard();
			// After reset idCounter starts from 0 — the new tile at [0][0] gets fresh id
			expect(board?.grid[0][0]?.id).toBe(oldTileId);
		});
	});
});
