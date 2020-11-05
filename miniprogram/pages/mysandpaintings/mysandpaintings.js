// miniprogram/pages/mysandpaintings/mysandpaintings.js
import DataBus from '../../base/databus'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		sandpaintings: [],
		screenWidth: databus.screenWidth,
		screenHeight: databus.screenHeight,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.offset = 0;
		this.limit = 4;
		this.loadSandpaintings();
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
		this.loadSandpaintings();
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	loadSandpaintings: function() {
		const db = wx.cloud.database();
		db.collection('sandpaintings').orderBy('createdAt', 'desc')
		.skip(this.offset) 
		.limit(this.limit)
		.get()
		.then((res => {
			if (res.data.length == 0) {
				return
			}
			this.offset += res.data.length;
			const sandpaintings = this.data.sandpaintings;
			sandpaintings.push(...res.data);
			this.setData({sandpaintings: sandpaintings})
		}).bind(this))
		.catch(err => {
			wx.showToast({title: '获取数据失败', icon:"none"});
		})
	},

	onImageClick: function(event) {
		const picture = event.target.dataset.item;
		let width = picture.width;
		let height = picture.height;
		if (picture.horizontal) {
			width = databus.screenWidth
			height = databus.screenWidth * picture.height/picture.width;
		}
		this.setData({
			showPreview: true, 
			previewPicture: picture.localPath,
			previewPictureWidth: width,
			previewPictureHeight: height,
		});
	},

	onPreviewViewClick: function(event) {
		this.setData({showPreview: false});
	}
})