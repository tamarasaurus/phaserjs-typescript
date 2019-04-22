import WallCell from "./WallCell";
import {Level} from "../levels/Level";
import Player from "../Player";
import Point from "../Point";
import Game = Phaser.Game;

export class BlueWall extends WallCell {
  private isWall: boolean;

  constructor(game: Phaser.Game, x: number, y: number, groundGroup: Phaser.Group, isWall: boolean) {
    super(game, x, y, groundGroup);

    this.sprite.frame = 20 + 32;
    this.isWall = isWall;
  }

  animateEnd(game: Game, level: Level, player: Player, endPosition: Point) {
    if (this.isWall) {
      this.sprite.frame = 14 + 32;
    } else {
      this.sprite.frame = 0;
    }
  }

  canPlayerGoTo(player: Player) {
    return !this.isWall;
  }
}