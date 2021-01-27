// miniprogram/pages/picturepreview/picturepreview.js
import { wrapReject } from '../../base/utils'
import DataBus from '../../base/databus'

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
	onLoad: async function (options) {
		const collection = wx.cloud.database().collection('sandpaintings');
		const { data: item } = await new Promise((resolve, reject) => {
			collection.doc(options.id).get().then(resolve).catch(wrapReject(reject, '查询记录失败'));
		});

		const imgWidth = item.horizontal ? databus.screenWidth-40 : 320*item.width/item.height;
		const imgHeight = item.horizontal ? (databus.screenWidth -40) * item.height/item.width : 320;
		const marginTop = (databus.screenHeight - imgHeight-200)/2;
		this.setData({item, imgWidth, imgHeight, marginTop});
	},

	onImageClick: function() {
		wx.previewImage({
			urls: [this.data.item.fileId],
			current: this.data.item.fileId,
			fail: function(err) {
				console.log(err)
				wx.showToast({title: '预览失败',})
			}
		}, true);
	},

	toMainPage: function() {
		wx.navigateTo({url: '/pages/index/index'});
	},

	toSandpaintingsPage: function() {
		wx.navigateTo({url: '/pages/hotsandpaintings/hotsandpaintings'});
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
})