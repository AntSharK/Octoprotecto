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


    preload() {
        this.load.image('logo', 'Assets/ppp.png');
    }

    create() {
        var logo = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'logo');
    }
}

window.onload = () => {
    var game = new SimpleGame();
};