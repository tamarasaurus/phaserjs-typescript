import {TIME} from "../game_state/Play";
import {Cell} from "./Cell";
import Group = Phaser.Group;

export default class ExitCell extends Cell {
  constructor(game: Phaser.Game, x: number, y: number, groundGroup: Group) {
    super(game, x, y, groundGroup);

    this.sprite.animations.add('DEFAULT', [71, 72, 73], Phaser.Timer.SECOND * 3 / TIME, true);
    this.sprite.animations.play('DEFAULT');
  }
}