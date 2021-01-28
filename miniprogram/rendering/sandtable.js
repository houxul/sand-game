import DataBus from '../base/databus'
import Sand from '../base/sand'
import { tryRun, min, max } from '../base/utils'

let databus = new DataBus()

export default class SandTable {
	constructor(options) {
		this.canvas = options.canvas;
		this.canvas.width = databus.screenWidth
		this.canvas.height = databus.screenHeight
		this.ctx = options.canvas.getContext('2d');

		this.img = this.ctx.createImageData(databus.screenWidth, databus.screenHeight);
		this.imgData = this.img.data;
		this.extendImgData = new Map();
		this.sandPileSideline = new Array(this.img.height > this.img.width ? this.img.height : this.img.width);

		this.sands = []
		this.switchScreen(databus.horizontal);
		this.resetSandSourcePnt();

		this.bindLoop = (() => {
			this.frame+=1;
			this.genSand();
			this.update();
			this.draw();
		
			this.aniId = this.canvas.requestAnimationFrame(this.bindLoop);
		}).bind(this);

		this.requestAnimationFrame();
	}

	async reset() {
		const defaultValue = databus.horizontal ? this.img.width : this.img.height;
		this.sandPileSideline.fill(defaultValue);
		this.crossZeroSidelineNum = 0;
		this.frame = 0;
		for (let i=0; i< this.imgData.length; i+=4) {
			this.imgData[i] = databus.bgRgba[0];
			this.imgData[i+1] = databus.bgRgba[1];
			this.imgData[i+2] = databus.bgRgba[2];
			this.imgData[i+3] = databus.bgRgba[3];
		}
		this.extendImgData.clear();

		this.resetFlowIndex();
	}

	cancelAnimationFrame() {
		this.canvas.cancelAnimationFrame(this.aniId);
	}

	requestAnimationFrame() {
		this.aniId = this.canvas.requestAnimationFrame(this.bindLoop);
	}

	async updateBg() {
		if (databus.horizontal) {
			for (let i=0; i < this.img.height; i++) {
				for (let j=0; j< this.sandPileSideline[i]; j++) {
					this.setImgData(j, i, databus.bgRgba);
				}
			}
		} else {
			for (let i=0; i < this.img.width; i++) {
				for (let j=0; j< this.sandPileSideline[i]; j++) {
					this.setImgData(i, j, databus.bgRgba);
				}
			}
		}
	}

	// saveProgress() {
	//	 const imgDataBuffer = abToStr(this.imgData.buffer)
	//	 wx.setStorageSync('sandtable.sandPileSideline', this.sandPileSideline)
	//	 wx.setStorageSync('sandtable.imgDataBuffer', imgDataBuffer)
	// }

	// tryRecoveryProgress() {
	//	 const sandPileSideline = wx.getStorageSync('sandtable.sandPileSideline')
	//	 const imgDataBuffer = wx.getStorageSync('sandtable.imgDataBuffer')
	//	 if (sandPileSideline &&imgDataBuffer) {
	//		 this.sandPileSideline = sandPileSideline
	//		 const buffer = strToAb(imgDataBuffer)
	//		 const dataArray = new Uint8ClampedArray(buffer)
	//		 for (let i=0; i<dataArray.length; i++) {
	//			 this.imgData[i]=dataArray[i]
	//		 }
	//	 }
	// }

