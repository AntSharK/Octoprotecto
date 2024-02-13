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
        this.tentacle = new Tentacle;
        this.octopus = new Octopus(this, this.game.canvas.width / 2, this.game.canvas.height / 2);
        this.add.existing(this.octopus);
    };
    TestScene.prototype.update = function () {
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
    };
    return TestScene;
}(Phaser.Scene));
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
var Tentacle = /** @class */ (function () {
    function Tentacle() {
        this.Segments = [];
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
    Tentacle.prototype.draw = function (graphics) {
        for (var i = 0; i < 10; i++) {
            var segment = this.Segments[i];
            graphics.lineStyle(10, segment.Color);
            var pointTo = this.End;
            if (segment.After != null) {
                pointTo = segment.After.Location;
            }
            graphics.lineBetween(segment.Location.x, segment.Location.y, pointTo.x, pointTo.y);
        }
    };
    return Tentacle;
}());
var TentacleSegment = /** @class */ (function () {
    function TentacleSegment() {
    }
    return TentacleSegment;
}());
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map