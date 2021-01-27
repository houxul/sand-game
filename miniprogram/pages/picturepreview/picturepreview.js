// miniprogram/pages/picturepreview/picturepreview.js
import { wrapReject } from '../../base/utils'
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
		const { data } = await new Promise((resolve, reject) => {
			collection.doc(options.id).get().then(resolve).catch(wrapReject(reject, '查询记录失败'));
		});

		wx.previewImage({
			urls: [data.fileId],
			current: data.fileId,
			fail: function(err) {
				console.log(err)
				wx.showToast({title: '预览失败',})
			}
		  }, true);
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