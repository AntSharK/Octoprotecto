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
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'content',
            width: 800,
            height: 600,
            backgroundColor: 'rgba(100,0,0,0)',
            transparent: true,
            clearBeforeRender: false,
            scene: [TestScene]
        });
    }
    return SimpleGame;
}());
var TestScene = /** @class */ (function (_super) {
    __extends(TestScene, _super);
    function TestScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestScene.prototype.preload = function () {
        this.load.image('logo', 'Assets/ppp.png');
    };
    TestScene.prototype.create = function () {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        var logo = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'logo');
        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', function (pointer) {
            var moveDirection = new Phaser.Math.Vector2(pointer.x, pointer.y);
            moveDirection.normalize();
            var desiredRotation = Math.atan2(moveDirection.y, moveDirection.x);
            this.graphics.lineStyle(10, 0x99ff00);
            this.graphics.lineBetween(0, 0, pointer.x, pointer.y);
        }, this);
    };
    return TestScene;
}(Phaser.Scene));
window.onload = function () {
    var game = new SimpleGame();
};
//# sourceMappingURL=app.js.map