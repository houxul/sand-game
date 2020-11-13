import DataBus from '../base/databus'
import {hslToRgb, strToAb, abToStr} from '../base/utils'
let databus = new DataBus()

export default class ColorPicker {
	constructor(ctx) {
		this.ctx = ctx
		this.btnAreaY = 100
		this.drawToCanvas(ctx);
	}

	drawToCanvas(ctx) {
		this.drawBackGround(ctx);
	}

	drawBackGround(ctx) {
		const img = ctx.createImageData(databus.windowWidth, databus.windowHeight - this.btnAreaY)
		const imgData = img.data;

		const bufferStr = wx.getStorageSync('colorpicker.background');
		if (bufferStr) {
			const buffer = strToAb(bufferStr)
			const dataArray = new Uint8ClampedArray(buffer)
			for (let i=0; i<dataArray.length; i++) {
				imgData[i]=dataArray[i]
			}
		} else {
			const hslX = 360 / databus.windowWidth
			const hslY = 100 / (databus.windowHeight - this.btnAreaY)
			for (let x=0; x< databus.windowWidth; x++) {
				for (let y = 0; y < (databus.windowHeight - this.btnAreaY); y++) {
					const rgb = hslToRgb(x*hslX, 100, y*hslY);
					this.setImgData(imgData, x, y, [...rgb, 255])
				}
			}
			wx.setStorageSync('colorpicker.background', abToStr(imgData.buffer));
		}
		ctx.putImageData(img, 0, this.btnAreaY);

		const grd = ctx.createLinearGradient(0, 0, 0, this.btnAreaY)
		grd.addColorStop(0, "rgb(255,255,255)")
		grd.addColorStop(1, "rgb(0,0,0)")
		ctx.fillStyle = grd
		ctx.fillRect(0, 0, databus.windowWidth, this.btnAreaY)
	}
	
	setImgData(imgData, x, y, rgba) {
		const dataIndex = 4 * (y * databus.windowWidth	+ x)
		imgData[dataIndex] = rgba[0]
		imgData[dataIndex + 1] = rgba[1]
		imgData[dataIndex + 2] = rgba[2]
		imgData[dataIndex + 3] = rgba[3]
	}
}
	