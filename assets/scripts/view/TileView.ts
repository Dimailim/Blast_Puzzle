import Tile from "../core/Tile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TileView extends cc.Component {

    private _tileId: number;
    private _x: number;
    private _y: number;

    @property(cc.SpriteFrame)
    private frames: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    private sprite: cc.Sprite = null;


    get tileId (): number {
        return this._tileId;
    }
    get x(): number {
        return this._x;
    }
    get y(): number {
        return this._y;
    }

    /**
     * Binds the tile from the logic part to sprite.
     * It's dynamically changes color of tile depending on tile color from logic part.
     * @param {Tile} Tile
     * @param {number} x
     * @param {number} y
     */
    public bind (Tile: Tile, x:number, y:number): void {
        this._tileId = Tile.id;
        this.sprite.spriteFrame = this.frames[Tile.color];
        this._x = x;
        this._y = y;
    }
    /**
     * Updates the coordinates of the swapped tile.
     * @param {number} x
     * @param {number} y
     */
    public updateCoordinates (x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    /**
     * Handles a tile touch event to send data to the GameBoardView object.
     * It's a part of bubble event logic send data from child component to parent.
     */
    public onTileClicked(): void {
        cc.systemEvent.emit('selectedTile', this.x, this.y);
    }

    onEnable (): void {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTileClicked, this);
    }
    onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTileClicked, this);
    }
}
