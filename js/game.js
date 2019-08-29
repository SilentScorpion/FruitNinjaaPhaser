var game;
var fruits = [];
var pointer, dX, dY;
var gameStarted;
var score;
var spawnFruitsTimer;
var fruitsGroup;
var timeSinceLastIncrement = 0;


class FruitNinjaMain extends Phaser.Scene {

    constructor() {
        super('FruitNinjaMain');
    }

    preload() {
        this.load.image('background', 'assets/background.jpg');
        this.load.image('fruit0', 'assets/apple.png');
        this.load.image('fruit1', 'assets/banana.png');
        this.load.image('fruit2', 'assets/cherry.png');
        this.load.image('fruit3', 'assets/grapes.png');
        this.load.image('fruit4', 'assets/kiwi.png');
        this.load.image('fruit5', 'assets/melon.png');
        this.load.image('fruit6', 'assets/orange.png');
        this.load.image('fruit7', 'assets/pear.png');
        this.load.image('fruit8', 'assets/plum.png');
        this.load.image('fruit9', 'assets/strawberry.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('start', 'assets/start.png');
        this.load.image('trail', 'assets/trail.png');
    }

    create() {
        this.addGraphics();
        
        // this.trail = this.add.particles('trail').createEmitter({
        //     x: 400,
        //     y: 300,
        //     speed: { min: 100, max: 200 },
        //     angle: { min: -85, max: -95 },
        //     scale: { start: 0.25, end: 0.25, ease: 'Back.easeOut' },
        //     alpha: { start: 1, end: 0, ease: 'Quart.easeOut' },
        //     blendMode: 'ADD',
        //     quantity: 10,
        //     lifespan: 3000
        // });
        // this.trail.reserve(1000);
        // this.input.on('pointermove', function (pointer) {
        //     this.trail.setPosition(pointer.x, pointer.y);
        // },this);

      
    }

    addGraphics() {
        this.add.image(game.config.width / 2, game.config.height / 2, 'background');
        for (let i = 0; i < 11; i++) {
            let fruit = this.physics.add.sprite(game.config.width / 2, game.config.height + 100, 'fruit' + i);
            fruit.setActive(false);
            fruits.push(fruit);
        }
        this.startButton = this.add.image(game.config.width / 2, game.config.height / 2, 'start')
            .setScale(2, 2)
            .setInteractive().on('pointerdown', function () {
                this.startGame();
            }, this);
    }

    startGame() {
        gameStarted = true;
        this.startButton.setVisible(false);
        score = 0;
        this.score = this.add.text(game.config.width/2,game.config.height/10,'0',{"fontSize": "125px"}).setOrigin(.5,.5);

       
        this.spawner();
        this.input.on('gameobjectover', function (pointer,gameobject) {
           if(gameobject.name == 'fruit'){
                score++;
                this.score.text = score;
               gameobject.destroy();
           }
            else if(gameobject.name == 'bomb')
                this.playerDeath();
        },this);
        console.log('Game Started');
    }


    spawner() {
        this.spawnBunch();
        spawnFruitsTimer = this.time.addEvent({
            delay: 2000,
            callback : () => {
                //Spawn point 1 : center of the screen, from the bottom
                //Just add upward velocity to the fruit
                this.spawnBunch();
            },
            loop: true,
            startAt:0,
            timeScale : 1,
        });

        this.bombTimer = this.time.addEvent({
            delay: 6000,
            callback : () => {
              this.spawnBomb();
            },
            loop: true,
            startAt:0,
            timeScale : 1,
        });
    }


    spawnBunch() {
        let spawnBunchNo = Phaser.Math.Between(1, 3);
        let point1X = Phaser.Math.Between(100, game.config.width - 100);
        let point1Y = game.config.height + 50;
        for (let i = 0; i < spawnBunchNo; i++) {
            this.spawnFruit(point1X, point1Y, 0, 2200);
        }
        //Spawn point 2 : Left side of the screen, 
        //Just side velocity to the fruit, velocity to the right
        let spawnBunchNo1 = Phaser.Math.Between(1, 3);
        let point2X = -100;
        let point2Y = Phaser.Math.Between(game.config.height * 2 / 3, game.config.height);
        for (let i = 0; i < spawnBunchNo1; i++) {
            this.spawnFruit(point2X, point2Y, -1000, 1500);
        }
        //Spawn point 2 : Right of the screen, 
        //Just left side velocity to the fruit, 
        let spawnBunchNo2 = Phaser.Math.Between(1, 3);
        let point3X = game.config.width + 100;
        let point3Y = Phaser.Math.Between(game.config.height * 2 / 3, game.config.height);
        for (let i = 0; i < spawnBunchNo2; i++) {
            this.spawnFruit(point3X, point3Y, 1000, 1500);
        }
        this.physics.world.gravity.y = Phaser.Math.Between(2000, 2500.0);
    }


    //Spawns a particular fruit giving it an random upward velocity and making it collidable
    //Add it to the bunch of fruits 
    spawnFruit(x,y,velX,velY) {
        let random = Phaser.Math.Between(0, 9);
        let spawnPointX = x;
        let spawnPointY = y;
        let fruit = this.physics.add.sprite(spawnPointX, spawnPointY, 'fruit' + random).setInteractive();
        fruit.name = 'fruit';
        fruit.setScale(Phaser.Math.Between(2.0, 3.0));
        fruit.body.setVelocityX(Phaser.Math.Between(-velX + 500, -velX - 500));
        fruit.body.setVelocityY(Phaser.Math.Between(-velY + 500, -velY - 500));
    }

    spawnBomb() {
        let spawnPointX = Phaser.Math.Between(100.0, game.config.width - 100);
        let spawnPointY = game.config.height + 50;
        let bomb = this.physics.add.sprite(spawnPointX, spawnPointY, 'bomb').setInteractive();
        bomb.name = 'bomb';
        bomb.setScale(Phaser.Math.Between(2.0, 3.0));
        bomb.body.setVelocityY(Phaser.Math.Between(-2000, -3000));
    }

    playerDeath() {
        gameStarted = false;

        spawnFruitsTimer.remove();
        this.bombTimer.remove();
        this.physics.world.gravity.y = this.physics.world.gravity.x = 0;


        this.cameras.main.shake(1000);

        this.add.text(game.config.width/2, game.config.height/2,'Game Over',{"fontSize" : "150px"})
        .setOrigin(.5,.5);

        this.add.text(game.config.width/2, game.config.height/2 + 200,'Restart',{"fontSize" : "100px"})
        .setOrigin(.5,.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start(this);    
        });


        //spawnFruitsTimer.
    }

    hitFruit() {
        console.log('increase points since you have successfully cut fruits here');
    }
}


var config = {
    type: Phaser.AUTO,
    backgroundColor: 0xffffff,
    scene: [FruitNinjaMain],
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        parent: 'fruitninjaparent',
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 3000,
            },
            debug: false,
        }
    }

}

game = new Phaser.Game(config);