	minAdjacentSideline(x, y) {
		const step = 2
		const index = databus.horizontal ? y : x;
		const startIndex = max(index-step, 0);
		const endIndex = min(index+step, this.coordinateBoundary[0]-1);
		let minValIndex = index;
		for (let i=startIndex; i<=endIndex; i++) {
			const val = this.sandPileSideline[i] || -1
			if (val > this.sandPileSideline[minValIndex]) {
				minValIndex =i;
			}
		}
		return minValIndex;
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
			this.flowEndIndex = min(index+1, this.coordinateBoundary[0]);
		}
	}

	tryAddSandToSandPile(sand) {
		if (!this.isCrossSandPileSideline(sand.preX, sand.preY) && sand.preX >= 0 && sand.preY>=0) {
			this.setImgData(sand.preX, sand.preY, databus.bgRgba);
		}

		if (sand.crossBorder) {
			return true
		}

		const sandX = sand.curX;
		const sandY = sand.curY;
		if (this.isCrossSandPileSideline(sandX, sandY)) {
			let index = this.minAdjacentSideline(sandX, sandY);
			this.sandPileSideline[index]--;
			this.setPileSideImgData(index, sand.rgba);

			this.setFlowEndIndex(index);
			this.setFlowStartIndex(index);

			if (this.sandPileSideline[index] == 0) {
				this.crossZeroSidelineNum++
			}
			return true;
		}

		if (sandX>=0 && sandY>=0) {
			this.setImgData(sandX, sandY, sand.rgba);
		}
		return false;
	}

	setImgData(x, y, rgba) {
		if (x >= 0 && y >= 0) {
			const dataIndex = 4 * (y * this.img.width + x)
			this.imgData[dataIndex] = rgba[0]
			this.imgData[dataIndex + 1] = rgba[1]
			this.imgData[dataIndex + 2] = rgba[2]
			this.imgData[dataIndex + 3] = rgba[3]
			return
		}

		this.extendImgData.set(`${x}_${y}`, [rgba[0],rgba[1],rgba[2],rgba[3]]);
	}

	getImgData(x, y) {
		if (x >= 0 && y >= 0) {
			return {imgData: this.imgData, startIndex: 4 * (y * this.img.width + x)};
		}

		if (!this.extendImgData.has(`${x}_${y}`)) {
			this.extendImgData.set(`${x}_${y}`, [databus.bgRgba[0],databus.bgRgba[1],databus.bgRgba[2],databus.bgRgba[3]]);
		}
		return {imgData: this.extendImgData.get(`${x}_${y}`), startIndex: 0};
	}

	get fullSandPile() {
		return this.crossZeroSidelineNum === this.coordinateBoundary[0];
	}

	genSand() {
		if (!this.movePnts.length && !this.sandSourcePnt) {
			return
		}

		if (this.fullSandPile) {
			this.resetSandSourcePnt();
			tryRun(this.genSandEndCallback);
			return;
		}

		let sandSourcePnt = this.sandSourcePnt;
		if (this.movePnts.length) {
			sandSourcePnt = this.movePnts.shift();
		}
		let {x, y} = sandSourcePnt;
		const res = this.adjustGenSandPnt(x, y);
		const rgb = databus.sandFrameColor;
		for (let i=0; i<databus.genSandNum; i++) {
			const sand = databus.pool.getItemByClass('sand', Sand)
			sand.init(res[0], res[1], rgb, !res[2])
			this.sands.push(sand)
		}

		if (this.autoGenSand) {
			this.sandSourcePnt = databus.autoDownSandFramePnt;
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
		for (let i = this.sands.length-1; i >= 0; i--) {
			const item = this.sands[i]
			item.update()
			if (this.tryAddSandToSandPile(item)) {
				this.sands.splice(i, 1)
				databus.pool.recover('sand', item)
			}
		}

		if (this.flowStartIndex == null || this.flowEndIndex == null) {
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
			const fillIn = dir > 0 ? 0 : 1;
			for (let index=startIndex+dir; index!=endIndex+dir; index+=dir) {
				if (this.sandPileSideline[index-dir]-2 < this.sandPileSideline[index]) {
					continue;
				}
				for (let indexV=this.sandPileSideline[index-dir]-2; indexV>=this.sandPileSideline[index]; indexV--) {
					this.exchangeImgData(index, indexV, index-dir, indexV+1)
				}

				const distance = this.sandPileSideline[index-dir] - this.sandPileSideline[index] - 1;
				this.sandPileSideline[index] += distance;
				this.sandPileSideline[index-dir] -= distance;

				this.setFlowStartIndex(index-1 + fillIn);
				this.setFlowEndIndex(index+1 + fillIn);

				if (this.sandPileSideline[index] - distance <=0 && this.sandPileSideline[index] > 0) {
					this.crossZeroSidelineNum--
				}
				if (this.sandPileSideline[index-dir] <= 0 && this.sandPileSideline[index-dir] + distance > 0) {
					this.crossZeroSidelineNum++
				}
			}
		}
	}

	exchange(x1, y1, x2, y2) {
		const {imgData: imgData1, startIndex: startIndex1} = this.getImgData(x1, y1);
		const {imgData: imgData2, startIndex: startIndex2} = this.getImgData(x2, y2);
		for (let i=0; i<4; i++) {
			imgData2[startIndex2+i] = imgData1[startIndex1+i];
			imgData1[startIndex1+i] = databus.bgRgba[i];
		}
	}

	draw() {
		this.ctx.putImageData(this.img, 0, 0);
	}

	touchStartHandler(x, y) {
		if (this.autoGenSand) {
			this.autoGenSand = false;
		}
		this.sandSourcePnt = {x, y};
		tryRun(this.genSandStartCallback)
		return true
	}

	touchMoveHandler(x, y) {
		this.sandSourcePnt = {x, y};
		this.movePnts.push({x, y});
		return true
	}

	touchEndHandler(x, y) {
		this.sandSourcePnt = undefined;
		const lastTouchTime = this.lastTouchTime;
		this.lastTouchTime = new Date().getTime();
		if (databus.autoDownSand && (new Date().getTime() - lastTouchTime < 500)) {
			this.autoGenSand = true;
			this.sandSourcePnt = databus.autoDownSandFramePnt;
			return true
		}
 
		tryRun(this.genSandEndCallback)
		return true
	}

	/* touchDirection() {
		let [xDirection, yDirection] = [0, 0]
		let [xInvalidDirection, yInvalidDirection] = [false, false]
		for (let i=5; i<this.touchMovePnts.length; i+=5) {
			if (xInvalidDirection && yInvalidDirection) {
				return 0
			} 
			const {x,y} = this.touchMovePnts[i]
			const {x:preX, y:preY} = this.touchMovePnts[i-5]
			
			const xMove = (x-preX)
			if (!xInvalidDirection && xMove != 0) {
				if (xDirection == 0) {
					xDirection = xMove > 0 ? 1 : -1 
				} else if (xMove*xDirection < 0) {
					xInvalidDirection = true
				}
			}

			const yMove = (y-preY)
			if (!yInvalidDirection && yMove != 0) {
				if (yDirection == 0) {
					yDirection = yMove > 0 ? 1 : -1 
				} else if (yMove*yDirection < 0) {
					yInvalidDirection = true
				}
			}
		}

		if (!xInvalidDirection&&!yInvalidDirection) {
			if (this.touchMovePnts.length < 10) {
				return 0
			}
			xInvalidDirection = (this.touchMovePnts[this.touchMovePnts.length-1].x - this.touchMovePnts[0].x)*xDirection <
			(this.touchMovePnts[this.touchMovePnts.length-1].y - this.touchMovePnts[0].y)*yDirection
		}

		if (!xInvalidDirection) {
			return xDirection > 0 ? 2 : 4
		}
		return yDirection > 0 ? 3 : 1
	}*/

	resetSandSourcePnt() {
		this.movePnts = [];
		this.sandSourcePnt = undefined;
		this.autoGenSand = false;
	}

	switchScreen(horizontal) {
		this.isCrossSandPileSideline = this.isCrossSandPileSidelineBuilder(horizontal).bind(this);
		this.setPileSideImgData = this.setPileSideImgDataBuilder(horizontal).bind(this);
		this.coordinateBoundary = this.coordinateBoundaryBuilder(horizontal);
		this.exchangeImgData = this.exchangeImgDataBuilder(horizontal).bind(this);
		this.adjustGenSandPnt = this.adjustGenSandPntBuilder(horizontal).bind(this);

		this.reset();
	}

	isCrossSandPileSidelineBuilder(horizontal) {
		if (horizontal) {
			return function(x, y) {
				return this.sandPileSideline[y] <= x;
			}
		}
		return function(x, y) {
			return this.sandPileSideline[x] <= y;
		}
	}

	setPileSideImgDataBuilder(horizontal) {
		if (horizontal) {
			return function(index, rgba) {
				this.setImgData(this.sandPileSideline[index], index, rgba);
			}
		}

		return function(index, rgba) {
			this.setImgData(index, this.sandPileSideline[index], rgba);
		}
	}

	exchangeImgDataBuilder(horizontal) {
		if (horizontal) {
			return function(index1, indexVal1, index2, indexVal2) {
				this.exchange(indexVal1, index1, indexVal2, index2);
			}
		}

		return function(index1, indexVal1, index2, indexVal2) {
			this.exchange(index1, indexVal1, index2, indexVal2);
		}
	}

	coordinateBoundaryBuilder(horizontal) {
		if (horizontal) {
			return [this.img.height, this.img.width];
		}
		return [this.img.width, this.img.height];
	}

	adjustGenSandPntBuilder(horizontal) {
		if (horizontal) {
			return function(x, y) {
				x = Math.floor(y)
				y = Math.floor(y)
				const cross = this.sandPileSideline[y] - 30 < x;
				x = cross ? this.sandPileSideline[y] - 30 : x;
				return [x, y, cross];
			}
		}

		return function(x, y) {
			x = Math.floor(x)
			y = Math.floor(y)
			const cross = this.sandPileSideline[x] -30 < y;
			y = cross ? this.sandPileSideline[x] -30 : y;
			return [x, y, cross];
		}
	}
}