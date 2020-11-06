// miniprogram/pages/setting/setting.js

import DataBus from '../../base/databus'

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
		this.setData({
			voice: databus.voice,
			sandNum: databus.genSandNum,
			colorChangeSpeed: databus.colorChangeSpeed
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
	}
})