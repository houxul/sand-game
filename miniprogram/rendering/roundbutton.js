
import { rgbToStr, similarColor } from '../base/utils'

const shadow = 1;

export default class RoundButton {
	constructor(options) {
		const canvas = options.canvas;
		this.ctx = canvas.getContext('2d');
		const dpr = wx.getSystemInfoSync().pixelRatio
		canvas.width = 2 * (options.radius + shadow) * dpr
		canvas.height = 2 * (options.radius + shadow) * dpr
		this.ctx.scale(dpr, dpr)

		this.rgbs = options.rgbs;
		this.radius = options.radius;
		this.draw();
	}

	draw() {
		this.ctx.shadowOffsetX = shadow;
		this.ctx.shadowOffsetY = shadow;
		this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
		this.ctx.shadowBlur = shadow;
		if (similarColor(this.rgbs[0], [0, 0, 0])) {
			this.ctx.shadowColor = 'rgba(255,255,255,0.5)';
		}

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