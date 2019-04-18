import Sprite = Phaser.Sprite;
import {BLOCKTIME, TILE_SIZE, TIME} from "./game_state/Play";
import {COLOR, Level, GROUND_SIZE} from "./levels/Level";
import {BagItem, BagItemKey} from "./BagItem";
import Point from "./Point";
import {IceCell, IceCellBottomLeft, IceCellTopLeft} from "./cells/Cell";
import {SENS} from "./Sens";

export default class Player {
  private sprite: Sprite;
  private position: Point;
  private chips: number;
  private dead: boolean = false;
  private sens: SENS;

  private leftKey: Phaser.Key;
  private rightKey: Phaser.Key;
  private upKey: Phaser.Key;
  private downKey: Phaser.Key;

  private pressedKeys: Phaser.Key[] = [];
  private isProcessing: boolean = false;
  private level: Level;
  private bag: BagItem[];

  constructor(level: Level) {
    this.level = level;
    this.bag = [];
    this.chips = 0;
    this.sens = SENS.DOWN;
  }

  create(game: Phaser.Game) {
    this.position = this.level.getPlayerPosition();
    this.pressedKeys = [];
    this.isProcessing = false;
    this.sprite = game.add.sprite(Player.getPosition(this.position).x, Player.getPosition(this.position).y, 'chips', 130);
    this.sprite.anchor.set(0.5, 0.5);
    this.leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    this.rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    this.upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    this.sprite.animations.add(SENS.LEFT, [101, 102, 103, 104, 105, 104, 103, 102], Phaser.Timer.SECOND * 4 / TIME, true);
    this.sprite.animations.add(SENS.RIGHT, [133, 134, 135, 136, 137, 136, 135, 134], Phaser.Timer.SECOND * 4 / TIME, true);
    this.sprite.animations.add(SENS.UP, [96, 97, 98, 99, 100, 99, 98, 97], Phaser.Timer.SECOND * 4 / TIME, true);
    this.sprite.animations.add(SENS.DOWN, [128, 129, 130, 131, 132, 131, 130, 129], Phaser.Timer.SECOND * 4 / TIME, true);
    this.sprite.animations.add('DEFAULT', [130]);

    game.camera.follow(this.sprite);
  }

  update(game: Phaser.Game) {
    if (this.dead) {
      return;
    }

    if (this.leftKey.justDown) {
      this.pressedKeys.push(this.leftKey);
    } else if (this.rightKey.justDown) {
      this.pressedKeys.push(this.rightKey);
    }
    if (this.upKey.justDown) {
      this.pressedKeys.push(this.upKey);
    } else if (this.downKey.justDown) {
      this.pressedKeys.push(this.downKey);
    }

    if (this.pressedKeys.length && !this.isProcessing) {
      const key = this.pressedKeys[0];
      if (key === this.leftKey) {
        if (this.isCellAccessible(this.position.left())) {
          this.runAnimation(game, this.position.left());
        } else {
          this.runBlocked(game, SENS.LEFT, this.leftKey);
        }
      } else if (key === this.rightKey) {
        if (this.isCellAccessible(this.position.right())) {
          this.runAnimation(game, this.position.right());
        } else {
          this.runBlocked(game, SENS.RIGHT, this.rightKey);
        }

      } else if (key === this.upKey) {
        if (this.isCellAccessible(this.position.up())) {
          this.runAnimation(game, this.position.up());
        } else {
          this.runBlocked(game, SENS.UP, this.upKey);
        }
      } else if (key === this.downKey) {
        if (this.isCellAccessible(this.position.down())) {
          this.runAnimation(game, this.position.down());
        } else {
          this.runBlocked(game, SENS.DOWN, this.downKey);
        }
      }
    }
  }

