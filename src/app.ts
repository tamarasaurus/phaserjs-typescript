/// <reference path="../lib/phaser.d.ts"/>

import Boot from "./game/game_state/Boot";
import Preload from "./game/game_state/Preload";
import Play from "./game/game_state/Play";

export const SCALE = 5;
export const PIXELS_WIDTH = 102;
const GAME_WIDTH = PIXELS_WIDTH * SCALE + 58 * SCALE;
const GAME_HEIGHT = PIXELS_WIDTH * SCALE;

class SimpleGame extends Phaser.Game {
    constructor() {
        super({
            width: GAME_WIDTH / SCALE,
            height: GAME_HEIGHT / SCALE,
            renderer: Phaser.CANVAS,
            parent: null,
            state: 'content',
            transparent: false,
            antialias: false,
            physicsConfig: false
        });

        this.antialias = false;
        this.state.add('Boot', Boot);
        this.state.add('Preload', Preload);
        this.state.add('Play', Play);
        this.state.start('Boot');
    }
}

window.onload = () => {
    new SimpleGame();
};
