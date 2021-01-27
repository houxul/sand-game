import {min, max} from './utils'

export class PhotoMatrix {
	constructor(data) {
		Object.assign(this, data);

		this.exec();
	}

	exec() {
		this.sideline = new Array(this.imgWidth).fill(this.imgHeight);

		this.imgMatrix = new Array(this.imgWidth);
		for (let i=0; i< this.imgWidth; i++) {
			this.imgMatrix[i] = new Array(this.imgHeight).fill(-1);
		}

		const step = Math.floor(this.basePnts.length/90);
		for (let i=0; i<this.basePnts.length; i++) {
			this.down(i);
			this.flow();
			if (i%step == 0) {
				worker.postMessage({
					action: 'progress',
					data: i/step
				});
			}
		}

		worker.postMessage({
			action: 'done',
			data: this.imgMatrix,
		});
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

	down(frame) {
		const baseX = this.basePnts[frame];
		for (let i=0; i<this.xStep*this.yStep; i++) {
			let x = Math.round(baseX + Math.random() * this.xStep+ Math.random() * 30 - 15);
			x = max(min(x, this.imgWidth-1), 0);

			this.sideline[x]--;
			this.imgMatrix[x][this.sideline[x]] = frame;
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

	flow() {
		if (this.flowEndIndex == null || this.flowEndIndex == null) {
			return;
		}

		const poles = this.getPole(this.sideline, this.flowStartIndex, this.flowEndIndex, 5);
		this.resetFlowIndex();
		poles.sort((function(m, n) {
			if (this.sideline[n[0]] == this.sideline[m[0]]) {
				return this.sideline[m[1]] - this.sideline[n[1]];
			}
			return this.sideline[n[0]] - this.sideline[m[0]];
		}).bind(this))
		if (poles.length == 0) {
			return;
		}

		for (const item of poles) {
			const [startIndex, endIndex, dir] = item;
			const fillIn = dir > 0 ? 0 : 1;
			for (let index=startIndex+dir; index!=endIndex+dir; index+=dir) {
				if (this.sideline[index-dir]-2 < this.sideline[index]) {
					continue;
				}
				for (let indexV=this.sideline[index-dir]-2; indexV>=this.sideline[index] && indexV >=0; indexV--) {
					const tmp = this.imgMatrix[index][indexV];
					this.imgMatrix[index][indexV] = this.imgMatrix[index-dir][indexV+1];
					this.imgMatrix[index-dir][indexV+1] = tmp;
				}

				const distance = this.sideline[index-dir] - this.sideline[index] - 1;
				this.sideline[index] += distance;
				this.sideline[index-dir] -= distance;

				this.setFlowStartIndex(index-1 + fillIn);
				this.setFlowEndIndex(index+1 + fillIn);
			}
		}
	}
}