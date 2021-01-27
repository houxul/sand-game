// miniprogram/pages/mysandpaintings/mysandpaintings.js
import DataBus from '../../base/databus'
import { wrapReject, confirmMessage } from '../../base/utils'

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
		this.sandPaintingSource = wx.getStorageSync('sandpaintings') || [];
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

	loadSandpaintings: function() {
		const sandpaintings = this.data.sandpaintings;
		let count = 0
		for (let i=this.sandPaintingSource.length -1 - this.offset; i >= 0 && count < this.limit; i--) {
			count += 1
			sandpaintings.push(this.sandPaintingSource[i]);
		}
		this.offset += count;
		this.setData({sandpaintings: sandpaintings})
	},

	onImageClick: function(event) {
		wx.previewImage({
		  urls: this.data.sandpaintings.map(item=> item.localPath),
		  current: event.target.dataset.url,
		  fail: function(err) {
			  console.log(err)
			  wx.showToast({title: '预览失败',})
		  }
		}, true);
	},

	onUploadClick: async function(event) {
		if (!confirmMessage('提示', '上传后其他用户可以看到此作品')) {
			return
		}

		const userInfo = wx.getStorageSync('userInfo');
		if (!userInfo) {
			wx.showToast({icon: 'none',title: '需要回到首页，点击 菜单-头像 获取头像做展示用'})
			return
		}

		wx.showLoading({title: '上传中...'})
		const index = event.currentTarget.dataset.index;
		const item = this.data.sandpaintings[index];
		const { fileID } = await new Promise((resolve, reject) => {
			wx.cloud.uploadFile({
				cloudPath: item.id + '.jpg',
				filePath: item.localPath,
				success: resolve,
				fail: wrapReject(reject, '新增记录失败，请重试')
			})
		});

		const db = wx.cloud.database()
		await new Promise((resolve, reject) => {
			db.collection('sandpaintings').add({
				data: {
					_id: item.id,
					fileId: fileID,
					userAvatarUrl: userInfo.avatarUrl,
					userNickName: userInfo.nickName,
					horizontal: item.horizontal,
					width: item.width,
					height: item.height,
					likes: 0,
					createdAt: new Date().getTime(),
				},
				success: resolve,
				fail: wrapReject(reject, '新增记录失败，请重试')
			});
		});

		const sandpaintings = wx.getStorageSync('sandpaintings');
		for (let i=0; i<sandpaintings.length; i++) {
			if (sandpaintings[i].id == item.id) {
				sandpaintings[i].upload = true;
				break;
			}
		}
		wx.setStorageSync('sandpaintings', sandpaintings);

		this.data.sandpaintings[index].upload = true;
		this.setData({sandpaintings: this.data.sandpaintings});

		wx.showToast({title: '成功'})
	},

	onShareAppMessage: function (res) {
		if (res.from !== 'button') {
			return {
				title: '彩色沙子',
				path: '/pages/hotsandpaintings/hotsandpaintings',
			}
		}
		const item = res.target.dataset.item;
		const imgUrl = item.localPath;
		return {
			title: '彩色沙子',
			path: '/pages/picturepreview/picturepreview?id='+item.id,
			imageUrl: imgUrl,
		}
	},

	onDeleteClick: async function(event) {
		if (!confirmMessage('提示', '删除后将作品将无法恢复，是否删除？')) {
			return
		}

		const index = event.target.dataset.index;
		const item = this.data.sandpaintings[index];

		this.data.sandpaintings.splice(index, 1);
		this.setData({sandpaintings: this.data.sandpaintings});

		const sandpaintings = wx.getStorageSync('sandpaintings');
		for (let i=0; i<sandpaintings.length; i++) {
			if (sandpaintings[i].id == item.id) {
				sandpaintings.splice(i, 1);
				break;
			}
		}
		wx.setStorageSync('sandpaintings', sandpaintings);
		if (!item.upload || !confirmMessage('提示', '本地已删除，是否删除已上传的此作品?')) {
			return
		}

		const collection = wx.cloud.database().collection('sandpaintings');
		const { data: {fileId}} = await new Promise((resolve, reject) => {
			collection.doc(item.id).get().then(resolve).catch(wrapReject(reject, '查询记录失败'));
		});
		await new Promise((resolve, reject) => {
			collection.doc(item.id).remove().then(resolve).catch(wrapReject(reject, '删除记录失败'));
		});

		wx.cloud.deleteFile({
			fileList: [fileId],
			success: res => {
				wx.showToast({title: '成功'})
			},
			fail: console.error
		})
	},
})