// miniprogram/pages/setting/setting.js

import DataBus from '../../base/databus'
import {hslToRgb, strToAb, abToStr, rgbToStr, strToRgb} from '../../base/utils'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		sandNumInterval: [10, 120],
		colorChangeSpeedInterval: [1, 200],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const bgColor = rgbToStr(databus.bgRgba);
		this.setData({
			autoDownSand: databus.autoDownSand,
			sandNum: databus.genSandNum,
			colorChangeSpeed: databus.colorChangeSpeed,
			bgColor,
			showColorPicker: false,
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.renderMovementTrack();
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
	changeAutoDownSand: function(res) {
		this.setData({autoDownSand: res.detail.value});
		databus.updateSetting({autoDownSand: res.detail.value});

		this.renderMovementTrack();
	},
	sandNumChange: function(res) {
		databus.updateSetting({genSandNum: res.detail.value});
	},
	colorChangeSpeedChange: function(res) {
		databus.updateSetting({colorChangeSpeed: res.detail.value});
	},
	onClickBgColor: function(event) {
		this.setData({showColorPicker: !this.data.showColorPicker});

		if (this.data.showColorPicker) {
			wx.createSelectorQuery()
			.select('#colorpicker')
			.node((function(res) {
				const canvas = res.node;
				const ctx = canvas.getContext('2d');
				const imgWidth = canvas.width;
				const imgHeight = canvas.height;
				const img = ctx.createImageData(imgWidth, imgHeight);
				const imgData = img.data;
		
				const bufferStr = wx.getStorageSync('setting.colorpicker.background');
				if (bufferStr) {
					const buffer = strToAb(bufferStr)
					const dataArray = new Uint8ClampedArray(buffer)
					for (let i=0; i<dataArray.length; i++) {
						imgData[i]=dataArray[i]
					}
				} else {
					const hslX = 360 / imgWidth;
					const hslY = 100 / imgHeight;
					for (let x=0; x< imgWidth; x++) {
						for (let y = 0; y < imgHeight; y++) {
							const rgb = hslToRgb(x*hslX, 100, y*hslY);
							const dataIndex = 4 * (y * imgWidth	+ x)
							imgData[dataIndex] = rgb[0]
							imgData[dataIndex + 1] = rgb[1]
							imgData[dataIndex + 2] = rgb[2]
							imgData[dataIndex + 3] = 255
						}
					}
					wx.setStorageSync('setting.colorpicker.background', abToStr(imgData.buffer));
				}
				ctx.putImageData(img, 0, 0);
				this.colorPickerCtx = ctx;
				this.colorPickerCanvas = canvas;
			}).bind(this)).exec();
		}
	},
	onClickColorPicker: function(event) {
		let {x, y} = event.touches[0];
		if (x<0) {
			x = 0;
		} else if (x > this.colorPickerCanvas.width-1) {
			x = this.colorPickerCanvas.width -1;
		}

		if (y<0) {
			y = 0;
		} else if (y > this.colorPickerCanvas.height-1) {
			y = this.colorPickerCanvas.height-1;
		}

		const rgba = this.colorPickerCtx.getImageData(x, y, 1, 1).data;
		this.setData({bgColor: rgbToStr(rgba)})
	},
	onClickResetBgColor: function(event) {
		databus.updateSetting({bgRgba: databus.default.bgRgba});
		this.setData({bgColor: rgbToStr(databus.bgRgba)})
	},
	onClickApplyBgColor: function(event) {
		databus.updateSetting({bgRgba: [...strToRgb(this.data.bgColor), 214]});
	},
	onClickMovementTrack: function(event) {
		wx.navigateTo({url: '/pages/movementtrack/movementtrack'});
	},
	renderMovementTrack: function(event) {
		if (!this.data.autoDownSand) {
			return;	
		}
		this.createSelectorQuery()
		.select('#movementtrack')
		.node((function(res) {
			const canvas = res.node;
			canvas.width = databus.screenWidth; 
			canvas.height = databus.screenWidth*databus.screenWidth/databus.screenHeight;
			const ctx = canvas.getContext('2d');

			ctx.fillStyle = 'rgb(245, 245, 245)';
			ctx.restore()
			ctx.beginPath();
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.translate(databus.screenWidth, 0)
			ctx.rotate(Math.PI/2);
			const scale = databus.screenWidth/databus.screenHeight;
			ctx.scale(scale, scale);

			ctx.strokeStyle = 'rgb(255, 0, 0)';
			for (let i=0; i<databus.movementTrack.length; i++) {
				if (databus.movementTrack[i].length == 2) {
					ctx.lineTo(databus.movementTrack[i][0], databus.movementTrack[i][1]);
				} else {
					ctx.moveTo(databus.movementTrack[i][0], databus.movementTrack[i][1])
				}
			}
			ctx.stroke();
		}).bind(this)).exec();
	},
	onClickResetMovementTrack: function(event) {
		databus.resetMovementTrack();
		this.renderMovementTrack();
	}
})