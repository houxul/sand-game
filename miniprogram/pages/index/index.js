// miniprogram/pages/index/index.js
import SandTable from '../../sands/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		clrPickBtnRadius: 30,
		clrPickBtnRgbs:[[0,0,0], [255,0,0]],
		clrPickBtnPnts: [{x: databus.screenWidth - 80, y: 50}, {x: databus.screenWidth - 80, y: databus.screenHeight - 120}],
		clrPickBtnPntIndex: 0
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
		.select('#sandtable')
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

	updateCanvas: function() {
		this.sandTable.genSand([255, 0, 0]);
		this.sandTable.update();
	},

	randerCanvas: function() {
		this.ctx.clearRect(0, 0, databus.screenWidth, databus.screenHeight)
		// this.ctx.fillStyle = rgbaString(databus.backGroundRgba);
		// this.ctx.fillRect(0,0,databus.screenWidth,databus.screenHeight);
		this.sandTable.drawToCanvas(this.ctx);
		this.colorPickerBtn.drawToCanvas(this.ctx);
	},
	
	initCanvasSize: function(canvas) {
		canvas.width = databus.screenWidth
		canvas.height = databus.screenHeight
	},

	initCanvas: function(res) {
		const canvas = res.node;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.initCanvasSize(canvas);
		
		const img = this.ctx.createImageData(databus.screenWidth, databus.screenHeight)
		this.sandTable = new SandTable(img);

		this.colorPickerBtn = new RoundButton({
			radius: this.data.clrPickBtnRadius,
			rgbs: this.data.clrPickBtnRgbs,
			centre: this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex],
		})
		
		this.bindLoop = (() => {
			this.updateCanvas()
			this.randerCanvas()
		
			canvas.requestAnimationFrame(this.bindLoop);
		}).bind(this);
		canvas.requestAnimationFrame(this.bindLoop);
	},

	touchStartHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.inClrPickBtn(x, y)) {
			return;
		}
		this.sandTable.touchStartHandler(x, y);
	},

	touchMoveHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.inClrPickBtn(x, y)) {
			this.setData({clrPickBtnPntIndex: (this.data.clrPickBtnPntIndex+1)%2})
			this.colorPickerBtn.updateCentre(this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex]);
			return;
		}
		this.sandTable.touchMoveHandler(x, y);
	},

	touchEndHandler: function(event) {
		const {clientX:x, clientY:y} = event.changedTouches[0];
		if (this.inClrPickBtn(x, y)) {
			return;
		}
		this.sandTable.touchEndHandler(x, y);
	},

	onclrPickBtnClick: function(event) {
		console.log('onclrPickBtnClick');
		// const {clientX:x, clientY:y} = event.touches[0];
		// if (this.inClrPickBtn(x, y)) {
		// 	this.setData({clrPickBtnPntIndex: (this.data.clrPickBtnPntIndex+1)%2})
		// }
	},

	inClrPickBtn: function(x, y) {
		const{x: centrePntX, y:centrePntY} = this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex]
		if ((x-centrePntX)*(x-centrePntX) + (y-centrePntY)*(y-centrePntY) > this.data.clrPickBtnRadius*this.data.clrPickBtnRadius) {
			return false
		}
		return true
	}
})