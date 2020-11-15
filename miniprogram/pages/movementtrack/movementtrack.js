// miniprogram/pages/movementtrack/movementtrack.js
import DataBus from '../../base/databus'
import MovementTrack from '../../rendering/movementtrack'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		showAction: true,
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
		.select('#movementtrack')
		.node(this.initCanvas.bind(this)).exec();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		wx.showToast({
		  title: '按下屏幕移动手指，开始画沙子移动轨迹',
		  icon: "none",
		  duration: 3500,
		})
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

	initCanvas: function(res) {
		const canvas = res.node;		
		this.movementTrack = new MovementTrack({canvas});
	},

	touchStartHandler: function(event) {
		this.setData({showAction: false});
		const {clientX:x, clientY:y} = event.touches[0];
		this.movementTrack.setStartingPoint([x, y]);
	},

	touchMoveHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		this.movementTrack.update([x, y]);
	},

	touchEndHandler: function(event) {
		this.setData({showAction: true});
	},

	onClickBack: function() {
		wx.navigateBack();
	},
	onClickClean: function() {
		this.movementTrack.clean();
	},
	onClickApply: function() {
		if (!this.movementTrack.pnts.length) {
			wx.showToast({title: '还没有轨迹哦!', icon: 'none'});
			return
		}
		databus.movementTrack.splice(0, databus.movementTrack.length);
		databus.movementTrack.push(...this.movementTrack.pnts);
		wx.setStorageSync('databus.movementTrack', databus.movementTrack);
		this.autoDownSandFrame = 0;
		wx.navigateBack({delta: 2});
		wx.showToast({title: '应用成功'})
	},
})