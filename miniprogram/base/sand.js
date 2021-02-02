import DataBus from './databus'
import { rgbOverlay } from './utils'

let databus = new DataBus()

export default class Sand {
	init(x, y, rgb, down) {
		const overlayRgb = Math.floor( Math.random() * 256 );
		this.rgba = [Math.round(rgbOverlay(rgb[0], overlayRgb, 1, databus.overlayAlpha)),
		Math.round(rgbOverlay(rgb[1], overlayRgb, 1, databus.overlayAlpha)),
		Math.round(rgbOverlay(rgb[2], overlayRgb, 1, databus.overlayAlpha)), databus.rgbAlpha]

		this.x = x;
		this.y = y;
		this.preX = this.curX;
		this.preY = this.curY;
		if (databus.horizontal) {
			this.vy = (Math.random() - 0.5) * databus.speedTthreshold;
			this.vx = (down ? 7 : -7) * Math.random();
			this.acceleration = 0.4
		} else {
			this.vx = (Math.random() - 0.5) * databus.speedTthreshold;
			this.vy = (down ? 7 : -7) * Math.random();
			this.acceleration = 0.5
		}

		this.crossBorder = false
	}

	get curX() {
		return Math.floor(this.x)
	}

	get curY() {
		return Math.floor(this.y)
	}

	update() {
		this.preX = this.curX;
		this.preY = this.curY;

		if (databus.horizontal) {
			this.vx = this.vx + this.acceleration
			this.x += this.vx;

			if (this.y + this.vy > databus.screenHeight - 1){
				this.y = databus.screenHeight - 1
				this.crossBorder = true
			} else if (this.y + this.vy < 0) {
				this.y = 0
				this.crossBorder = true
			} else {
				this.y += this.vy;
			}
		} else {
			this.vy = this.vy + this.acceleration
			this.y += this.vy;
	
			if ( this.x + this.vx > databus.screenWidth - 1){
				this.x = databus.screenWidth - 1
				this.crossBorder = true
			} else if (this.x + this.vx < 0) {
				this.x = 0
				this.crossBorder = true
			} else {
				this.x += this.vx;
			}
		}
	}
}