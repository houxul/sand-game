// miniprogram/pages/setting/setting.js

import DataBus from '../../base/databus'
import {hslToRgb, strToAb, abToStr, rgbToStr} from '../../base/utils'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		sandNumInterval: [10, 120],
		colorChangeSpeedInterval: [1, 200]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const bgColor = rgbToStr(databus.bgRgba);
		this.setData({
			voice: databus.voice,
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

	changeVoice: function(res) {
		databus.voice = res.detail.value;
	},
	sandNumChange: function(res) {
		databus.genSandNum = res.detail.value;
	},
	colorChangeSpeedChange: function(res) {
		databus.colorChangeSpeed = res.detail.value;
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
	}
})