class SimpleGame {

    game: Phaser.Game;
    constructor() {
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
}

class TestScene extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;

    preload() {
        //this.load.image('logo', 'Assets/ppp.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        //var logo = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'logo');

        this.input.mouse.disableContextMenu();
        this.input.on('pointerdown', function (pointer) {
            var moveDirection = new Phaser.Math.Vector2(pointer.x, pointer.y);
            moveDirection.normalize();
            var desiredRotation = Math.atan2(moveDirection.y, moveDirection.x);

            this.graphics.lineStyle(10, 0x99ff00)
            this.graphics.lineBetween(0, 0, pointer.x, pointer.y);
        }, this);
    }
}

window.onload = () => {
    var game = new SimpleGame();
};