  private runAnimation(game: Phaser.Game, newPosition: Point) {
    const iceSpeed = TIME / 2;
    this.isProcessing = true;
    const newCell = this.level.getCellAt(newPosition);
    const currentCell = this.level.getCellAt(this.position);
    if (newCell instanceof IceCell || currentCell instanceof IceCellBottomLeft || currentCell instanceof IceCellTopLeft) {
      if (currentCell instanceof IceCellBottomLeft || currentCell instanceof IceCellTopLeft) {
        newPosition = currentCell.getNewPosition(this.position, newPosition);
      }
      this.level.animateBegin(game, this, newPosition);
      const animation = this.getAnimation(this.position, newPosition);
      if (this.sprite.animations.currentAnim !== this.sprite.animations.getAnimation(animation + '')) {
        this.sprite.animations.play(animation + '');
      }
      game.add.tween(this.sprite).to({
        x: Player.getPosition(newPosition).x,
        y: Player.getPosition(newPosition).y
      }, iceSpeed, Phaser.Easing.Default, true);
      game.time.events.add(iceSpeed, () => {
        this.isProcessing = false;
        const gap = newPosition.remove(this.position);
        this.level.animateEnd(game, this, newPosition);
        this.position = newPosition;
        this.sprite.x = Player.getPosition(this.position).x;
        this.sprite.y = Player.getPosition(this.position).y;
        this.runAnimation(game, this.position.add(gap));
      }, this);
    } else {
      this.level.animateBegin(game, this, newPosition);
      const animation = this.getAnimation(this.position, newPosition);
      if (this.sprite.animations.currentAnim !== this.sprite.animations.getAnimation(animation + '')) {
        this.sprite.animations.play(animation + '');
      }
      game.add.tween(this.sprite).to({
        x: Player.getPosition(newPosition).x,
        y: Player.getPosition(newPosition).y
      }, TIME, Phaser.Easing.Default, true);
      game.time.events.add(TIME, () => {
        this.isProcessing = false;
        this.level.animateEnd(game, this, newPosition);
        this.pressedKeys.shift();
        this.position = newPosition;
        this.sprite.x = Player.getPosition(this.position).x;
        this.sprite.y = Player.getPosition(this.position).y;
        if (!this.pressedKeys.length) {
          this.sprite.animations.stop();
          this.sprite.animations.currentAnim = null;
          if (animation === SENS.LEFT) {
            this.sprite.frame = 103;
          } else if (animation === SENS.RIGHT) {
            this.sprite.frame = 135;
          } else if (animation === SENS.UP) {
            this.sprite.frame = 98;
          } else if (animation === SENS.DOWN) {
            this.sprite.frame = 130;
          }
        }
      }, this)
    }
  }

  private getAnimation(begin: Point, end: Point): SENS {
    if (begin.x < end.x) {
      return SENS.RIGHT;
    } else if (begin.x > end.x) {
      return SENS.LEFT;
    } else if (begin.y < end.y) {
      return SENS.DOWN;
    } else {
      return SENS.UP;
    }
  }

  private runBlocked(game: Phaser.Game, animationName: string, key: Phaser.Key) {
    this.sprite.animations.stop();
    this.sprite.animations.currentAnim = null;
    if (animationName === SENS.LEFT) {
      this.sprite.frame = 113;
    } else if (animationName === SENS.RIGHT) {
      this.sprite.frame = 145;
    } else if (animationName === SENS.UP) {
      this.sprite.frame = 108;
    } else if (animationName === SENS.DOWN) {
      this.sprite.frame = 140;
    }
    this.isProcessing = true;
    game.time.events.add(BLOCKTIME / 2, () => {
      if (animationName === SENS.LEFT) {
        this.sprite.frame = 103;
      } else if (animationName === SENS.RIGHT) {
        this.sprite.frame = 135;
      } else if (animationName === SENS.UP) {
        this.sprite.frame = 98;
      } else if (animationName === SENS.DOWN) {
        this.sprite.frame = 130;
      }
    });
    game.time.events.add(BLOCKTIME, () => {
      this.isProcessing = false;
      while (this.pressedKeys.length && this.pressedKeys[0] === key) {
        this.pressedKeys.shift();
      }
    })
  }

  private static getPosition(point: PIXI.Point) {
    return new PIXI.Point((point.x + 0.5) * TILE_SIZE, (point.y + 0.5) * TILE_SIZE);
  }

  render(game: Phaser.Game) {
    //game.debug.cameraInfo(game.camera, 0, 10);
    game.debug.text(this.getPosition().x + ',' + this.getPosition().y, 0, 10);
  }

  private isCellAccessible(point: Point) {
    if (point.x < 0) {
      return false;
    }
    if (point.x >= GROUND_SIZE) {
      return false;
    }
    if (point.y < 0) {
      return false;
    }
    if (point.y >= GROUND_SIZE) {
      return false;
    }
    return this.level.canPlayerGoTo(this, point);
  }

  hasKey(color: COLOR) {
    return this.getKeyIndex(color) >= 0;
  }

  addItem(bagItemKey: BagItemKey) {
    this.bag.push(bagItemKey);
  }

  removeKey(color: COLOR) {
    if (!this.hasKey(color)) {
      console.log('OOPS');
    }
    const index = this.getKeyIndex(color);
    this.bag.splice(index, 1);
  }

  getKeyIndex(color: COLOR) {
    for (let i = 0; i < this.bag.length; i++) {
      const bagItem = this.bag[i];
      if (bagItem instanceof BagItemKey && bagItem.getColor() === color) {
        return i;
      }
    }

    return -1;
  }

  addChip() {
    this.chips++;
  }

  getChips(): number {
    return this.chips;
  }

  canExit() {
    return this.chips >= this.level.getChipsNeeded();
  }

  getPosition(): Point {
    return this.position;
  }

  destroy() {
    this.sprite.destroy(true);
  }
}
