
import { rgbToStr } from '../base/utils'

export default class RoundButton {
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
		const step = this.radius/this.rgbs.length;
		for (let i = 0 ; i<this.rgbs.length; i++) {
			this.ctx.beginPath();
			this.ctx.arc(this.radius, this.radius, (this.rgbs.length-i) * step, 0, 2*Math.PI, false);
			this.ctx.fillStyle= rgbToStr(this.rgbs[i]);
			this.ctx.closePath();
			this.ctx.fill();
		}
	}

	update() {
		this.draw();
	}
}