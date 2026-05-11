// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html
import GameBoard from "./core/GameBoard";
import ProgressTracker from "./core/ProgressTracker";
import Tile from "./core/Tile";
import {levels} from "./core/levelConfig";
import GameBoardView from "./view/GameBoardView";
import HudView from "./view/HudView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    private gameBoardModel: GameBoard;
    private progressTrackerModel: ProgressTracker;
    private gameBoardView: GameBoardView;
    private hudView: HudView;

    @property(cc.Node)
    private gameBoard: cc.Node = null;
    @property(cc.Node)
    private HUD: cc.Node = null;

    /**
     * Initializes components to start the level.
     * @private
     */
    private startLevel (): void {
        this.gameBoardView = this.gameBoard.getComponent(GameBoardView);
        this.hudView = this.HUD.getComponent(HudView);

        this.gameBoardView.init(this.gameBoardModel.x, this.gameBoardModel.y);
        this.hudView.init(this.progressTrackerModel);

        this.gameBoardModel.generateGrid();
        this.gameBoardView.generateTiles(this.gameBoardModel);
    }
    /**
     * Resets the grid and hides main screen UI parts.
     * @private
     */
    private endGame(): void {
        this.gameBoardModel.clearGrid();

        this.gameBoardView.playGameOver();
        this.hudView.hideHud();
    }
    /**
     * Checks if the game is over.
     * If the game is over, it resets the grid and hides main screen UI parts.
     * @private
     */
    private checkEndGame (): void {
        if (this.progressTrackerModel.isWin) {
            this.progressTrackerModel.isGameOver = true;

            this.hudView.showWin();
        } else if (this.progressTrackerModel.isOutOfMoves) {
            this.progressTrackerModel.isGameOver = true;

            this.hudView.showLose();
        }

        if (this.progressTrackerModel.isGameOver) {
            this.endGame();
        }
    }
    /**
     * Runs shuffle.
     * It shuffles the board 3 times.
     * If max shuffles are reached, it shows the loose screen.
     * @private
     */
    private runShuffle(): void {
        if (this.progressTrackerModel.isOutOfShuffle) {
            this.progressTrackerModel.isGameOver = true;
            this.progressTrackerModel.resetShuffleCount();

            this.hudView.showLose();

            this.endGame();
            return;
        }

        this.progressTrackerModel.spendShuffleAttempt();
        this.gameBoardModel.shuffleBoard();

        this.gameBoardView.playShuffleBoard(this.gameBoardModel);
    }
    private runTeleportBonus(x: number, y: number): void {
        this.gameBoardModel.activatePortal();

        const tileId: number = this.gameBoardModel.getTileId(x, y);
        this.gameBoardView.playSelectedTile(tileId);
        if (this.gameBoardModel.isSelectedTilesSame(x, y)) {
            this.gameBoardModel.clearSelectedTiles();
            this.gameBoardModel.deactivatePortal();
            this.gameBoardModel.isBonusActive = false;

            this.gameBoardView.playUnselectedTile();
            return;
        }

        const isTeleportFinish: boolean = this.gameBoardModel.usePortalBonus(x, y);
        if (isTeleportFinish) {
            this.gameBoardModel.isBonusActive = false;
            this.gameBoardModel.deactivatePortal();
            this.progressTrackerModel.spendTeleportBonus();

            this.gameBoardView.playSwapTiles();
            this.hudView.updateTeleportBonusCount(this.progressTrackerModel.bonusTeleportCount);
        }
    }

    /**
     * Handles update game board state based on selected tile coordinates.
     * @param {number} x - X-coordinate of the selected tile.
     * @param {number} y - Y-coordinate of the selected tile.
     * @private
     */
    private onUpdateBoard (x: number, y: number): void {
        let tileGroup: Tile[];

        // Activate bonuses
        if (this.gameBoardModel.isBonusActive || this.gameBoardModel.isPortalActive) {
            if (this.hudView.clickedBonusButton.name === 'bonus_bomb_btn') {
                this.gameBoardModel.isBonusActive = false;
                tileGroup = this.gameBoardModel.useBombBonus(x, y, this.progressTrackerModel.bonusBombRadius);
                this.progressTrackerModel.spendBombBonus();

                this.hudView.updateBombBonusCount(this.progressTrackerModel.bonusBombCount);
            } else {
               this.runTeleportBonus(x, y);
               return;
            }
        } else { // Default mode: Finding a tile group for destroying
            const MAX_GROUP_ELEM: number = 2;
            tileGroup = this.gameBoardModel.findGroup(x, y);
            if (tileGroup.length < MAX_GROUP_ELEM) {
                const tileId = this.gameBoardModel.getTileId(x, y)

                this.gameBoardView.playSingleTileAnimation(tileId);
                return;
            }
        }

        // Update model
        const removedTiles = this.gameBoardModel.removeTiles(tileGroup);
        const shiftedTiles = this.gameBoardModel.shiftTiles();
        const spawnedTiles = this.gameBoardModel.fillEmptyCells();

        this.progressTrackerModel.updateScore(removedTiles.length);
        this.progressTrackerModel.spendMove();

        // Update view
        this.gameBoardView.playBurnTile(removedTiles);
        this.gameBoardView.playShiftingTile(shiftedTiles);
        this.gameBoardView.playSpawnTiles(spawnedTiles);

        this.hudView.updateScore(this.progressTrackerModel.score, this.progressTrackerModel.targetScore);
        this.hudView.updateMoves(this.progressTrackerModel.remainMoves);

        // End game stage
        this.checkEndGame();
    }
    /**
     * Handles a restart button click event.
     * @private
     */
    private onRestartClick (): void {
        this.progressTrackerModel.restartProgress();

        this.hudView.hideGameOverScreen();
        this.hudView.showHud();
        this.gameBoardView.showGameboardScreen();

        this.startLevel();
    }
    /**
     * Handles a bonus button click event.
     * @param {cc.Event} event
     * @private
     */
    private onBonusClick (event: cc.Event): void {
        this.hudView.clickedBonusButton = event.target;

        if (this.hudView.clickedBonusButton.name === 'bonus_bomb_btn') {
            if (this.progressTrackerModel.isOutOfBombBonus) {
                this.hudView.playShakeButtonAnimation(this.hudView.clickedBonusButton);
            } else {
                this.gameBoardModel.isBonusActive = true;
            }
        } else {
            if (this.progressTrackerModel.isOutOfTeleportBonus) {
                this.hudView.playShakeButtonAnimation(this.hudView.clickedBonusButton);
            } else {
                this.gameBoardModel.isBonusActive = true;
            }
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad (): void {
        this.gameBoardModel = new GameBoard(levels[0]);
        this.progressTrackerModel = new ProgressTracker(levels[0]);

        if (this.gameBoardModel.warnMsg.length) {
            cc.warn(this.gameBoardModel.warnMsg);
        }
        cc.systemEvent.on('updateBoard', this.onUpdateBoard, this);
    }
    start (): void {
        this.startLevel();
        this.schedule(() => {
            if (!this.gameBoardModel.hasAnyMove() && !this.progressTrackerModel.isGameOver) {
                this.runShuffle();
            }
        }, levels[0].checkHasMovesDuration);
    }
    onDisable (): void {
        cc.systemEvent.off('updateBoard', this.onUpdateBoard, this);
        this.unscheduleAllCallbacks();
    }
}
