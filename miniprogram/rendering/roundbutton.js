
import { rgbToStr } from '../base/utils'

export default class Roundbutton {
	constructor(options) {
		options.canvas.width = 2 * options.radius;
		options.canvas.height = 2 * options.radius;
		this.ctx = options.canvas.getContext('2d');
		this.rgbs = options.rgbs;
		this.radius = options.radius;
		this.draw();
	}

	draw() {
		for (let i = this.rgbs.length - 1; i>=0; i--) {
			this.ctx.beginPath();
			this.ctx.arc(this.radius, this.radius, (i+1)*this.radius/this.rgbs.length, 0, 2*Math.PI, false);
			this.ctx.fillStyle= rgbToStr(this.rgbs[i]);
			this.ctx.closePath();
			this.ctx.fill();
		}
	}

	update() {
		this.draw();
	}
}