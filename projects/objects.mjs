export class Ball {
	static RADIUS = 10;

	#x;
	#y;
	#vx;
	#vy;

	constructor(initX, initY, initVx, initVy) {
	  	this.#x = initX;
	  	this.#y = initY;
	  	this.#vx = initVx;
	  	this.#vy = initVy;
	}

	getX() {
		return this.#x;
	}

	getY() {
		return this.#y;
	}

	getVx() {
		return this.#vx;
	}

	getVy() {
		return this.#vy;
	}

	setVx(vx) {
		this.#vx = vx;
	}

	setVy(vy) {
		this.#vy = vy;
	}

	draw(ctxt) {
		ctxt.save();
		ctxt.beginPath();
		ctxt.arc(this.#x, this.#y, Ball.RADIUS, 0, Math.PI*2, true);
		ctxt.closePath();
		ctxt.fillStyle = "white";
		ctxt.shadowColor = "white";
		ctxt.shadowBlur = 25;
		ctxt.fill();
		ctxt.restore();
	}

	move() {
		this.#x += this.#vx;
		this.#y += this.#vy;
	}

	toJSON() {
		return {
			x: this.#x,
			y: this.#y,
			vx: this.#vx,
			vy: this.#vy
		};
	}
}

export class Button {
	#x;
	#y;
	#width;
	#height;
	#ctxt;

	constructor(ctxt, x, y, width, height) {
		this.#ctxt = ctxt;
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
	}

	isClicked(mouseX, mouseY) {
		return mouseX >= this.#x && 
			mouseX <= this.#x + this.#width &&
			mouseY >= this.#y &&
			mouseY <= this.#y + this.#height;
	}

	draw(text, font) {
		this.#ctxt.fillStyle = "black";
		this.#ctxt.shadowColor = "black";
		this.#ctxt.fillRect(this.#x, this.#y, this.#width, this.#height);
		this.#ctxt.strokeStyle = "white";
		this.#ctxt.strokeRect(this.#x, this.#y, this.#width, this.#height);
		this.#ctxt.font = font;
		this.#ctxt.fillStyle = "white";
		this.#ctxt.textAlign = "center";
		this.#ctxt.textBaseline = "middle";
		this.#ctxt.fillText(text, this.#x + this.#width/2, this.#y + this.#height/2);
	}
}

export class Paddle {
	static #VY = 9;

	#x;
	#y;
	#width;
	#height;
	#direction;
	#type;

	constructor(x, y, width, height, direction="", type) {
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		this.#type = type;
		this.#direction = direction;
	}

	getX() {
		return this.#x;
	}

	getY() {
		return this.#y;
	}

	setY(y) {
		this.#y = y;
	}

	getVy() {
		return Paddle.#VY;
	}

	getWidth() {
		return this.#width;
	}

	getHeight() {
		return this.#height;
	}

	getType() {
		return this.#type;
	}

	setDirection(direction) {
		this.#direction = direction;
	}

	registerKeys(upKey, downKey) {
		document.addEventListener("keydown", (e) => {
			if (e.key === upKey) {
				this.#direction = "up";
			} else if (e.key === downKey) {
				this.#direction = "down";
			}
		});

		document.addEventListener("keyup", (e) => {
			if (e.key === upKey || e.key === downKey) {
				this.#direction = "";
			}
		});
	}

	draw(ctxt) {
		ctxt.save();
		ctxt.fillStyle = "#e61e21";
		ctxt.shadowColor = "#ed3b3e";
		ctxt.shadowBlur = 25;
		ctxt.fillRect(this.#x, this.#y, this.#width, this.#height);
		ctxt.restore();
	}

	move(height) {
		if (this.#direction === "up" && this.#y >= Paddle.#VY) {
			this.#y -= Paddle.#VY;
		} else if (this.#direction === "down" && this.#y + this.#height <= height - Paddle.#VY) {
			this.#y += Paddle.#VY;
		}
	}

	toJSON() {
		return {
			x: this.#x,
			y: this.#y,
			width: this.#width,
			height: this.#height,
			direction: this.#direction,
			type: this.#type
		};
	}
}
