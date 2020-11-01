
import { rgbToStr } from '../base/utils'

export default class Roundbutton {
	constructor(options) {
		this.rgbs = options.rgbs
		this.radius = options.radius
		this.centre = options.centre
	}

	drawToCanvas(ctx) {
		for (let i = this.rgbs.length - 1; i>=0; i--) {
			ctx.beginPath();
			ctx.arc(this.centre.x, this.centre.y, (i+1)*this.radius/this.rgbs.length, 0, 2*Math.PI, false);
			ctx.fillStyle= rgbToStr(this.rgbs[i]);
			ctx.closePath();
			ctx.fill();
		}
	}

	updateCentre(centre) {
		this.centre = centre
	}
}