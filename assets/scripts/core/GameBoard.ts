import {LevelConfig, TileColor} from "./levelConfig";
import Random from "../utils/Random";
import Tile from "./Tile";

export  default class GameBoard {
    private readonly MAX_COLUMNS: number = 10;
    private readonly MAX_ROWS: number = 10;
    private readonly MIN_COLUMNS: number = 1;
    private readonly MIN_ROWS: number = 1;

    private readonly _x: number;
    private readonly _y: number;
    private readonly _colors: TileColor[];
    private readonly rand: Random = new Random();
    private readonly _warnMsg: string = '';

    private _grid: (Tile | null)[][] = [];
    private selectedTiles: Tile[] = [];
    private _isBonusActive: boolean = false;
    private _isPortalActive: boolean = false;


    constructor(level: LevelConfig) {
        const isCorrectSize = this.isCorrectBoardSize(level.columns, level.rows);
        if (!isCorrectSize) {
            this._warnMsg = `Invalid board size: 
            columns= ${level.columns}, rows= ${level.rows}. 
            Using default size: ${this.MAX_COLUMNS}x${this.MAX_ROWS}.
            Please, check your level configuration file.`;
        }
        this._x = isCorrectSize ? level.columns : this.MAX_COLUMNS;
        this._y = isCorrectSize ? level.rows : this.MAX_ROWS;
        this._colors = level.colors;
    }

    get x(): number {
        return this._x;
    }
    get y(): number {
        return this._y;
    }
    get colors(): TileColor[] {
        return this._colors;
    }
    get grid(): readonly (Tile | null)[][] {
        return this._grid;
    }
    get isBonusActive(): boolean {
        return this._isBonusActive;
    }
    get isPortalActive(): boolean {
        return this._isPortalActive;
    }
    get warnMsg(): string {
        return this._warnMsg;
    }

    set isBonusActive(value: boolean) {
        this._isBonusActive = value;
    }

    /**
     * Checks if the board size is within the allowed range.
     * @param {number}columns
     * @param {number} rows
     * @returns {boolean}
     * @private
     */
    private isCorrectBoardSize(columns: number, rows: number): boolean {
        return (columns <= this.MAX_COLUMNS && rows <= this.MAX_ROWS) && (columns >= this.MIN_COLUMNS && rows >= this.MIN_ROWS);
    }

    /**
     * First initialization of the empty grid using the size of the game field.
     */
    public initGrid(): void {
        for (let x = 0, xLen = this.x; x < xLen; x++) {
            this._grid[x] = [];
            for (let y = 0, yLen = this.y; y < yLen; y++) {
                this._grid[x][y] = null;
            }
        }
    }

    /**
     * Randomly generate the grid of tiles.
     */
    public generateGrid(): void {
        this.initGrid();
        const grid = this.grid;
        const colors = this.colors;

        for (let x = 0, colLen = grid.length; x < colLen; x++) {
            for (let y = 0, yLen = grid[x].length; y < yLen; y++) {
                grid[x][y] = new Tile(this.rand.pick(colors), x, y);
            }
        }
    }

    /**
     * Returns tile ID from given coordinates.
     * @param {number} x - X-coordinate of the tile.
     * @param {number} y - Y-coordinate of the tile.
     * @returns {number | undefined}
     */
    public getTileId (x: number, y: number): number | undefined {
        return this.grid[x][y]?.id;
    }

