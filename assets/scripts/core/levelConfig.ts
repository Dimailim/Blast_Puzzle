export enum TileColor {Red = 0, Green = 1, Blue = 2, Yellow = 3, Purple = 4}
export interface LevelConfig {
    colors: TileColor[];
    columns: number;
    rows: number;
    targetScore: number;
    maxMoves: number;
    bonusBombCount: number;
    bonusTeleportCount: number;
    bonusBombRadius: number;
    maxShuffleCount: number;
    checkHasMovesDuration: number;
}
export const levels: LevelConfig[] = [
    {
        colors: [TileColor.Red, TileColor.Blue, TileColor.Green, TileColor.Yellow, TileColor.Purple],
        columns: 10,
        rows: 10,
        targetScore: 300,
        maxMoves: 15,
        bonusBombCount: 3,
        bonusTeleportCount: 5,
        bonusBombRadius: 1,
        maxShuffleCount: 3,
        checkHasMovesDuration: 3
    }
];
