import {Level, GROUND_SIZE} from "../levels/Level";
import {PIXELS_WIDTH} from "../../app";
import Menu from "../Menu";

export const TILE_SIZE = 12;
export const TIME = Phaser.Timer.SECOND / 4;
export const BLOCKTIME = TIME / 1.5;

export default class Play extends Phaser.State {
  private level: Level;
  private menu: Menu;
  private levelNumber: number;

  constructor(game: Phaser.Game, levelNumber: number = 9) {
    super();
    this.levelNumber = levelNumber;
    this.level = Level.getFromNumber(this.levelNumber);
    this.menu = new Menu(this.level);
  }

  public create(game: Phaser.Game) {
    game.world.setBounds(0, 0, GROUND_SIZE * TILE_SIZE, GROUND_SIZE * TILE_SIZE);
    game.camera.width = PIXELS_WIDTH;
    const groundGroup = game.add.group(null, 'Ground');
    const objectGroup = game.add.group(null, 'Objects');
    const effectsGroup = game.add.group(null, 'Effects');
    game.add.existing(groundGroup);
    game.add.existing(objectGroup);
    game.add.existing(effectsGroup);
    this.level.create(game, groundGroup, objectGroup, effectsGroup);
    this.menu.create(game);
  }

  public update(game: Phaser.Game) {
    this.menu.update(game);
    this.level.update(game);
    if (this.hasFinished()) {
      this.state.add('Level' + (this.levelNumber + 1), new Play(game, this.levelNumber + 1));
      this.state.start('Level' + (this.levelNumber + 1));
    } else if (this.isDead()) {
      this.level.getPlayer().destroy();
      game.time.events.add(TIME * 3, () => {
        this.state.states[this.state.current] = new Play(game, this.levelNumber);
        this.state.restart(true);
      })
    }
  }

  public render(game: Phaser.Game) {
    this.level.getPlayer().render(game);
  }

  private hasFinished(): boolean {
    return (
      this.level.getPlayer().getPosition().equals(this.level.getEndPosition())
    );
  }

  private isDead() {
    const deadPositions = this.level.getDeadPositions(this.level.getPlayer());
    for (let i = 0; i < deadPositions.length; i++) {
      if (this.level.getPlayer().getPosition().equals(deadPositions[i])) {
        return true;
      }
    }

    return false;
  }
}
