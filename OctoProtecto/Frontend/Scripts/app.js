/// <reference path="../Lib/phaser.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var OCTOPUSSPEED = 0.3;
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
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
    return SimpleGame;
}());
var TestScene = /** @class */ (function (_super) {
    __extends(TestScene, _super);
    function TestScene() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.keyboardDirection = [0, 0];
        return _this;
    }
    TestScene.prototype.preload = function () {
        this.load.image('ocean', 'Assets/ocean.jpg');
        this.load.image('octopus', 'Assets/ghost.png');
        this.load.image('fish', 'Assets/star.png');
        this.load.image('dummy', 'Assets/dummy.png');
        this.load.image('bullet', 'Assets/bullet.png');
    };
    TestScene.prototype.create = function () {
        var _this = this;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        var background = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'ocean');
        background.displayWidth = this.game.canvas.width;
        background.displayHeight = this.game.canvas.height;
        background.depth = -1;
        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        this.input.keyboard.on('keydown-RIGHT', function (event) {
            _this.keyboardDirection[0] = 1;
        }, this);
        this.input.keyboard.on('keyup-RIGHT', function (event) {
            _this.keyboardDirection[0] = 0;
        }, this);
        this.input.keyboard.on('keydown-LEFT', function (event) {
            _this.keyboardDirection[0] = -1;
        }, this);
        this.input.keyboard.on('keyup-LEFT', function (event) {
            _this.keyboardDirection[0] = 0;
        }, this);
        this.input.keyboard.on('keydown-UP', function (event) {
            _this.keyboardDirection[1] = -1;
        }, this);
        this.input.keyboard.on('keyup-UP', function (event) {
            _this.keyboardDirection[1] = 0;
        }, this);
        this.input.keyboard.on('keydown-DOWN', function (event) {
            _this.keyboardDirection[1] = 1;
        }, this);
        this.input.keyboard.on('keyup-DOWN', function (event) {
            _this.keyboardDirection[1] = 0;
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
        this.octopus = new Octopus("testOctopus", this, this.game.canvas.width / 2, this.game.canvas.height / 2, this.octopi, this.weapons, this.bullets);
        for (var i = 0; i < 20; i++) {
            var fish = new Fish("fish" + i, this, 200 + i * 50, 200 + i * 50);
            this.add.existing(fish);
            this.fishes.add(fish);
            Phaser.Math.RandomXY(fish.body.velocity, 100);
            //fish.setCircle(FISHCIRCLE, fish.originX - FISHCIRCLE, fish.originY - FISHCIRCLE);
        }
        this.physics.add.overlap(this.fishes, this.weapons, function (body1, body2) {
            var weapon = body2;
            var fish = body1;
            if (!(fish.uniqueName in weapon.fishesInRange)) {
                weapon.fishesInRange[fish.uniqueName] = fish;
            }
        });
        this.physics.add.overlap(this.fishes, this.bullets, function (body1, body2) {
            var bullet = body2;
            var fish = body1;
            bullet.ApplyHit(fish);
        });
    };
    TestScene.prototype.update = function () {
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
    };
    return TestScene;
}(Phaser.Scene));
var Fish = /** @class */ (function (_super) {
    __extends(Fish, _super);
    function Fish(uniqueName, scene, x, y) {
        var _this = _super.call(this, scene, x, y, 'fish') || this;
        _this.hp = 10;
        _this.uniqueName = uniqueName;
        _this.originX = _this.width / 2;
        _this.originY = _this.height / 2;
        return _this;
    }
    return Fish;
}(Phaser.Physics.Arcade.Sprite));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet(weapon, bulletPhysicsGroup) {
        var _this = _super.call(this, weapon.scene, weapon.x, weapon.y, 'bullet') || this;
        _this.speed = 350;
        _this.bulletWeapon = weapon;
        bulletPhysicsGroup.add(_this);
        _this.scene.add.existing(_this);
        return _this;
    }
    Bullet.prototype.ApplyHit = function (fish) {
        var _a;
        fish.hp--;
        fish.setAlpha(0.5 + 0.05 * fish.hp);
        if (fish.hp <= 0) {
            if (((_a = this.bulletWeapon.focusedFish) === null || _a === void 0 ? void 0 : _a.uniqueName) == fish.uniqueName) {
                this.bulletWeapon.focusedFish = null;
            }
            if (fish.uniqueName in this.bulletWeapon.fishesInRange) {
                delete this.bulletWeapon.fishesInRange[fish.uniqueName];
            }
            fish.destroy(true);
        }
        this.destroy(true);
    };
    Bullet.prototype.FireToFish = function (focusedFish) {
        var _this = this;
        this.moveDirection = new Phaser.Math.Vector2(focusedFish.x - this.x, focusedFish.y - this.y);
        this.moveDirection.normalize();
        this.setRotation(Math.atan2(this.moveDirection.y, this.moveDirection.x));
        this.setVelocity(this.moveDirection.x * this.speed, this.moveDirection.y * this.speed);
        this.scene.time.addEvent({
            delay: this.bulletWeapon.range / this.speed * 1000,
            callback: function () { return _this.destroy(true); },
            callbackScope: this
        });
    };
    return Bullet;
}(Phaser.Physics.Arcade.Sprite));
var Weapon = /** @class */ (function (_super) {
    __extends(Weapon, _super);
    function Weapon(octopus, offsetX, offsetY, range, weaponsPhysicsGroup, bulletPhysicsGroup) {
        var _this = _super.call(this, octopus.scene, octopus.x + offsetX, octopus.y + offsetY, 'dummy') || this;
        _this.offsetX = 0;
        _this.offsetY = 0;
        _this.range = 0;
        _this.fishesInRange = {};
        _this.nextFireTime = 0;
        _this.fireRate = 200;
        _this.weaponOwner = octopus;
        _this.offsetX = offsetX;
        _this.offsetY = offsetY;
        _this.range = range;
        _this.setVisible(false);
        weaponsPhysicsGroup.add(_this);
        _this.setCircle(range, -range, -range);
        _this.bulletPhysicsGroup = bulletPhysicsGroup;
        return _this;
    }
    Weapon.prototype.FireWeapon = function (focusedFish) {
        var bullet = new Bullet(this, this.bulletPhysicsGroup);
        bullet.FireToFish(focusedFish);
    };
    Weapon.prototype.UpdateWeapon = function (graphics) {
        var _a;
        this.setPosition(this.weaponOwner.x + this.offsetX, this.weaponOwner.y + this.offsetY);
        if (this.nextFireTime < this.scene.time.now
            && this.focusedFish != null
            && this.focusedFish.active) {
            this.nextFireTime += this.fireRate;
            if (this.nextFireTime < this.scene.time.now) {
                this.nextFireTime = this.scene.time.now + this.fireRate;
            }
            this.FireWeapon(this.focusedFish);
        }
        for (var key in this.fishesInRange) {
            var connectedFish = this.fishesInRange[key];
            var distance = Phaser.Math.Distance.BetweenPoints(this, connectedFish);
            if (this.focusedFish == null || !this.focusedFish.active) {
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
                if (((_a = this.focusedFish) === null || _a === void 0 ? void 0 : _a.uniqueName) == key) {
                    this.focusedFish = null;
                }
            }
        }
    };
    return Weapon;
}(Phaser.Physics.Arcade.Sprite));
var Octopus = /** @class */ (function (_super) {
    __extends(Octopus, _super);
    function Octopus(name, scene, x, y, octopiPhysicsGroup, weaponsPhysicsGroup, bulletPhysicsGroup) {
        var _this = _super.call(this, scene, x, y, 'octopus') || this;
        _this.desiredX = 0;
        _this.desiredY = 0;
        _this.weapons = [];
        _this.name = name;
        _this.originX = _this.width / 2;
        _this.originY = _this.height / 2;
        _this.desiredX = _this.x;
        _this.desiredY = _this.y;
        _this.lastUpdateTime = _this.scene.time.now;
        for (var i = 0; i < 1; i++) {
            var w1 = new Weapon(_this, 100, i * 30, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
            var w2 = new Weapon(_this, -100, i * 30, 225, weaponsPhysicsGroup, bulletPhysicsGroup);
            _this.weapons.push(w1, w2);
        }
        scene.add.existing(_this);
        octopiPhysicsGroup.add(_this);
        _this.setCircle(125, _this.originX - 125, _this.originY - 125);
        return _this;
    }
    Octopus.prototype.UpdateOctopus = function (graphics) {
        this.weapons.forEach(function (w) { return w.UpdateWeapon(graphics); });
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
    };
    return Octopus;
}(Phaser.Physics.Arcade.Sprite));
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map