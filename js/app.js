import InputHandler from './Input.js';
import Projectile from './Projectile.js';
import Background from './Background.js';
import {Angler1, Angler2, LuckyFish} from './Enemy.js';

window.addEventListener('load', () => {
    const canvas = document.querySelector('#canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 1500;
    canvas.height = 500;

    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.querySelector('#gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * - 15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 100 + 60;
        }
        update() {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX;
            this.y += this.speedY;
            if(this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
            if(this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2) {
                this.bounced++;
                this.speedY *= -0.5;
            } 
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, 0, 0, this.size, this.size);

            context.restore();
        }
    }
    class Player {
        constructor(game) {
            this.game = game;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.width = 120;
            this.height = 190;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.projectiles = [];
            this.image = document.querySelector('#player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;

        }
        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;
            // Limites verticales
            if(this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if(this.y < 0 - this.height * 0.5) this.y = 0 - this.height * 0.5; 
            //Animation
            this.frameX++;
            if (this.frameX>this.maxFrame) {
                this.frameX = 0;
            }
            // Projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // Power Up
            if(this.powerUp){
                if(this.powerUpTimer>this.powerUpLimit) {
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.frameY = 0;
                }
                else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }
        draw(context) {
            if(this.game.debug) {
                context.strokeStyle='#0f0';
                context.strokeRect(this.x, this.y, this.width, this.height);
            }
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });            
            context.drawImage(this.image, this.frameX * this.width, this.frameY*this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 95, this.y + 30));
                this.game.ammo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 95, this.y + 175));
            }
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }
    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 30;
            this.fontFamily = 'Bangers';
            this.color = '#fff';
        }
        draw(context) {
            //score
            context.save();
            context.font = this.fontSize+ 'px ' + this.fontFamily;
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = '#000';
            context.fillText('Score: ' + this.game.score, this.game.width / 2, 30);
            //timer
            const formatedTimer = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formatedTimer, this.game.width - this.game.width / 4, 30);
            //Game over Messages
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score >= this.game.winnigScore) {
                    message1 = 'Vous avez gagné';
                    message2 = 'BRAVO !';
                }
                else {
                    message1 = 'Vous avez perdu';
                    message2 = 'Rejouez ...';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillStyle = this.color;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.shadowColor = '#000';
                context.fillText(message1, this.game.width/2, this.game.height / 2 - 25);
                context.fillText(message2, this.game.width/2, this.game.height / 2 + 25);
            }
            //ammo
            if(this.game.player.powerUp) context.fillStyle = "#99F";
            for(let i=0; i<this.game.ammo; i++) {
                context.fillRect(20+(5*i), 10, 3, 20);
            }
            context.restore();
        }
    }
    class Game {
        constructor(width, height) {
            this.debug = false;
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winnigScore = 25;
            this.gameTime = 0;
            this.gameTimeLimit = 25000;
            this.speed = 1;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.gameTimeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval && this.ammo <= this.maxAmmo) {
                this.ammoTimer = 0;
                this.ammo++;
            }
            else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle => {
                particle.update();
            });
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    for (let i=0; i<10; i++) {
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                    }
                    if (enemy.type === "lucky") {
                        this.player.enterPowerUp();
                    } else {
                        this.score--;
                    }
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        // enemy.markedForDeletion = true;
                        projectile.markedForDeletion = true;
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        if (enemy.lives <= 0) {
                            enemy.markedForDeletion = true;
                            for (let i=0; i<10; i++) {
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                            }
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winnigScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                });
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer = 0
            }
            else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle => {
                particle.draw(context);
            });            
            this.background.layer4.draw(context);
            this.ui.draw(context);
        }
        addEnemy() {
            const randomize = Math.random();
            if (randomize < 0.3) this.enemies.push(new Angler1(this));
            else if (randomize < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new LuckyFish(this));
            // console.log(randomize);
        }
        checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});