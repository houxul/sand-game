import DataBus from '../base/databus'
import {hslToRgb} from '../base/utils'
let databus = new DataBus()

export default class ColorPicker {
	constructor(options) {
		this.btnAreaY = 150
		this.initCanvasSize(options.canvas)
		this.drawToCanvas(options.canvas);
	}

	initCanvasSize(canvas) {
		canvas.width = databus.screenWidth
		canvas.height = databus.screenHeight
	}

	drawToCanvas(canvas) {
		this.drawBackGround(canvas);
	}

	drawBackGround(canvas) {
		const ctx = canvas.getContext('2d');
		this.ctx = ctx;
		
		const colorboardPath = wx.getStorageSync('colorboard');
		if (colorboardPath) {
			const img = canvas.createImage();
			img.onload = (res) => {
				ctx.drawImage(img, 0, 0, databus.screenWidth, databus.screenHeight,
					0, this.btnAreaY, databus.screenWidth, databus.screenHeight-this.btnAreaY);
			};
			img.src = colorboardPath;
		} else {       
			const img = ctx.createImageData(databus.screenWidth, databus.screenHeight - this.btnAreaY)
			const imgData = img.data;
			const hslX = 360 / databus.screenWidth
			const hslY = 100 / (databus.screenHeight - this.btnAreaY)
			for (let x=0; x < databus.screenWidth; x++) {
				for (let y = 0; y < (databus.screenHeight - this.btnAreaY); y++) {
					const rgb = hslToRgb(x*hslX, 100, 100 - y*hslY);
					this.setImgData(imgData, x, y, [...rgb, 255])
				}
			}
			ctx.putImageData(img, 0, this.btnAreaY);
		}

		const grd = ctx.createLinearGradient(0, 0, 0, this.btnAreaY)
		grd.addColorStop(1, "rgb(255,255,255)")
		grd.addColorStop(0, "rgb(0,0,0)")
		ctx.fillStyle = grd
		ctx.fillRect(0, 0, databus.screenWidth, this.btnAreaY)
	}
	
	setImgData(imgData, x, y, rgba) {
		const dataIndex = 4 * (y * databus.screenWidth	+ x)
		imgData[dataIndex] = rgba[0]
		imgData[dataIndex + 1] = rgba[1]
		imgData[dataIndex + 2] = rgba[2]
		imgData[dataIndex + 3] = rgba[3]
	}
}
	