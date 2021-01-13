// miniprogram/pages/setting/setting.js

import DataBus from '../../base/databus'
import {hslToRgb, strToAb, abToStr, rgbToStr, strToRgb} from '../../base/utils'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		sandNumInterval: [5, 40],
		colorChangeSpeedInterval: [1, 200],
		movementTrackCanvasSize: [150* databus.screenWidth/databus.screenHeight, 150]
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
			notRepeatColor: databus.notRepeatColor,
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
		if (!this.data.autoDownSand) {
			return
		}

		if (!this.movementTrackCanvas) {
			this.initMovementTrack();
			return;
		}

		this.renderMovementTrack(this.movementTrackCanvas);
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

	initMovementTrack: function() {
		this.createSelectorQuery()
		.select('#movementtrack')
		.node((function(res) {
			const canvas = res.node;
			canvas.width = databus.screenWidth;
			canvas.height = databus.screenHeight;
			this.movementTrackCanvas = canvas;
			this.renderMovementTrack(this.movementTrackCanvas);
		}).bind(this)).exec();
	},
	changeAutoDownSand: function(res) {
		this.setData({autoDownSand: res.detail.value});
		databus.updateSetting({autoDownSand: res.detail.value});

		if (!this.data.autoDownSand) {
			this.movementTrackCanvas = undefined;
			return;
		}

		this.initMovementTrack();
	},
	sandNumChange: function(res) {
		databus.updateSetting({genSandNum: res.detail.value});
	},
	colorChangeSpeedChange: function(res) {
		databus.updateSetting({colorChangeSpeed: res.detail.value});
	},
	notRepeatColorChange: function(res) {
		databus.updateSetting({notRepeatColor: res.detail.value});
	},
	onClickBgColor: function(event) {
		this.setData({showColorPicker: !this.data.showColorPicker});
		if (this.data.bgColor != rgbToStr(databus.bgRgba)) {
			this.setData({bgColor: rgbToStr(databus.bgRgba)})
		}

		if (this.data.showColorPicker) {
			wx.createSelectorQuery()
			.select('#colorpicker')
			.node((function(res) {
				const canvas = res.node;
				canvas.width = databus.screenWidth;
				const ctx = canvas.getContext('2d');

				const colorboardPath = wx.getStorageSync('colorboard');
				if (colorboardPath) {
					const img = canvas.createImage();
					img.onload = (res) => {
						ctx.drawImage(img, 0, 0, databus.screenWidth, databus.screenHeight,
							0, 0, canvas.width, canvas.height);
					};
					img.src = colorboardPath;
				} else {
					const imgWidth = canvas.width;
					const imgHeight = canvas.height;

					const img = ctx.createImageData(imgWidth, imgHeight);
					const imgData = img.data;
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
					ctx.putImageData(img, 0, 0);
				}

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
		wx.showToast({title: '应用成功'});
	},
	onClickMovementTrack: function(event) {
		wx.navigateTo({url: '/pages/movementtrack/movementtrack'});
	},
	renderMovementTrack: function(canvas) {
		const ctx = canvas.getContext('2d');
		ctx.save();

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'rgb(245, 245, 245)';
		ctx.strokeStyle = 'rgb(255, 0, 0)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		for (let i=0; i<databus.movementTrack.length; i++) {
			if (databus.movementTrack[i].length != 3) {
				continue;
			}
			// 只连接起始点和转折点
			if (databus.movementTrack[i][2] == 0) {
				ctx.moveTo(databus.movementTrack[i][0], databus.movementTrack[i][1])
			} else {
				ctx.lineTo(databus.movementTrack[i][0], databus.movementTrack[i][1]);
			}
		}
		ctx.stroke();

		ctx.restore();
	},
	onClickResetMovementTrack: function(event) {
		databus.resetMovementTrack();
		this.renderMovementTrack(this.movementTrackCanvas);
		wx.setStorageSync('databus.movementTrack', databus.movementTrack);
	}
})