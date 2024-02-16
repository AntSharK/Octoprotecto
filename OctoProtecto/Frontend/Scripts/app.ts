/// <reference path="../Lib/phaser.d.ts"/>

const OCTOPUSSPEED = 0.3;
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
    octopus: Octopus;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;
    weapons: Phaser.Physics.Arcade.Group;
    bullets: Phaser.Physics.Arcade.Group;

    keyboardDirection: [x: integer, y: integer] = [0, 0];

    preload() {
        this.load.image('ocean', 'Assets/ocean.jpg');
        this.load.image('octopus', 'Assets/ghost.png');
        this.load.image('fish', 'Assets/star.png');
        this.load.image('dummy', 'Assets/dummy.png');
        this.load.image('bullet', 'Assets/bullet.png');
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

        this.octopi = this.physics.add.group({
            defaultKey: 'octopus',
            immovable: true,
        });

        this.fishes = this.physics.add.group({
            defaultKey: 'fish',
            immovable: false,
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true
        });

        this.weapons = this.physics.add.group({
            defaultKey: 'dummy',
            immovable: true
        });

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            immovable: false
        });

        this.octopus = new Octopus("testOctopus",
            this,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            this.octopi,
            this.weapons,
            this.bullets);

        for (var i = 0; i < 20; i++) {
            var fish = new Fish("fish" + i, this, 200 + i * 50, 200 + i * 50);
            this.add.existing(fish);
            this.fishes.add(fish);
            Phaser.Math.RandomXY(fish.body.velocity, 100);

            //fish.setCircle(FISHCIRCLE, fish.originX - FISHCIRCLE, fish.originY - FISHCIRCLE);
        }

        this.physics.add.overlap(this.fishes, this.weapons, (body1, body2) => {
            var weapon = body2 as Weapon;
            var fish = body1 as Fish;
            if (!(fish.uniqueName in weapon.fishesInRange)) {
                weapon.fishesInRange[fish.uniqueName] = fish;
            }
        });
    }

    update() {
        this.graphics.clear();

        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        if (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0) {

            // Ideally, running at 30FPS, we'll have to move at least OCTOPUSSPEED * 33
            this.octopus.desiredX = this.octopus.x + this.keyboardDirection[0] * OCTOPUSSPEED * 50;
            this.octopus.desiredY = this.octopus.y + this.keyboardDirection[1] * OCTOPUSSPEED * 50;
        }

        this.octopus.UpdateOctopus(this.graphics);
    }
}

class Fish extends Phaser.Physics.Arcade.Sprite {
    uniqueName: string;

    constructor(uniqueName: string, scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'fish');

        this.uniqueName = uniqueName;
        this.originX = this.width / 2;
        this.originY = this.height / 2;
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    bulletWeapon: Weapon;
    target: Fish;
    moveDirection: Phaser.Math.Vector2;
    speed: number = 500;

    constructor(weapon: Weapon,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group) {
        super(weapon.scene, weapon.x, weapon.y, 'bullet');

        this.bulletWeapon = weapon;
        bulletPhysicsGroup.add(this);
        this.scene.add.existing(this);
    }

    FireToFish(focusedFish: Fish) {
        this.moveDirection = new Phaser.Math.Vector2(focusedFish.x - this.x, focusedFish.y - this.y);
        this.moveDirection.normalize();

        this.setRotation(Math.atan2(this.moveDirection.y, this.moveDirection.x));
        this.setVelocity(this.moveDirection.x * this.speed, this.moveDirection.y * this.speed);
    }
}

class Weapon extends Phaser.Physics.Arcade.Sprite {
    weaponOwner: Octopus;
    offsetX: number = 0;
    offsetY: number = 0;
    range: number = 0;

    fishesInRange: { [id: string]: Fish } = {};
    focusedFish: Fish;
    bulletPhysicsGroup: Phaser.Physics.Arcade.Group;

    nextFireTime: number = 0;
    fireRate: number = 400;

    constructor(octopus: Octopus, offsetX: number, offsetY: number, range: number,
        weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group) {
        super(octopus.scene, octopus.x + offsetX, octopus.y + offsetY, 'dummy');

        this.weaponOwner = octopus;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.range = range;
        this.setVisible(false);

        weaponsPhysicsGroup.add(this);
        this.setCircle(range, -range, -range);
        this.bulletPhysicsGroup = bulletPhysicsGroup;
    }

    FireWeapon(focusedFish: Fish) {
        var bullet = new Bullet(this, this.bulletPhysicsGroup);
        bullet.FireToFish(focusedFish);
    }

    UpdateWeapon(graphics: Phaser.GameObjects.Graphics) {
        this.setPosition(this.weaponOwner.x + this.offsetX, this.weaponOwner.y + this.offsetY);

        if (this.nextFireTime < this.scene.time.now
            && this.focusedFish != null) {
            this.nextFireTime += this.fireRate;
            if (this.nextFireTime < this.scene.time.now) {
                this.nextFireTime = this.scene.time.now + this.fireRate;
            }

            this.FireWeapon(this.focusedFish);
        }

        for (let key in this.fishesInRange) {
            let connectedFish = this.fishesInRange[key];
            var distance = Phaser.Math.Distance.BetweenPoints(this, connectedFish);

            if (this.focusedFish == null) {
                this.focusedFish = connectedFish;
            }
            /* DEBUGGING FOR TARGET ACQUISITION
            graphics.lineStyle(fishIdx, 0xff0000);

            if (this.focusedFish === connectedFish) {
                graphics.lineStyle(fishIdx * 3, 0x00ff00);
            }
            fishIdx++;

            graphics.lineBetween(this.x, this.y, connectedFish.x, connectedFish.y);
            */

            if (distance >= this.range + 10) {
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
    name: string;
    weapons: Weapon[] = [];

    constructor(name: string, scene: Phaser.Scene, x: number, y: number,
        octopiPhysicsGroup: Phaser.Physics.Arcade.Group,
        weaponsPhysicsGroup: Phaser.Physics.Arcade.Group,
        bulletPhysicsGroup: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, 'octopus');

        this.name = name;
        this.originX = this.width / 2;
        this.originY = this.height / 2;

        this.desiredX = this.x;
        this.desiredY = this.y;
        this.lastUpdateTime = this.scene.time.now;

        for (var i = 0; i < 1; i++) {
            var w1 = new Weapon(this, 100, i * 30, 100, weaponsPhysicsGroup, bulletPhysicsGroup);
            var w2 = new Weapon(this, -100, i * 30, 100, weaponsPhysicsGroup, bulletPhysicsGroup);
            this.weapons.push(w1, w2);
        }

        scene.add.existing(this);
        octopiPhysicsGroup.add(this);
        this.setCircle(125, this.originX - 125, this.originY - 125);
    }

    UpdateOctopus(graphics: Phaser.GameObjects.Graphics) {
        this.weapons.forEach(w => w.UpdateWeapon(graphics));

        var deltaTime = this.scene.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.scene.time.now;
        var speed = OCTOPUSSPEED * deltaTime;

        var moveDirection = new Phaser.Math.Vector2(this.desiredX - this.x, this.desiredY - this.y);
        if (moveDirection.length() <= speed) {
            this.x = this.desiredX;
            this.y = this.desiredY;
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

window.onload = () => {
    var game = new SimpleGame();
};