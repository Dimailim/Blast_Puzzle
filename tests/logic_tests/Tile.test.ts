import Tile from "../../assets/scripts/core/Tile";
import {TileColor} from "../../assets/scripts/core/levelConfig";

describe('Tile tests', () => {
    let tile: Tile;

    beforeEach(() => {
        jest.clearAllMocks();
        Tile.resetIdCounter();

        // Create a new Tile instance
        tile = new Tile(TileColor.Red, 1, 2);
    });

    describe('Constructor tests', () => {
        // Positive cases
        it('should set correct initial values and first ID', () => {
            expect(tile.color).toBe(TileColor.Red);
            expect(tile.x).toBe(1);
            expect(tile.y).toBe(2);
            expect(tile.id).toBe(0);
        });

        // Edge cases
        it('should increment ID for each new instance', () => {
            const tile2 = new Tile(TileColor.Blue, 0, 0);
            const tile3 = new Tile(TileColor.Green, 5, 5);
            expect(tile2.id).toBe(1);
            expect(tile3.id).toBe(2);
        });

        // Negative cases
        it('should accept negative coordinates as class has no validation', () => {
            const negativeTile = new Tile(TileColor.Yellow, -1, -5);
            expect(negativeTile.x).toBe(-1);
            expect(negativeTile.y).toBe(-5);
        });
    });

    describe('Getters tests', () => {
        // Positive cases
        it('should return correct color via getter', () => {
            expect(tile.color).toBe(TileColor.Red);
        });
        it('should return correct id via getter', () => {
            expect(tile.id).toBe(0);
        });
        it('should return correct x coordinate via getter', () => {
            expect(tile.x).toBe(1);
        });
        it('should return correct y coordinate via getter', () => {
            expect(tile.y).toBe(2);
        });
    });

    describe('updateCoordinates method tests', () => {
        // Positive cases
        it('should update x and y coordinates correctly', () => {
            tile.updateCoordinates(10, 20);
            expect(tile.x).toBe(10);
            expect(tile.y).toBe(20);
        });

        // Edge cases
        it('should stay the same when updated with current coordinates', () => {
            tile.updateCoordinates(1, 2);
            expect(tile.x).toBe(1);
            expect(tile.y).toBe(2);
        });

        // Negative cases
        it('should update to negative coordinates correctly', () => {
            tile.updateCoordinates(-10, -20);
            expect(tile.x).toBe(-10);
            expect(tile.y).toBe(-20);
        });
    });

    describe('resetIdCounter method tests', () => {
        // Positive cases
        it('should reset idCounter so next tile gets ID 0', () => {
            // After beforeEach we already have one tile with ID 0
            // Create another one to increment counter
            new Tile(TileColor.Blue, 0, 0); // ID would be 1
            
            Tile.resetIdCounter();
            const newTile = new Tile(TileColor.Green, 0, 0);
            expect(newTile.id).toBe(0);
        });
    });
});
