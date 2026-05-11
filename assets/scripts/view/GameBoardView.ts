import TileView from "./TileView";
import GameBoard from "../core/GameBoard";
import Tile from "../core/Tile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBoardView extends cc.Component {

    private TILE_SIZE: number = 90;
    private FRAME_SIZE: number = 90;

    private tileViews: Map<number, cc.Node> = new Map();
    private offsetX: number;
    private offsetY: number;
    private topEdge: number;
    private selectedTiles: cc.Node[] = [];

    @property(cc.Node)
    private gameboardScreen: cc.Node = null;
    @property(cc.Prefab)
    private tilePrefab: cc.Prefab = null;

    // Work with components.
    /**
     *  Initializes the game board view with given dimensions.
     * @param {number} columns - width of the game board
     * @param {number} rows - height of the game board
     */
    public init(columns:number, rows:number): void {
        const gameboardWidth = (columns * this.TILE_SIZE) + this.FRAME_SIZE;
        const gameboardHeight = (rows * this.TILE_SIZE) + this.FRAME_SIZE;
        this.gameboardScreen.setContentSize(gameboardWidth, gameboardHeight);
        // Calculates offset coordinates for a left-down corner of the game board
        this.offsetX = -(columns - 1) * this.TILE_SIZE / 2;
        this.offsetY = -(rows - 1) * this.TILE_SIZE / 2;
        // Calculates top edge Y-coordinate of the game board
        this.topEdge = rows * this.TILE_SIZE / 2;
    }
    /**
     * Generates a single tile node.
     * @param {Tile} tile
     * @param {number} x
     * @param {number} y
     * @returns {cc.Node}
     */
    public generateTile (tile: Tile, x: number, y: number): cc.Node {
        const tileNode = cc.instantiate(this.tilePrefab);
        const tileView = tileNode.getComponent(TileView);

        tileView.bind(tile, x, y);
        tileNode.setParent(this.gameboardScreen);
        tileNode.setSiblingIndex(0);
        // Firstly set position of the tile to the top corner of the game board. It will be a start point for fall animation.
        tileNode.setPosition(cc.v2(this.offsetX + x * this.TILE_SIZE, this.topEdge + y * this.TILE_SIZE));
        this.tileViews.set(tileView.tileId, tileNode);

        return tileNode;
    }
    /**
     * Updates tile position and color.
     * It's used to update the tile position after a tile shift.
     * @param {cc.Node} tileNode
     * @param {Tile} tile
     */
    public updateTile(tileNode: cc.Node, tile: Tile): void {
        const tileView = tileNode.getComponent(TileView);
        tileView.bind(tile, tile.x, tile.y);
    }
    /**
     * Generates tiles from the gameBoard logic class and fills to the gameboardScreen node.
     * @param {GameBoard} gameBoard
     */
    public generateTiles (gameBoard: GameBoard): void {
        const grid = gameBoard.grid;
        let delayIndex = 0;

        for (let x = 0, lenX = grid.length; x < lenX; x++) {
            for (let y = 0, lenY = grid[x].length; y < lenY; y++) {
                const tile = grid[x][y];
                if (tile) {
                   const tileNode = this.generateTile(tile, x, y);

                   tileNode.opacity = 0; // Hide tile before animation
                   const delay = delayIndex * 0.005;
                   this.playFallTileAnimation(tileNode, delay, this.offsetY + y * this.TILE_SIZE, 0.3);
                   delayIndex++;
                }
            }
        }
    }
    /**
     * Destroys tiles with playing burn animation and removing them from the scene.
     */
    public destroyTiles(): void {
        this.tileViews.forEach((tileNode: cc.Node) => {
            this.playBurnTileAnimation(tileNode);
            this.scheduleOnce(() => tileNode.destroy(), 1);
        })
        this.tileViews.clear();
    }
    /**
     * Clears selected tiles array.
     * @private
     */
    private clearSelectedTiles(): void {
        this.selectedTiles = [];
    }

    // Work with animations
    /**
     * Plays animation for a single tile without neighbors with the same color.
     * @param {number} tileId
     */
    public playSingleTileAnimation(tileId: number) {
        const tileNode = this.tileViews.get(tileId);
        if (!tileNode) {
            return;
        }
        tileNode.getComponent(cc.Animation).play('shakeBlock');
    }
    /**
     * Plays fall animation for a tile.
     * @param {cc.Node} tileNode - target tile node to animate.
     * @param {number} delay - delay between animation frames.
     * @param {number} y - falling to this y coordinate.
     * @param {number} duration - animation duration.
     */
    public playFallTileAnimation(tileNode: cc.Node, delay: number, y: number, duration: number): void {
        cc.tween(tileNode)
            .delay(delay)
            .to(duration, {y: y, opacity: 255}, { easing: 'bounceOut'})
            .start();
    }
    /**
     * Plays burn animation for a tile.
     * @param {cc.Node} tileNode - target tile node to animate.
     */
    public playBurnTileAnimation(tileNode: cc.Node): void {
        tileNode.getComponent(cc.Animation).play('destroyBlock');
    }

    // Work with tile rendering
    /**
     * Renders tile burn.
     * @param {Tile[]} tileGroup
     */
    public playBurnTile(tileGroup: Tile[]): void {
        for (const tile of tileGroup) {
            const tileNode: cc.Node = this.tileViews.get(tile.id);
            this.playBurnTileAnimation(tileNode);
            this.tileViews.delete(tile.id);
            this.scheduleOnce(() => tileNode.destroy(), 1);
        }
    }
    /**
     * Renders tile shift.
     * @param {{tile: Tile, toY: number}[]} shiftedTiles
     */
    public playShiftingTile(shiftedTiles: {tile: Tile, toY: number}[]): void {
        let delayIndex = 0;
        for (const shiftedTile of shiftedTiles) {
            const tile = shiftedTile.tile;
            const tileNode: cc.Node = this.tileViews.get(tile.id);
            this.updateTile(tileNode, tile);
            const delay = delayIndex * 0.01;
            this.playFallTileAnimation(tileNode, delay, this.offsetY + shiftedTile.toY * this.TILE_SIZE, 0.3);
            delayIndex++;
        }
    }
    /**
     * Renders spawned tiles.
     * @param {Tile[]} spawnedTiles
     */
    public playSpawnTiles (spawnedTiles: Tile[]): void {
        for (const spawnedTile of spawnedTiles) {
            const tileNode: cc.Node = this.generateTile(spawnedTile, spawnedTile.x, spawnedTile.y);
            this.playFallTileAnimation(tileNode, 0, this.offsetY + spawnedTile.y * this.TILE_SIZE, 0.4);
        }
    }
    /**
     * Selects tile.
     * Changes tile scale to 1.1.
     * Fills the selectedTiles array with the selected tile node.
     * @param {number} tileId
     */
    public playSelectedTile(tileId: number): void {
        const tileNode: cc.Node = this.tileViews.get(tileId);
        tileNode.setScale(cc.v2(1.1, 1.1));
        this.selectedTiles.push(tileNode);
    }
    /**
     * Unselects tile.
     * Returns tile scale to 1.
     * Clears the selectedTiles array.
     */
    public playUnselectedTile(): void {
        const [firstTile, secondTile] = this.selectedTiles;
        firstTile.setScale(cc.v2(1, 1));
        secondTile.setScale(cc.v2(1, 1));
        this.clearSelectedTiles();
    }

    /**
     * Renders swaps two selected tiles.
     */
    public playSwapTiles(): void {
        const [firstTile, secondTile] = this.selectedTiles;
        const tempTileX = firstTile.x;
        const tempTileY = firstTile.y;

        this.playUnselectedTile();
        // Plays swap animation for selected tiles.
        cc.tween(firstTile)
            .to(0.1, { x: secondTile.x, y: secondTile.y }, { easing: 'bounceOut' })
            .start();
        cc.tween(secondTile)
            .to(0.1, { x: tempTileX, y: tempTileY }, { easing: 'bounceOut' })
            .start();

        // Changes tile coordinates for TileView object.
        const firstTileView: TileView = firstTile.getComponent(TileView);
        const secondTileView: TileView = secondTile.getComponent(TileView);
        const tempTileViewX = firstTileView.x;
        const tempTileViewY = firstTileView.y;
        firstTileView.updateCoordinates(secondTileView.x, secondTileView.y);
        secondTileView.updateCoordinates(tempTileViewX, tempTileViewY);
    }

    /**
     * Destroys all tiles and generates new tiles from the gameBoard logic class.
     * @param {GameBoard} gameBoard
     */
    public playShuffleBoard(gameBoard: GameBoard): void {
        this.destroyTiles();
        this.generateTiles(gameBoard);
    }
    /**
     * Destroys all tiles and hides the game board screen.
     */
    public playGameOver(): void {
        this.destroyTiles();
        this.gameboardScreen.active = false;
    }
    /**
     * Shows the game board screen.
     */
    public showGameboardScreen(): void {
        this.gameboardScreen.active = true;
    }

    // Event logic
    /**
     * Handles a tile selection event for sending data to controller (GameManager class)
     * It's part of a bubble event logic send data from child component to parent.
     * @param {number} x
     * @param {number} y
     * @private
     */
    private onSelectedTile(x:number, y:number): void {
        cc.systemEvent.emit('updateBoard', x, y);
    }

    onLoad (): void {
        cc.systemEvent.on('selectedTile', this.onSelectedTile, this);
    }
    onDisable(): void {
        cc.systemEvent.off('selectedTile', this.onSelectedTile, this) ;
    }
}
