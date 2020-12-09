
import DataBus from '../base/databus'

let databus = new DataBus()

export default class GenImage {
	constructor(options) {
		this.canvas = options.canvas;
	}

	exec(oriImg) {
		let imageWidth = databus.screenWidth;
		let imageHeight = databus.screenHeight;
		if (databus.horizontal) {
			imageWidth = databus.screenHeight;
			imageHeight = databus.screenWidth;
		}

		imageWidth = imageWidth * databus.imageQuality;
		imageHeight = imageHeight * databus.imageQuality;

		this.canvas.width = imageWidth;
		this.canvas.height = imageHeight;
		const ctx = this.canvas.getContext('2d');
		const img = ctx.createImageData(imageWidth, imageHeight);

		if (databus.horizontal) {
			for (let i=0; i< oriImg.data.length; i+=4) {
				const index = ((oriImg.height - ((i/4)%oriImg.height)-1) * oriImg.width)*4 + Math.floor((i/4)/oriImg.height)*4
				this.setPixelImgData(img, (i/4) % oriImg.height, Math.floor((i/4)/oriImg.height), oriImg.data.slice(index, index+4), databus.imageQuality)
			}
		} else {
			for (let x=0; x<oriImg.width; x++) {
				for (let y=0; y<oriImg.height; y++) {
					const index = 4 * (y * oriImg.width + x);
					this.setPixelImgData(img, x, y, oriImg.data.slice(index, index+4), databus.imageQuality)
				}
			}
		}

		ctx.putImageData(img, 0, 0);
	}

	setPixelImgData(img, x, y, rgba, pixelNum) {
		x = x * pixelNum;
		y = y * pixelNum;
		for (let i=x; i<x+pixelNum; i++) {
			for (let j=y; j<y+pixelNum; j++) {
				this.setImgData(img, i, j, rgba);
			}
		}
	}

	setImgData(img, x, y, rgba) {
		const dataIndex = 4 * (y * img.width + x)
		img.data[dataIndex] = rgba[0]
		img.data[dataIndex + 1] = rgba[1]
		img.data[dataIndex + 2] = rgba[2]
		img.data[dataIndex + 3] = rgba[3]
	}
}