    /**
     * Finds a tiles group with same color which needs to be removed.
     * Uses BFS algorithm.
     * @param {number} x - X-coordinate of a chosen tile block by user.
     * @param {number} y - Y-coordinate of a chosen tile block by user.
     * @returns {Tile[]} An array of tiles which need to be removed from the game board.
     */
    public findGroup (x:number, y:number): Tile[] {
        const grid = this.grid;
        const startTile = grid[x][y];
        if (!startTile) {
            return [];
        }
        const tileGroup: Tile[] = [];
        const tileStack: Tile[] = [];
        const visitedTile: Set<number> = new Set();
        const directions: number[][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        tileStack.push(startTile);
        while (tileStack.length) {
            const currentTile = tileStack.pop();
            if (!currentTile) {
                continue;
            }
            const currentX = currentTile.x;
            const currentY = currentTile.y;
            if(visitedTile.has(currentTile.id)) {
                continue;
            }
            visitedTile.add(currentTile.id);
            if (currentTile && currentTile.color === startTile.color) {
                tileGroup.push(currentTile);
            }
            for (const [dx, dy] of directions) {
                const nextX = currentX + dx;
                const nextY = currentY + dy;
                if (nextX >= grid.length || nextX < 0) { // X out of grid
                    continue;
                }
                const nextTile = grid[nextX][nextY];
                if (nextTile && nextTile.color === startTile.color) {
                    tileStack.push(nextTile);
                }
            }
        }

        return tileGroup;
    }

    /**
     * Removes the tiles group with the same color from the game board.
     * @param {Tile[]} tileGroup - Group of tiles to be removed.
     * @returns {Tile[]} Array of removed tiles.
     */
    public removeTiles (tileGroup: Tile[]): Tile[] {
        const grid = this.grid;
        const removedTiles: Tile[] = [];

        for (const tile of tileGroup) {
            removedTiles.push(tile);
            grid[tile.x][tile.y] = null;
        }

        return removedTiles;
    }

    /**
     * Shifts tiles downwards to fill empty spaces on the game board.
     * @returns {{tile: Tile, toY: number}}[]
     */
    public shiftTiles (): {tile: Tile, toY: number}[] {
        const grid = this.grid;
        const shiftedTiles: {tile: Tile, toY: number}[] = [];

        for (let x = 0, lenX = this.x; x < lenX; x++) {
            let toY = 0;
            for (let y = 0, lenY = this.y; y < lenY; y++) {
                const tile = grid[x][y];
                if (!tile) {
                    continue;
                }
                if (toY !== y) {
                    grid[x][toY] = tile; // Shift the current tile to an empty position
                    grid[x][y] = null; // Clear the current cell
                    tile.updateCoordinates(x, toY);
                    shiftedTiles.push({ tile, toY });
                }
                toY++;
            }
       }

        return shiftedTiles;
    }

    /**
     * Fills empty cells on the game board with random tiles.
     * @returns {Tile[]} Array of spawned tiles.
     */
    public fillEmptyCells (): Tile[] {
        const spawnedTiles: Tile[] = [];
        const grid = this.grid;

        for (let x = grid.length - 1; x >= 0; x--) {
            for (let y = grid[x].length - 1; y >= 0; y--) {
                const tile = grid[x][y];
                if (!tile) {
                    const newTile = new Tile(this.rand.pick(this.colors), x, y);
                    grid[x][y] = newTile;
                    spawnedTiles.push(newTile);
                }
            }
        }

        return spawnedTiles;
    }

    /**
     * Checks if there are any moves available on the game board.
     * @returns {boolean}
     */
    public hasAnyMove(): boolean {
        const visitedTile: Set<number> = new Set();
        for (let x = 0, lenX = this.grid.length; x < lenX; x++) {
            for (let y = 0, lenY = this.grid[x].length; y < lenY; y++) {
                const tile = this.grid[x][y];
                if (tile && visitedTile.has(tile.id)) {
                    continue;
                }
                const tilesGroup = this.findGroup(x, y);
                for (const tile of tilesGroup) {
                    visitedTile.add(tile.id);
                }
                if (tilesGroup.length > 1) {
                    return true;
                }

            }
        }

        return false;
    }

    /**
     * Destroys tiles in a circular pattern around the given coordinates.
     * @param x - The x-coordinate of the center tile.
     * @param y - The y-coordinate of the center tile.
     * @param destroyRadius - The radius of the circular pattern.
     * @returns An array of tiles which need to be removed from the game board.
     */
    public useBombBonus(x: number, y: number, destroyRadius: number): Tile[] {
        const grid = this.grid;
        const tileGroup: Tile[] = [];
        const targetTile = grid[x][y];

        if (!targetTile) {
            return tileGroup;
        }
        tileGroup.push(targetTile);
        for (let directionStep = 1; directionStep <= destroyRadius; directionStep++) {
            const directions: number[][] = [
                [-directionStep, 0], [directionStep, 0],  // Left and right
                [0, -directionStep], [0, directionStep],  // Down and up
                [directionStep, directionStep], [-directionStep, -directionStep], // Diagonal
                [-directionStep, directionStep], [directionStep, -directionStep] // Diagonal symmetric
            ];
            for (const direction of directions) {
                const [dx, dy] = direction;
                const nextX = x + dx;
                const nextY = y + dy;
                if (nextX >= 0 && nextX < grid.length && nextY >= 0 && nextY < grid[x].length) {
                    const nextTile = grid[nextX][nextY];
                    if (nextTile) {
                        tileGroup.push(nextTile);
                    }
                }
            }
        }

        return tileGroup;
    }

    /**
     * Swaps two tiles in the game board.
     * @param {number} x - the x-coordinate of the selected tile.
     * @param {number} y - the y-coordinate of the selected tile.
     * @returns {boolean} returns true if the swap was successful.
     */
    public usePortalBonus(x: number, y: number): boolean {
        const grid = this.grid;
        const tile = grid[x][y];

        if (!tile) {
            return false;
        }
        this.selectedTiles.push(tile);
        if (this.selectedTiles.length === 2) {
            const [firstTile, secondTile] = this.selectedTiles;
            if(firstTile.id === secondTile.id) {
                this.selectedTiles = [];
                return false;
            }
            grid[firstTile.x][firstTile.y] = secondTile;
            grid[secondTile.x][secondTile.y] = firstTile;
            // Update coordinates of the selected tiles
            const tempTileX = firstTile.x;
            const tempTileY = firstTile.y;
            firstTile.updateCoordinates(secondTile.x, secondTile.y);
            secondTile.updateCoordinates(tempTileX, tempTileY);
            this.selectedTiles = [];
            return true;
        }

        return false;
    }

    /**
     * Checks if the selected tile is the same as the tile at the given coordinates.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    public isSelectedTilesSame(x: number, y:number): boolean {
        if (this.selectedTiles.length) {
            const [tile] = this.selectedTiles;
            const selectedTile = this.grid[x][y];
            return !!(selectedTile && tile.id === selectedTile.id);
        }

        return false;
    }

    /**
     * Clears the selected tiles array.
     */
    public clearSelectedTiles(): void {
        this.selectedTiles = [];
    }

    /**
     * Clears the game board grid and resets the tile ID counter.
     */
    public clearGrid(): void {
        this._grid = [];
        Tile.resetIdCounter();
    }

    /**
     * Shuffles the game board grid.
     */
    public shuffleBoard(): void {
        this.clearGrid();
        this.generateGrid();
    }

    /**
     * Activate Portal Bonus
     */
    public activatePortal(): void {
        if (!this._isPortalActive) {
            this._isPortalActive = true;
        }
    }

    /**
     * Deactivate Portal Bonus
     */
    public deactivatePortal(): void {
        if (this._isPortalActive) {
            this._isPortalActive = false;
        }
    }
}
