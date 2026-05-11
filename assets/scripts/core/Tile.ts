import {TileColor} from "./levelConfig";

export default class Tile {
    private static idCounter = 0;
    private readonly _color: TileColor;
    private readonly _id: number;
    private _x: number;
    private _y: number;

    constructor(color: TileColor, x: number, y: number) {
        this._color = color;
        this._id = Tile.idCounter++;
        this._x = x;
        this._y = y;
    }

    get color(): TileColor {
        return this._color;
    }
    get id(): number {
        return this._id;
    }
    get x(): number {
        return this._x
    }
    get y(): number {
        return this._y;
    }

    /**
     * Updates the coordinates of the shifted tile.
     * @param {number} x
     * @param {number} y
     */
    public updateCoordinates (x: number,y: number): void {
        this._x = x;
        this._y = y;
    }
    /**
     * Resets the id counter to its initial value.
     */
    public static resetIdCounter(): void {
        Tile.idCounter = 0;
    }
}

