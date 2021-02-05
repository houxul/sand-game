import {hslToRgb} from '../base/utils'
import DataBus from '../base/databus'

let databus = new DataBus()

export default class ColorBoard {
	constructor(options) {
		this.initCanvas(options.canvas);
		this.draw();
		this.toImage();
	}

	initCanvas(canvas) {
		canvas.width = databus.screenWidth;
		canvas.height = databus.screenHeight;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}

	draw() {
		this.img = this.ctx.createImageData(databus.screenWidth, databus.screenHeight);
		const imgData = this.img.data;
		const hslX = 360 / databus.screenWidth
		const hslY = 100 / databus.screenHeight
		for (let x=0; x< databus.screenWidth; x++) {
			for (let y = 0; y < databus.screenHeight; y++) {
				const rgb = hslToRgb(x*hslX, 100, 100 - y*hslY);

				const dataIndex = 4 * (y * databus.screenWidth	+ x)
				imgData[dataIndex] = rgb[0]
				imgData[dataIndex + 1] = rgb[1]
				imgData[dataIndex + 2] = rgb[2]
				imgData[dataIndex + 3] = 255
			}
		}

		this.ctx.putImageData(this.img, 0, 0);
	}

	toImage() {
		wx.canvasToTempFilePath({
			canvas: this.canvas,
			fileType: 'png',
			success(res) {
				const tempFilePath = res.tempFilePath;
				const fs = wx.getFileSystemManager()
				fs.saveFile({
					tempFilePath: tempFilePath,
					success(res) {
						const savedFilePath = res.savedFilePath;
						wx.setStorageSync('colorboard', savedFilePath);
					},
					fail(err) {
						console.error(err)
					}
				});
			},
			fail(err) {
				console.error(err)
			}
		}, this)
	}
}