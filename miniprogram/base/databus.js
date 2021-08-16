import Pool from './pool'
import { tryRun, equalColor, genUnsimilarColors, alphaOverlay } from './utils'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
	constructor() {
		if ( instance )
			return instance

		instance = this
		this.init()
	
		// this.tryRecoveryProgress();
	}

	init() {
		this.pool = new Pool()

		const sysInfo = wx.getSystemInfoSync()
		this.screenWidth	= sysInfo.screenWidth
		this.screenHeight = sysInfo.screenHeight

		this.gameOver	 = false
		this.sandFrame	= 0
		this.autoDownSandFrame = 0;
		this.notRepeatColor = false;
		this.genSandNum = 20;
		this.overlayAlpha = 0.08;
		this.rgbAlpha = 255;//alphaOverlay(1, this.overlayAlpha) * 255
		this.pickerRgbs = [];
		this.linearGradientRgbs = [];
		this.linearGradientLen = 500;
		this.resetPickerRgbs(genUnsimilarColors([], 2))
		this.horizontal = false;
		this.colorChangeSpeed = 1000;
		this.autoDownSand = false;
		this.bgRgba = [214, 214, 214, 214];
		this.movementTrack = [];
		this.myColors = [[[255,0,0]],[[0,255,0]],[[0,0,255]]];
		this.sandNumInterval = [5, 40];
		this.colorChangeSpeedInterval =[10, 2000];
		this.voice = false;
		this.uploadConfirm = true;

		this.default = {
			bgRgba: this.bgRgba,
		}

		this.loadSetting();
		this.resetSpeedTthreshold();

		if (this.movementTrack.length == 0) {
			this.resetMovementTrack();
		}
	}

	reset(){
		this.sandFrame = 0
		this.autoDownSandFrame = 0;
	}

	// saveProgress() {
	//	 wx.setStorageSync('databus', {sandFrame: this.sandFrame})
	// }

	// tryRecoveryProgress() {
	//	 const databus = wx.getStorageSync('databus')
	//	 if (databus&&databus.sandFrame) {
	//		 this.sandFrame = databus.sandFrame
	//	 }
	// }

	async loadSetting() {
		const load = (function(key) {
			const value = wx.getStorageSync('databus.'+key)
			if (value == "" || value == undefined || value == null) {
				return;
			}
			Reflect.set(this, key, value)
		}).bind(this);

		load('colorChangeSpeed');
		load('autoDownSand');
		load('bgRgba');
		load('genSandNum');
		load('movementTrack');
		load('myColors');
		load('notRepeatColor');
		load('voice');
		load('uploadConfirm');

		// const info = wx.getStorageInfoSync();
		// console.log('-------------', info);
	}

	updateSetting(options) {
		for (const item in options) {
			const itemVal = options[item];
			Reflect.set(this, item, itemVal);
			wx.setStorageSync('databus.' + item, itemVal);

			if (item == 'bgRgba' && this.bgRgbaChangeCallback) {
				this.bgRgbaChangeCallback(itemVal);
			}
		}
	}

	resetPickerRgbs(rgbs) {
		this.pickerRgbs.length = 0;
		this.linearGradientRgbs.length = 0;
		this.pickerRgbs.push(...rgbs);

		this.sandFrame = 0
		this.filledLinearGradientRgb = rgbs[0];
		const colors = this.pickerRgbs.concat([this.filledLinearGradientRgb]);
		this.filledLinearGradientStartIndex = (colors.length - 2) * this.linearGradientLen;
		for (let i=1; i<colors.length; i++) {
			this.setLinearGradientRgbs(colors[i-1], colors[i], 
				this.linearGradientLen, this.linearGradientRgbs, (i-1)*this.linearGradientLen);
		}
		tryRun(this.pickerColorChange);
	}

	setLinearGradientRgbs(startColor, endColor, linearGradientLen, out, index) {
		for (let i=0; i<linearGradientLen; i++) {
			const percent = i/linearGradientLen;
			const r = startColor[0] + (endColor[0] - startColor[0]) * percent
			const g = startColor[1] + (endColor[1] - startColor[1]) * percent
			const b = startColor[2] + (endColor[2] - startColor[2]) * percent
			out[i+index] = [r, g, b];
		}
	}

	get sandFrameColor() {
		let index = Math.floor(this.sandFrame * this.colorChangeSpeed/2000);
		if (index < this.linearGradientRgbs.length) {
			this.sandFrame++
			if (index > this.filledLinearGradientStartIndex && 
				/*this.autoDownSandFrame &&*/ this.notRepeatColor &&
				equalColor(this.filledLinearGradientRgb, this.pickerRgbs[0])) {
					this.filledLinearGradientRgb = genUnsimilarColors(this.pickerRgbs, 1, 1)[0];
					this.setLinearGradientRgbs(this.pickerRgbs[this.pickerRgbs.length-1], this.filledLinearGradientRgb, 
						this.linearGradientLen, this.linearGradientRgbs, this.filledLinearGradientStartIndex);
			}
		} else {
			index = 0;
			this.sandFrame = 0;
			if (/*this.autoDownSandFrame &&*/ this.notRepeatColor) {
				this.resetPickerRgbs([this.filledLinearGradientRgb, ...genUnsimilarColors([this.filledLinearGradientRgb])]);
			}
		}
		return this.linearGradientRgbs[index];
	}

	get autoDownSandFramePnt() {
		if (this.autoDownSandFrame < this.movementTrack.length-1) {
			this.autoDownSandFrame++;
		} else {
			this.autoDownSandFrame = 0;
		}
		const track = this.movementTrack[this.autoDownSandFrame];
		return {x: track[0], y:track[1]};
	}

	resetMovementTrack() {
		this.movementTrack.length = 0;
		const arcHeight = this.screenWidth/2;
		for (let i=0; i< this.screenHeight; i++) {
			this.movementTrack.push([arcHeight * (Math.sin(4*i/arcHeight)+1), i, 1]);
		}
		this.movementTrack[0].push(0);
	}

	resetSpeedTthreshold() {
		this.speedTthreshold = (2*this.genSandNum/this.sandNumInterval[1]);
	}
}
