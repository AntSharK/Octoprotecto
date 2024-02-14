/// <reference path="../Lib/phaser.d.ts"/>

const OCTOPUSSPEED = 0.3;
const FISHCIRCLE = 600;
class SimpleGame {

    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true
                }
            },

            parent: 'content',
            width: 1024,
            height: 768,
            backgroundColor: '#FFFFFF',
            transparent: false,
            clearBeforeRender: false,
            scene: [TestScene],
            scale: {
                mode: Phaser.Scale.ScaleModes.FIT,
                resizeInterval: 1,
            },
        });
    }
}

class TestScene extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    tentacle: Tentacle;
    octopus: Octopus;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;

    keyboardDirection: [x: integer, y: integer] = [0, 0];

    preload() {
        this.load.image('ocean', 'Assets/ocean.jpg');
        this.load.image('octopus', 'Assets/ghost.png');
        this.load.image('fish', 'Assets/star.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var background = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'ocean');
        background.displayWidth = this.game.canvas.width;
        background.displayHeight = this.game.canvas.height;
        background.depth = -1;


        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        this.input.keyboard.on('keydown-RIGHT', event => {
            this.keyboardDirection[0] = 1;
        }, this);
        this.input.keyboard.on('keyup-RIGHT', event => {
            this.keyboardDirection[0] = 0;
        }, this);
        this.input.keyboard.on('keydown-LEFT', event => {
            this.keyboardDirection[0] = -1;
        }, this);
        this.input.keyboard.on('keyup-LEFT', event => {
            this.keyboardDirection[0] = 0;
        }, this);
        this.input.keyboard.on('keydown-UP', event => {
            this.keyboardDirection[1] = -1;
        }, this);
        this.input.keyboard.on('keyup-UP', event => {
            this.keyboardDirection[1] = 0;
        }, this);
        this.input.keyboard.on('keydown-DOWN', event => {
            this.keyboardDirection[1] = 1;
        }, this);
        this.input.keyboard.on('keyup-DOWN', event => {
            this.keyboardDirection[1] = 0;
        }, this);

        this.tentacle = new Tentacle;

        this.octopi = this.physics.add.group({
            defaultKey: 'octopus',
            immovable: true,
            
        });

        this.octopus = new Octopus(this, this.game.canvas.width / 2, this.game.canvas.height / 2);
        this.add.existing(this.octopus);
        this.octopi.add(this.octopus);
        this.octopus.setCircle(500, this.octopus.originX - 500, this.octopus.originY - 500);

        this.fishes = this.physics.add.group({
            defaultKey: 'fish',
            immovable: false,
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true
        });

        for (var i = 0; i < 20; i++) {
            var fish = new Fish("fish" + i, this, 200 + i * 50, 200 + i * 50);
            this.add.existing(fish);
            this.fishes.add(fish);
            Phaser.Math.RandomXY(fish.body.velocity, 100);

            fish.setCircle(FISHCIRCLE, fish.originX - FISHCIRCLE, fish.originY - FISHCIRCLE);
        }

        this.physics.add.overlap(this.fishes, this.fishes, (body1, body2) => {
            var fish2 = body2 as Fish;
            var fish1 = body1 as Fish;
            if (!(fish2.uniqueName in fish1.fishesInRange)) {
                fish2.fishesInRange[fish1.uniqueName] = fish1;
                fish1.fishesInRange[fish2.uniqueName] = fish2;
            }
        });
    }

    update() {
        this.graphics.clear();
        this.tentacle.draw(this.graphics);

        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        if (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0) {
            this.octopus.desiredX = this.octopus.x + this.keyboardDirection[0] * OCTOPUSSPEED * 200;
            this.octopus.desiredY = this.octopus.y + this.keyboardDirection[1] * OCTOPUSSPEED * 200;
        }

        this.octopus.UpdatePosition();
        this.fishes.children.each(f => (<Fish>f).UpdateDraw(this.graphics));
    }
}

class Fish extends Phaser.Physics.Arcade.Sprite {
    fishesInRange: { [id: string]: Fish } = {};
    focusedFish: Fish;
    uniqueName: string;

    constructor(uniqueName: string, scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'fish');

        this.uniqueName = uniqueName;
        this.scale = 0.2;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
    }

    UpdateDraw(graphics: Phaser.GameObjects.Graphics) {
        var fishIdx = 3;
        for (let key in this.fishesInRange) {
            graphics.lineStyle(fishIdx, 0xff0000);
            let connectedFish = this.fishesInRange[key];

            if (this.focusedFish == null) {
                this.focusedFish = connectedFish;
            }

            if (this.focusedFish === connectedFish) {
                graphics.lineStyle(fishIdx * 3, 0x00ff00);
            }
            fishIdx++;

            var distance = Phaser.Math.Distance.BetweenPoints(this, connectedFish);
            graphics.lineBetween(this.x, this.y, connectedFish.x, connectedFish.y);
            if (distance >= FISHCIRCLE/2 + 10) {
                delete this.fishesInRange[key];

                if (this.focusedFish.uniqueName == key) { this.focusedFish = null; }
            }
        }
    }
}

class Octopus extends Phaser.Physics.Arcade.Sprite {
    desiredX: integer = 0;
    desiredY: integer = 0;
    lastUpdateTime: number;


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'octopus');

        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.scale = 0.2;
        
        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;
    }

    UpdatePosition() {
        var deltaTime = this.scene.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.scene.time.now;
        var speed = OCTOPUSSPEED * deltaTime;

        var moveDirection = new Phaser.Math.Vector2(this.desiredX - this.x, this.desiredY - this.y);
        if (moveDirection.length() <= speed) {
            return;
        }
        moveDirection.normalize();

        // Move
        if (Math.abs(this.desiredX - this.x) > speed) {
            this.x += moveDirection.x * speed;
        }

        if (Math.abs(this.desiredY - this.y) > speed) {
            this.y += moveDirection.y * speed;
        }
    }
}

class Tentacle {
    Segments: TentacleSegment[] = [];
    Start: Phaser.Math.Vector2;
    End: Phaser.Math.Vector2;

    constructor() {
        this.Start = new Phaser.Math.Vector2(500, 500);
        this.End = new Phaser.Math.Vector2(100, 500);

        for (var i = 0; i < 10; i++) {
            var newSegment = new TentacleSegment;
            newSegment.Color = 0xFF0000 + (0x001900 * i);
            newSegment.Location = new Phaser.Math.Vector2(500 - i * 50, 500);

            if (i != 0) {
                this.Segments[i - 1].After = newSegment;
            }

            this.Segments[i] = newSegment;
        }
    }

    draw(graphics: Phaser.GameObjects.Graphics) {
        for (var i = 0; i < 10; i++) {
            var segment = this.Segments[i];

            graphics.lineStyle(10, segment.Color);
            var pointTo = this.End;
            if (segment.After != null) {
                pointTo = segment.After.Location;
            }

            graphics.lineBetween(segment.Location.x, segment.Location.y, pointTo.x, pointTo.y);
        }
    }
}

class TentacleSegment {
    After: TentacleSegment;
    Location: Phaser.Math.Vector2;
    Rotation: number;
    Length: number;
    Color: number;
}

window.onload = () => {
    var game = new SimpleGame();
};