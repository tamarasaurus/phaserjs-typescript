import {Cell} from "./Cell";
import {Level} from "../levels/Level";
import Player from "../Player";
import Point from "../Point";
import Game = Phaser.Game;
import {GameObject} from "../game_objects/GameObject";

export class BrownButton extends Cell {
  private destination: Cell;

  constructor(game: Phaser.Game, x: number, y: number, groundGroup: Phaser.Group) {
    super(game, x, y, groundGroup);

    this.sprite.frame = 42;
  }

  setDestination(destCell: Cell) {
    this.destination = destCell;
  }

  animateEnd(game: Game, level: Level, player: Player|GameObject, endPosition: Point) {
    this.destination.runAction(game, level);
  }
}