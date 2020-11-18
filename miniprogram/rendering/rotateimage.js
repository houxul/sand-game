
import DataBus from '../base/databus'

let databus = new DataBus()

export default class RotateImage {
	constructor(options) {
		this.canvas = options.canvas;
		this.canvas.width = databus.screenHeight;
		this.canvas.height = databus.screenWidth;
		this.ctx = options.canvas.getContext('2d');
		this.img = this.ctx.createImageData(databus.screenHeight, databus.screenWidth);
	}

	draw(oriImg) {
		for (let i=0; i< this.img.data.length; i+=4) {
			const index = ((this.img.width - ((i/4)%this.img.width)-1) * oriImg.width)*4 + Math.floor((i/4)/this.img.width)*4
			this.img.data[i] = oriImg.data[index]
			this.img.data[i+1] = oriImg.data[index+1]
			this.img.data[i+2] = oriImg.data[index+2]
			this.img.data[i+3] = oriImg.data[index+3]
		}

		this.ctx.putImageData(this.img, 0, 0);
	}
}