import { Ball, Paddle } from "./objects.mjs";

export class Game {
    static #DURATION = 1000/60;

    #width;
    #height;
    #mode; // game mode (single or multi)
    #sessionId; // multiplayer session id
    #score;
    #countdown; 
    #balls;
    #paddles;
    #started;
    #ended;
    #winner; // player that won in multiplayer (1 or 2)
    #paused;

    constructor(mode, sessionId=undefined, balls, paddles, width, height) {
        this.#width = width;
        this.#height = height;
        this.#mode = mode;
        this.#sessionId = sessionId;
        this.#score = 0;
        this.#balls = balls;
        this.#paddles = paddles;
        this.#started = false;
        this.#ended = false;
        this.#paused = false;
        this.#countdown = 3;
    }

    start() {
        if (this.#started) {
            return;
        }

        const intervalId = setTimeout(() => {
            this.#countdown--;
            if (this.#countdown > 0) {
                this.start();
            } else if (this.#countdown == 0) {
                this.#started = true;
                this.#loop();
            } else {
                clearTimeout(intervalId);
            }
        }, 1000);
    }

    getCountdown() {
        return this.#countdown;
    }

    getScore() {
        return this.#score;
    }

    getBalls() {
        return this.#balls;
    }

    getPaddles() {
        return this.#paddles;
    }

    getGameState() {
        const gameState = {
            "score": this.#score,
            "countdown": this.#countdown,
            "balls": this.#balls,
            "paddles": this.#paddles,
            "started": this.#started
        };

        if (this.#mode === "single") {
            gameState["paused"] = this.#paused;
        }

        if (this.#mode === "multi") {
            gameState["sessionId"] = this.#sessionId;
        }

        return gameState;
    }

    getWinner() {
        return this.#winner;
    }

    hasStarted() {
        return this.#started;
    }

    hasEnded() {
        return this.#ended;
    }

    isPaused() {
        return this.#paused;
    }

    pause() {
        if (this.#mode === "single") {
            this.#paused = true;
        }
    }

    unpause() {
        this.#paused = false;
        this.#loop();
    }

    movePaddle(side, direction) {
        if (side === "left") {
            this.#paddles[0].setDirection(direction);
        }

        if (side === "right") {
            this.#paddles[1].setDirection(direction);
        }
    }

    #loop() {
        const intervalId = setTimeout(() => {
            for (const ball of this.#balls) {
                this.#handleCollision(ball);
                ball.move();

                if (ball.getX() - Ball.RADIUS > this.#width) {
                    this.end(1); // Player 1 wins
                }
                if (ball.getX() < -Ball.RADIUS) {
                    this.end(2); // Player 2 wins
                }
            }

            for (const paddle of this.#paddles) {
                paddle.move(this.#height);
            }

            if (this.#started && !this.#paused) {
                this.#loop();
            } else {
                clearTimeout(intervalId);
            }
        }, Game.#DURATION);
    }

    end(whoWon) {
        this.#started = false;
        this.#paused = false;
        this.#ended = true;
        this.#winner = whoWon;
    }

    #handleCollision(ball) {
        const ballX = ball.getX();
        const ballY = ball.getY();
        let ballVx = ball.getVx();
        let ballVy = ball.getVy();

        for (const paddle of this.#paddles) {
            const padX = paddle.getX();
            const padY = paddle.getY();
            const padWidth = paddle.getWidth();
            const padHeight = paddle.getHeight();

            let hitSide;
            let hitTopOrBot;
            let score = this.#score;

            if (paddle.getType() === "left") {
                hitSide = ballY + ballVy > padY &&
                          ballY + ballVy <= padY + padHeight &&
                          ballX - Ball.RADIUS + ballVx <= padX + padWidth;
                hitTopOrBot = (ballX - Ball.RADIUS + ballVx <= padX + padWidth && ballY + Ball.RADIUS + ballVy >= padY && ballY <= padY) ||
                              (ballX - Ball.RADIUS + ballVx <= padX + padWidth && ballY - Ball.RADIUS + ballVy <= padY + padHeight && ballY >= padY + padHeight);
            } else {
                hitSide = ballY + ballVy > padY &&
                          ballY + ballVy <= padY + padHeight &&
                          ballX + Ball.RADIUS + ballVx >= padX;
                hitTopOrBot = (ballX + Ball.RADIUS + ballVx >= padX && ballY + Ball.RADIUS + ballVy >= padY && ballY <= padY) ||
                              (ballX + Ball.RADIUS + ballVx >= padX && ballY - Ball.RADIUS + ballVy <= padY + padHeight && ballY >= padY + padHeight);
            }

            if (hitSide) {
                const distMid = 2 * Math.abs(ballY - (padY + padHeight/2)) / padHeight;
                const velocity = Math.sqrt(ballVx**2 + ballVy**2);
                const angle = Math.atan(ballVy/ballVx);
                let newAngle;

                if (ballVx > 0 && ballVy >= 0) {
                    newAngle = angle + distMid * Math.PI/6;
                } else if (ballVx > 0 && ballVy < 0) {
                    newAngle = angle - distMid * Math.PI/6;
                } else if (ballVx < 0 && ballVy >= 0) {
                    newAngle = -angle + distMid * Math.PI/6;
                } else {
                    newAngle = -angle - distMid * Math.PI/6;
                }

                if (newAngle > Math.PI/4) { newAngle -= Math.PI/4; }
                if (newAngle < -Math.PI/4) { newAngle += Math.PI/4; }

                if (ballVx > 0) {
                    ball.setVx(-velocity * (1 - newAngle**2/2));
                } else {
                    ball.setVx(velocity * (1 - newAngle**2/2));
                }
                ball.setVy(velocity * newAngle * (1 - newAngle**2/6));

                ballVx = ball.getVx(); // new x velocity
                ballVy = ball.getVy(); // new y velocity
                score += 1;
                this.#score = score;

                if (score % 10 === 0 && score >= 10 && score <= 50) {
                    // Increase speed
                    ball.setVx(ballVx * 1.05);
                    ball.setVy(ballVy * 1.05);
                    ballVx = ball.getVx();
                    ballVy = ball.getVy();
                }
            } else if (hitTopOrBot) {
                ball.setVy(-ballVy);
                ballVy = ball.getVy();
            }
        } 

        if (ballY + ballVy > this.#height - Ball.RADIUS || ballY + ballVy < Ball.RADIUS) {
            ball.setVy(-ballVy);
        }
    }
}
