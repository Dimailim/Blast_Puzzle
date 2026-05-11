import ProgressTracker from "../core/ProgressTracker";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HudView extends cc.Component {

    private _clickedBonusButton: cc.Node = null;

    @property(cc.Label)
    private moves: cc.Label = null;
    @property(cc.Label)
    private score: cc.Label = null;
    @property(cc.Node)
    private winWindow: cc.Node = null;
    @property(cc.Node)
    private failureWindow: cc.Node = null;
    @property(cc.Node)
    private hudScreen: cc.Node = null;
    @property(cc.Label)
    private bonusBombCount: cc.Label = null;
    @property(cc.Label)
    private bonusTeleportCount: cc.Label = null;
    @property(cc.Node)
    private bonusSection: cc.Node = null;

    get clickedBonusButton (): cc.Node {
        return this._clickedBonusButton;
    }
    set clickedBonusButton (node: cc.Node) {
        this._clickedBonusButton = node;
    }

    /**
     * Fills the HUD labels with the progress tracker data.
     * @param {ProgressTracker} progress
     */
    public init (progress: ProgressTracker): void {
        this.moves.string = progress.maxMoves.toString();
        this.score.string = `${progress.score}/${progress.targetScore}`;
        this.bonusBombCount.string = progress.bonusBombCount.toString();
        this.bonusTeleportCount.string = progress.bonusTeleportCount.toString();
    }
    /**
     * Updates the moves label with the new moves count.
     * @param {number} moves - the new moves count.
     */
    public updateMoves (moves: number): void {
        this.moves.string = moves.toString();
    }
    /**
     * Updates the score label with the new score.
     * The target score has constant value.
     * @param {number} score - the new score.
     * @param {number} targetScore - the target score.
     */
    public updateScore (score: number, targetScore: number): void {
        this.score.string = `${score}/${targetScore}`;
    }

    /**
     * Updates the bomb bonus count label with the new count.
     * @param {number} bombBonusCount - the new bomb bonus count.
     */
    public updateBombBonusCount (bombBonusCount: number): void {
        this.bonusBombCount.string = bombBonusCount.toString();
    }
    /**
     * Updates the teleport bonus count label with the new count.
     * @param {number} teleportBonusCount - the new teleport bonus count.
     */
    public updateTeleportBonusCount (teleportBonusCount: number): void {
        this.bonusTeleportCount.string = teleportBonusCount.toString();
    }
    /**
     * Shows the win window screen.
     */
    public showWin (): void {
        this.winWindow.active = true;
    }
    /**
     * Shows the failure window screen.
     */
    public showLose (): void {
        this.failureWindow.active = true;
    }
    /**
     * Hides all game over screens.
     * Using while the game is restarting.
     */
    public hideGameOverScreen(): void {
        this.winWindow.active = false;
        this.failureWindow.active = false;
    }
    /**
     * Hides the HUD elements.
     */
    public hideHud (): void {
        this.hudScreen.active = false;
        this.bonusSection.active = false;
    }
    /**
     * Shows the HUD elements.
     */
    public showHud (): void {
        this.hudScreen.active = true;
        this.bonusSection.active = true;
    }
    /**
     * Plays a shake animation on for bonus buttons.
     * @param {cc.Node} buttonNode
     */
    public playShakeButtonAnimation (buttonNode: cc.Node): void {
        buttonNode.getComponent(cc.Animation).play('shakeButton');
    }
}
