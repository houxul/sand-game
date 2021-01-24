// miniprogram/pages/photosandpainting/photosandpainting.js
import SandPhoto from '../../rendering/sandphoto'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		disabled: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({img: '../../images/placeholder.jpg', showMask: false});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		wx.createSelectorQuery()
		.select('#img').fields({
			rect: true,
			size: true,
		}, (res) => {
			this.setData({
				imgTop: res.top,
				imgLeft: res.left,
				imgWidth: res.width,
				imgHeight: res.height,
			})
		}).exec();

		wx.createSelectorQuery()
		.select('#canvas')
		.node(((res) => {
			const sandPhoto = new SandPhoto(res.node);
			sandPhoto.progress = (function(val) {
				if (val >= 90) {
					this.setData({ progress:val, disabled: true});
					return;
				}
				this.setData({ progress:val });
			}).bind(this);

			sandPhoto.done = (function(res) {
				if (res.filePath) {
					this.setData({img: res.filePath, showMask:false, disabled: false});
					wx.showToast({title: '成功'});
				} else {
					wx.showToast({title: '失败', icon: 'none'});
					console.log(res.err);
				}
			}).bind(this);
			this.sandPhoto = sandPhoto;
		}).bind(this)).exec();
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

	onClickImg: function() {
		wx.previewImage({
		  urls: [this.data.img],
		})
	},

	onCancel: function() {
		this.sandPhoto.abort();
		this.setData({showMask: false, disabled: false});
	},

	onSelectIamge: function() {
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (function(res) {
				this.setData({img:res.tempFilePaths[0], showMask: true, progress: 0});
				this.sandPhoto.exec(res.tempFilePaths[0]);
			}).bind(this),
		})
	},
})