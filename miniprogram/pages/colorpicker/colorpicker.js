// miniprogram/pages/colorpicker/colorpicker.js
import DataBus from '../../base/databus'
import ColorPicker from '../../rendering/colorpicker'
import RoundButton from '../../rendering/roundbutton'
import { genRgb } from '../../base/utils'

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

		wx.createSelectorQuery()
		.select('#switchbutton')
		.node(this.initSwitchButton.bind(this)).exec();

		wx.createSelectorQuery()
		.select('#displaybutton')
		.node(this.initDisplayButton.bind(this)).exec();
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

	initCanvasSize: function(canvas) {
		canvas.width = databus.windowWidth
		canvas.height = databus.windowHeight
	},

	initCanvas: function(res) {
		const canvas = res.node;
		const ctx = canvas.getContext('2d');
		this.initCanvasSize(canvas);
		
		this.colorPicker = new ColorPicker(ctx);
	},

	initSwitchButton: function(res) {
		const canvas = res.node;
		this.switchButton = new RoundButton({
			canvas,
			radius: 20,
			rgbs: [[0,0,0], [255,255,255],[0,0,0],[255,255,255],[0,0,0]]
		})
	},

	initDisplayButton: function(res) {
		const canvas = res.node;
		this.displayButton = new RoundButton({
			canvas,
			radius: 30,
			rgbs: [...databus.pickerRgbs]
		})
	},

	correctTouchPnt: function(x, y) {
		if (x<0) {
			x = 0;
		} else if (x > databus.windowWidth-1) {
			x = databus.windowWidth -1;
		}

		if (y<0) {
			y = 0;
		} else if (y > databus.windowHeight-1) {
			y = databus.windowHeight-1;
		}
		return {x, y};
	},

	touchCanvasHandler: function(event) {
		const {clientX, clientY} = event.touches[0];
		const {x, y} = this.correctTouchPnt(clientX, clientY);
		const imgData = this.colorPicker.ctx.getImageData(x, y, 1, 1)
		this.updateDisplayButtonColors([[...imgData.data]])
	},

	onClickSwitch: function(res) {
		const colorNum = Math.floor(Math.random()*5)+2;
		const colors = []
		for (let i=0; i<colorNum; i++) {
			colors.push(genRgb())
		}
		this.updateDisplayButtonColors(colors)
	},

	onClickDisplay: function(res) {
		databus.resetPickerRgbs(this.displayButton.rgbs);
		wx.navigateBack();
	},
	
	updateDisplayButtonColors: function(colors) {
		this.displayButton.rgbs = colors;
		this.displayButton.update();
	},
})