
import DataBus from '../base/databus'
import {min, max, rgbOverlay} from '../base/utils'

let databus = new DataBus()

export default class SandPhoto {
	async exec(options) {
		this.canvas = options.canvas;
		this.imgPath = options.imgPath;
		this.xStep = 12;
		this.yStep = 12;
		this.frame = 0;

		const res = await this.getImageInfo(this.imgPath);
		this.initCanvas(res);

		this.img = await this.getOriginImage(this.canvas, this.imgPath);
		this.fillRgbs = this.genFillRgbs(this.img);
		this.photoSand();
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

	initCanvas(res) {
		this.imgWidth = Math.floor(res.width/this.xStep)*this.xStep;
		this.imgHeight = Math.floor(res.height/this.yStep)*this.yStep;
		this.canvas.width = this.imgWidth;
		this.canvas.height = this.imgHeight;
		this.ctx = this.canvas.getContext('2d');
		this.sandPileSideline = new Array(this.imgWidth).fill(this.imgHeight);
	}

	genFillRgbs(src) {
		const fillRgbs = new Array();
		for (let y=this.imgHeight-this.yStep; y>= 0; y-=this.yStep) {
			for (let x=0; x<=this.imgWidth-this.xStep; x+=this.xStep) {
				const rgba = this.getImageData(src, x + Math.floor(Math.random()*this.xStep), max(y, 0)+Math.floor(Math.random()*this.yStep))
				fillRgbs.push([rgba, x, y/this.yStep+Math.random()]);
			}
		}

		fillRgbs.sort(function(m, n) {
			return n[2] - m[2];
		});

		return fillRgbs;
	}

	photoSand() {
		this.ctx.clearRect(0, 0, this.imgWidth, this.imgHeight);

		const step = Math.floor(this.fillRgbs.length/100);
		for (let i=0; i<this.fillRgbs.length; i++) {
			this.genSand(i);
			this.update();
			if (i%step == 0) {
				this.progress(i/step);
			}
		}
		this.draw();

		wx.canvasToTempFilePath({
			canvas: this.canvas,
			success: ((res) => {
				this.done({filePath: res.tempFilePath});
			}).bind(this),
			fail: ((err) => {
				this.done({err: err});
			}).bind(this),
		}, this);
	}

	setImgData(img, x, y, rgba) {
		const dataIndex = 4 * (y * img.width  + x)
		img.data[dataIndex] = rgba[0]
		img.data[dataIndex + 1] = rgba[1]
		img.data[dataIndex + 2] = rgba[2]
		img.data[dataIndex + 3] = rgba[3]
	}

	getImageData(img, x, y) {
		const dataIndex = 4 * (y * img.width  + x)
		return [img.data[dataIndex], img.data[dataIndex+1], img.data[dataIndex+2],img.data[dataIndex+3]]
	}

	resetFlowIndex() {
		this.flowStartIndex = null;
		this.flowEndIndex = null;
	}

	setFlowStartIndex(index) {
		if (this.flowStartIndex == null || this.flowStartIndex > index-1) {
			this.flowStartIndex = max(index-1, 0);
		}
	}

	setFlowEndIndex(index) {
		if (this.flowEndIndex == null || this.flowEndIndex < index+1) {
			this.flowEndIndex = min(index+1, this.imgWidth);
		}
	}

	genSand(frame) {
		const [rgb, baseX] = this.fillRgbs[frame];
		for (let i=0; i<this.xStep*this.yStep; i++) {
			let x = Math.round(baseX + Math.random() * this.xStep+ Math.random() * 30 - 15);
			x = max(min(x, this.imgWidth-1), 0);

			const overlayRgb = Math.round(Math.random() * 255);
			const rgba = [rgbOverlay(rgb[0], overlayRgb, 1, databus.overlayAlpha),
			rgbOverlay(rgb[1], overlayRgb, 1, databus.overlayAlpha),
			rgbOverlay(rgb[2], overlayRgb, 1, databus.overlayAlpha), databus.rgbAlpha]

			this.sandPileSideline[x]--;
			this.setImgData(this.img, x, this.sandPileSideline[x], rgba);
			this.setFlowEndIndex(x);
			this.setFlowStartIndex(x);
		}
	}

	getPole(nums, start, end, threshold) {
		if (start >= end) {
			return []
		}
		let minIndex = start;
		for (let i=start+1; i<end; i++) {
			if (nums[i] > nums[minIndex]) {
				minIndex = i;
			}
		}

		let leftPoleIndex = minIndex;
		let leftPoleVal = -9999;
		for (let i=minIndex-1; i>=start; i--) {
			const tmp = (nums[minIndex]-nums[i])*threshold - (minIndex-i)
			if (tmp > leftPoleVal) {
				leftPoleIndex = i;
				leftPoleVal = tmp
			}
		}
		if (leftPoleIndex-start < 2) {
			leftPoleIndex = start;
		}

		let rightPoleIndex = minIndex;
		let rightPoleVal = -9999;
		for (let i=minIndex+1; i<end; i++) {
			const tmp = (nums[minIndex]-nums[i])*threshold - (i - minIndex)
			if (tmp > rightPoleVal) {
				rightPoleIndex = i;
				rightPoleVal = tmp
			}
		}
		if (end - rightPoleIndex -1 < 2) {
			rightPoleIndex = end-1
		}

		const poles = new Array();
		if (leftPoleIndex != minIndex) {
			poles.push([minIndex, leftPoleIndex, -1])
		}
		if (minIndex != rightPoleIndex) {
			poles.push([minIndex, rightPoleIndex, 1])
		}

		if (leftPoleIndex != start && leftPoleIndex != minIndex) {
			poles.push(...this.getPole(nums, start, leftPoleIndex+1, threshold))
		}

		if (rightPoleIndex != end-1 && rightPoleIndex != minIndex) {
			poles.push(...this.getPole(nums, rightPoleIndex, end, threshold))
		}

		return poles;
	}

	update() {
		if (this.flowEndIndex == null || this.flowEndIndex == null) {
			return;
		}

		const poles = this.getPole(this.sandPileSideline, this.flowStartIndex, this.flowEndIndex, 5);
		this.resetFlowIndex();
		poles.sort((function(m, n) {
			if (this.sandPileSideline[n[0]] == this.sandPileSideline[m[0]]) {
				return this.sandPileSideline[m[1]] - this.sandPileSideline[n[1]];
			}
			return this.sandPileSideline[n[0]] - this.sandPileSideline[m[0]];
		}).bind(this))
		if (poles.length == 0) {
			return;
		}

		for (const item of poles) {
			const [startIndex, endIndex, dir] = item;
			for (let index=startIndex+dir; index!=endIndex+dir; index+=dir) {
				if (this.sandPileSideline[index-dir]-2 < this.sandPileSideline[index]) {
					continue;
				}
				for (let indexV=this.sandPileSideline[index-dir]-2; indexV>=this.sandPileSideline[index] && indexV >=0; indexV--) {
					this.setImgData(this.img, index, indexV, this.getImageData(this.img, index-dir, indexV+1))
				}

				const distance = this.sandPileSideline[index-dir] - this.sandPileSideline[index] - 1;
				this.sandPileSideline[index] += distance;
				this.sandPileSideline[index-dir] -= distance;
			}

			this.setFlowStartIndex(startIndex-dir);
			this.setFlowEndIndex(startIndex-dir);

			this.setFlowStartIndex(endIndex+dir);
			this.setFlowEndIndex(endIndex+dir);
		}
	}

	draw() {
		this.ctx.putImageData(this.img, 0, 0);
	}
}