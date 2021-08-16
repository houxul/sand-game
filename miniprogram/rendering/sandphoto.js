
import DataBus from './../base/databus'
import { rgbOverlay } from '../base/utils'

let databus = new DataBus()

export default class SandPhoto {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');
		this.xStep = 12;
		this.yStep = 12;
	}

	abort() {
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
	}

	async exec(imgPath) {
		this.worker = wx.createWorker('workers/index.js', { useExperimentalWorker: true });
		this.worker.onMessage((function (res) {
			const {action, data} = res;
			switch (action) {
				case 'done':
					this.photoSand(data);
					this.abort();
					break;
				case 'progress':
					this.progress(data);
					break;
			}
		}).bind(this));

		const res = await this.getImageInfo(imgPath);
		this.setCanvasSize(res);
		this.img = await this.getOriginImage(this.canvas, imgPath);
		this.fillRgbs = this.genFillRgbs(this.img);
		const basePnts = this.fillRgbs.map((item) => item[1])

		this.worker.postMessage({
			action: 'photomatrix',
			data: {
				xStep: this.xStep,
				yStep: this.yStep,
				imgWidth: this.imgWidth,
				imgHeight: this.imgHeight,
				basePnts: basePnts,
			}
		})
	}

	getImageInfo(imgPath) {
		return new Promise((resolve, reject) => {
			wx.getImageInfo({
				src: imgPath,
				success(res) {
					resolve(res);
				},
				fail(err) {
					console.log(err)
					wx.showToast({title: '获取照片尺寸失败，请重试', icon: 'none'})
					reject(err);
				}
			});
		});
	}

	getOriginImage(canvas, imgPath) {
		return new Promise((resolve, reject) => {
			const img = canvas.createImage();
			img.onload = ((res) => {
				this.ctx.drawImage(img, 0, 0, this.imgWidth, this.imgHeight, 0, 0, this.imgWidth, this.imgHeight);
				resolve(this.ctx.getImageData(0, 0, this.imgWidth, this.imgHeight));
			}).bind(this);
			img.onerror = (res) => {
				wx.showToast({title:'加载图片失败，请重试', icon: 'none'})
				reject(res);
			}
			img.src = imgPath;
		});
	}

	setCanvasSize(res) {
		this.imgWidth = Math.floor(res.width/this.xStep)*this.xStep;
		this.imgHeight = Math.floor(res.height/this.yStep)*this.yStep;
		this.canvas.width = this.imgWidth;
		this.canvas.height = this.imgHeight;
	}

	genFillRgbs(src) {
		const fillRgbs = new Array();
		for (let y=this.imgHeight-this.yStep; y>= 0; y-=this.yStep) {
			for (let x=0; x<=this.imgWidth-this.xStep; x+=this.xStep) {
				const rgba = this.getImageData(src, x + Math.floor(Math.random()*this.xStep), y + Math.floor(Math.random()*this.yStep))
				fillRgbs.push([rgba, x, y+Math.random()]);
			}
		}

		fillRgbs.sort(function(m, n) {
			return n[2] - m[2];
		});

		return fillRgbs;
	}

	photoSand(imgMatrix) {
		this.ctx.clearRect(0, 0, this.imgWidth, this.imgHeight);

		// this.img = this.ctx.createImageData(this.imgWidth, this.imgHeight);
		for (let y = 0; y < this.imgHeight; y++) {
			const baseIndex = y * this.imgWidth;
			for (let x = 0; x < this.imgWidth; x++) {
				const fillRgbIndex = imgMatrix[x][y];
				if (fillRgbIndex < 0) {
					continue;
				}
				const dataIndex = 4 * (baseIndex  + x);
				const rgb = this.fillRgbs[fillRgbIndex][0];
				const overlayRgb = Math.floor(Math.random() * 256);
				const rgba = [Math.round(rgbOverlay(rgb[0], overlayRgb, 1, databus.overlayAlpha)),
				Math.round(rgbOverlay(rgb[1], overlayRgb, 1, databus.overlayAlpha)),
				Math.round(rgbOverlay(rgb[2], overlayRgb, 1, databus.overlayAlpha)), databus.rgbAlpha]

				this.img.data[dataIndex] = rgba[0]
				this.img.data[dataIndex + 1] = rgba[1]
				this.img.data[dataIndex + 2] = rgba[2]
				this.img.data[dataIndex + 3] = rgba[3]
			}

			this.progress(90 + (y/this.imgHeight)*8);
		}

		this.ctx.putImageData(this.img, 0, 0);
		this.progress(99);

		wx.canvasToTempFilePath({
			canvas: this.canvas,
			fileType: 'jpg',
			quality: 1,
			success: ((res) => {
				this.done({filePath: res.tempFilePath, imgWidth: this.imgWidth, imgHeight: this.imgHeight});
			}).bind(this),
			fail: ((err) => {
				this.done({err: err});
			}).bind(this),
		}, this);
		this.progress(100);
	}

	getImageData(img, x, y) {
		const dataIndex = 4 * (y * img.width  + x)
		return [img.data[dataIndex], img.data[dataIndex+1], img.data[dataIndex+2],img.data[dataIndex+3]]
	}
}