class Enemy {
    constructor(game) {
        this.game = game;
        this.x = this.game.width;
        this.speed = Math.random() * -1.5 - 0.5;
        this.markedForDeletion = false;
        this.lives = 5;
        this.score = this.lives;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 38;
    }
    update() {
        this.x+=this.speed - this.game.speed;
        if(this.x + this.width < 0) this.markedForDeletion = true;
        //animation
        this.frameX++;
        if (this.frameX>this.maxFrame)
            this.frameX = 0;
    }
    draw(context) {
        if (this.game.debug) {
            context.strokeStyle='#f00';
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.fillStyle='#000';
            context.font = '20px arial';
            context.fillText(this.lives, this.x, this.y);                
        }
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    }
}
export class Angler1 extends Enemy {
    constructor(game) {
        super(game);
        this.width = 228;
        this.height = 169;
        this.y = Math.random() * (this.game.height * 0.9 - this.height);
        this.image = document.querySelector('#angler1');
        this.frameY = Math.floor(Math.random() * 3);
        this.lives = 2;
        this.score = this.lives;
    }
}
export class Angler2 extends Enemy {
    constructor(game) {
        super(game);
        this.width = 213;
        this.height = 165;
        this.y = Math.random() * (this.game.height * 0.9 - this.height);
        this.image = document.querySelector('#angler2');
        this.frameY = Math.floor(Math.random() * 2);
        this.lives = 3;
        this.score = this.lives;
    }
}
export class LuckyFish extends Enemy {
    constructor(game) {
        super(game);
        this.width = 99;
        this.height = 95;
        this.y = Math.random() * (this.game.height * 0.9 - this.height);
        this.image = document.querySelector('#lucky');
        this.frameY = Math.floor(Math.random() * 2);
        this.lives = 3;
        this.score = 15;
        this.type = 'lucky';
    }
}