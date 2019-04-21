import {TIME} from "../game_state/Play";
import Player from "../Player";
import {Level} from "../levels/Level";
import Point from "../Point";
import {Cell} from "./Cell";
import Group = Phaser.Group;
import Game = Phaser.Game;
import {FireBoots} from "../game_objects/PickableObject";

export class FireCell extends Cell {
  private static FIRE_ANIMATION: number[] = [32, 33, 34];

  constructor(game: Phaser.Game, x: number, y: number, groundGroup: Group) {
    super(game, x, y, groundGroup);

    this.sprite.frame = FireCell.FIRE_ANIMATION[0];
    this.sprite.animations.add('DEFAULT', FireCell.FIRE_ANIMATION, Phaser.Timer.SECOND * 3 / TIME, true);
    this.sprite.animations.play('DEFAULT');
  }

  isDead(player: Player) {
    if (player.has(FireBoots)) {
      return false;
    }

    return true;
  }

  animatePlayerEnd(game: Game, level: Level, player: Player, endPosition: Point) {
    if (player.has(FireBoots)) {
      return;
    }

    level.animateFireAt(game, endPosition);
  }
}