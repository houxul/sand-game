// miniprogram/pages/colorpicker/colorpicker.js
import DataBus from '../../base/databus'
import ColorPicker from '../../rendering/colorpicker'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		wx.createSelectorQuery()
		.select('#colorpicker')
		.node(this.initCanvas.bind(this)).exec();
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

	onClick: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		this.colorPicker.onClick(x, y);
	},

	initCanvasSize: function(canvas) {
		canvas.width = databus.screenWidth
		canvas.height = databus.screenHeight
	},

	initCanvas: function(res) {
		const canvas = res.node;
		const ctx = canvas.getContext('2d');
		this.initCanvasSize(canvas);
		
		this.colorPicker = new ColorPicker(ctx);
		this.colorPicker.exitPageCallball = () => {
			databus.resetPickerLinearGradient();
			wx.navigateBack({});
		}
	},
})