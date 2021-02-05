import DataBus from '../base/databus'
import {rgbToStr} from '../base/utils'
let databus = new DataBus()

export default class MovementTrack {
	constructor(options) {		
		this.canvas = options.canvas;
		this.ctx = this.canvas.getContext('2d');

		// const dpr = wx.getSystemInfoSync().pixelRatio
		// this.canvas.width = databus.screenWidth * dpr;
		// this.canvas.height = databus.screenHeight * dpr;
		// this.ctx.scale(dpr, dpr)

		this.canvas.width = databus.screenWidth;
		this.canvas.height = databus.screenHeight;

		this.pnts = [];

		this.bindLoop = (() => {
			this.drawBg();
			this.drawLine();
			
			this.canvas.requestAnimationFrame(this.bindLoop);
		}).bind(this);
		this.canvas.requestAnimationFrame(this.bindLoop);
	}

	drawBg() {
		this.ctx.beginPath();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle= 'rgb(245, 245, 245)';
		this.ctx.strokeStyle = 'rgb(255, 0, 0)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	clean() {
		this.pnts.length = 0;
		this.drawBg();
	}

	setStartingPoint(pnt) {
		// 单条线的起点
		this.pnts.push([...pnt, 0]);
	}

	update(pnt) {
		// 单条线上的转折点
		this.pnts.push([...pnt, 1]);
	}

	setTerminalPoint(pnt) {
		const end = this.pnts[this.pnts.length-1]
		if (end[2] == 0) {
			this.pnts.push([...pnt, 1]);
			return
		}
		[end[0], end[1]] = pnt;
	}

	drawLine() {
		this.ctx.beginPath();
		for (let i=0; i<this.pnts.length; i++) {
			if (this.pnts[i][2] == 0) {
				this.ctx.moveTo(this.pnts[i][0], this.pnts[i][1])
			} else {
				this.ctx.lineTo(this.pnts[i][0], this.pnts[i][1]);
			}
		}
		this.ctx.stroke();
	}
}
	