// miniprogram/pages/index/index.js
import SandTable from '../../rendering/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'
import ImageButton from '../../rendering/imagebutton'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		clrPickBtnRadius: 25,
		clrPickBtnPnts: [{x: databus.screenWidth - 50, y: 100}, {x: databus.screenWidth - 50, y: databus.screenHeight - 100}],
		clrPickBtnPntIndex: 0,
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
		this.sandTable.genSand();
		this.sandTable.update();
	},

	randerCanvas: function() {
		this.ctx.clearRect(0, 0, databus.screenWidth, databus.screenHeight)
		this.sandTable.drawToCanvas(this.ctx);
		this.colorPickerBtn.drawToCanvas(this.ctx);
		this.menuBtn.drawToCanvas(this.ctx);
	},
	
	initCanvasSize: function(canvas) {
		canvas.width = databus.screenWidth
		canvas.height = databus.screenHeight
	},

	initCanvas: function(res) {
		const canvas = res.node;
		this.ctx = canvas.getContext('2d');

		this.initCanvasSize(canvas);
		
		const img = this.ctx.createImageData(databus.screenWidth, databus.screenHeight)
		this.sandTable = new SandTable(img);

		this.colorPickerBtn = new RoundButton({
			radius: this.data.clrPickBtnRadius,
			rgbs: databus.pickerRgbs,
			centre: this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex],
		})

		this.menuBtn = new ImageButton({
			x: 40,
			y: 79,
			width: 40,
			height: 40,
			canvas: canvas,
			imgSrc: `../../images/menu${Math.floor(Math.random()*6)}.png`
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
		if (this.isButtonInside(x, y)) {
			return;
		}

		this.sandTable.touchStartHandler(x, y);
	},

	touchMoveHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.isButtonInside(x, y)) {
			this.setData({clrPickBtnPntIndex: (this.data.clrPickBtnPntIndex+1)%2})
			this.colorPickerBtn.updateCentre(this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex]);
			return;
		}
		this.sandTable.touchMoveHandler(x, y);
	},

	touchEndHandler: function(event) {
		const {clientX:x, clientY:y} = event.changedTouches[0];
		if (this.isButtonInside(x, y)) {
			this.sandTable.resetSandSourcePnt();
			return;
		}
		this.sandTable.touchEndHandler(x, y);
	},

	tapHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.menuBtn.inside(x, y)) {
			this.sandTable.resetSandSourcePnt();
		}
		if (this.colorPickerBtn.inside(x, y)) {
			wx.navigateTo({
				url: '/pages/colorpicker/colorpicker',
			})
		}
	},

	isButtonInside: function(x, y) {
		return this.menuBtn.inside(x, y) || this.colorPickerBtn.inside(x, y);
	},
})