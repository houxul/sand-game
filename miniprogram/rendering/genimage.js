import DataBus from '../base/databus'
import { coverRgb, coverAlpha } from '../base/utils'

let databus = new DataBus()

export default class GenImage {
	constructor(options) {
		this.canvas = options.canvas;
		this.imgAlpha = coverAlpha(1, databus.overlayAlpha) * 255
		this.reset();
	}

	reset() {
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
		this.ctx = this.canvas.getContext('2d');
		this.img = this.ctx.createImageData(imageWidth, imageHeight);
	}
	
	async update(x, y, rgb) {
		if (databus.horizontal) {
			const tmp = x;
			x = databus.screenHeight - y;
			y = tmp;
		}
		this.setPixelRgba(x, y, rgb, databus.imageQuality);
	}

	exec() {
		this.ctx.putImageData(this.img, 0, 0);
	}

	updateBg(sideline) {
		if (databus.horizontal) {
			for (let i=0; i < databus.screenHeight; i++) {
				for (let j=0; j< sideline[i]; j++) {
					this.setPixelRgba(databus.screenHeight - i, j, databus.bgRgba, databus.imageQuality);
				}
			}
		} else {
			for (let i=0; i < databus.screenWidth; i++) {
				for (let j=0; j< sideline[i]; j++) {
					this.setPixelRgba(i, j, databus.bgRgba, databus.imageQuality);
				}
			}
		}
	}

	setPixelRgba(x, y, rgb, pixelNum) {
		x = x * pixelNum;
		y = y * pixelNum;
		for (let i=x; i<x+pixelNum; i++) {
			for (let j=y; j<y+pixelNum; j++) {
				const overlayRgb = Math.floor( Math.random() * 256 );
				const newRgba = [coverRgb(rgb[0], overlayRgb, 1, databus.overlayAlpha),
				coverRgb(rgb[1], overlayRgb, 1, databus.overlayAlpha),
				coverRgb(rgb[2], overlayRgb, 1, databus.overlayAlpha), this.imgAlpha]
				this.setImgData(this.img, i, j, newRgba);
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