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
var FISHCIRCLE = 600;
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
        this.physics.add.overlap(this.fishes, this.fishes, function (body1, body2) {
            var fish2 = body2;
            var fish1 = body1;
            if (!(fish2.uniqueName in fish1.fishesInRange)) {
                fish2.fishesInRange[fish1.uniqueName] = fish1;
                fish1.fishesInRange[fish2.uniqueName] = fish2;
            }
        });
    };
    TestScene.prototype.update = function () {
        var _this = this;
        this.graphics.clear();
        /* ***********
         * KEYBOARD CONTROLS
         * ************ */
        if (this.keyboardDirection[0] != 0 || this.keyboardDirection[1] != 0) {
            this.octopus.desiredX = this.octopus.x + this.keyboardDirection[0] * OCTOPUSSPEED * 100;
            this.octopus.desiredY = this.octopus.y + this.keyboardDirection[1] * OCTOPUSSPEED * 100;
        }
        this.octopus.UpdatePosition();
        this.fishes.children.each(function (f) { return f.UpdateDraw(_this.graphics); });
    };
    return TestScene;
}(Phaser.Scene));
var Fish = /** @class */ (function (_super) {
    __extends(Fish, _super);
    function Fish(uniqueName, scene, x, y) {
        var _this = _super.call(this, scene, x, y, 'fish') || this;
        _this.fishesInRange = {};
        _this.uniqueName = uniqueName;
        _this.scale = 0.2;
        _this.originX = _this.width / 2;
        _this.originY = _this.height / 2;
        return _this;
    }
    Fish.prototype.UpdateDraw = function (graphics) {
        var fishIdx = 3;
        for (var key in this.fishesInRange) {
            graphics.lineStyle(fishIdx, 0xff0000);
            var connectedFish = this.fishesInRange[key];
            if (this.focusedFish == null) {
                this.focusedFish = connectedFish;
            }
            if (this.focusedFish === connectedFish) {
                graphics.lineStyle(fishIdx * 3, 0x00ff00);
            }
            fishIdx++;
            var distance = Phaser.Math.Distance.BetweenPoints(this, connectedFish);
            graphics.lineBetween(this.x, this.y, connectedFish.x, connectedFish.y);
            if (distance >= FISHCIRCLE / 2 + 10) {
                delete this.fishesInRange[key];
                if (this.focusedFish.uniqueName == key) {
                    this.focusedFish = null;
                }
            }
        }
    };
    return Fish;
}(Phaser.Physics.Arcade.Sprite));
var Octopus = /** @class */ (function (_super) {
    __extends(Octopus, _super);
    function Octopus(scene, x, y) {
        var _this = _super.call(this, scene, x, y, 'octopus') || this;
        _this.desiredX = 0;
        _this.desiredY = 0;
        _this.originX = _this.width / 2;
        _this.originY = _this.height / 2;
        _this.scale = 0.2;
        _this.desiredX = _this.x;
        _this.desiredY = _this.y;
        _this.lastUpdateTime = _this.scene.time.now;
        return _this;
    }
    Octopus.prototype.UpdatePosition = function () {
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
    };
    return Octopus;
}(Phaser.Physics.Arcade.Sprite));
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map