
import { rgbToStr } from '../base/utils'

export default class Roundbutton {
	constructor(options) {
		const canvas = options.canvas;
		this.ctx = canvas.getContext('2d');
		const dpr = wx.getSystemInfoSync().pixelRatio
		canvas.width = 2 * options.radius * dpr
		canvas.height = 2 * options.radius * dpr
		this.ctx.scale(dpr, dpr)

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