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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

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
		// const db = wx.cloud.database();
		// db.collection('sandpaintings').orderBy('createdAt', 'desc')
		// .skip(this.offset) 
		// .limit(this.limit)
		// .get()
		// .then((res => {
		// 	if (res.data.length == 0) {
		// 		return
		// 	}
		// 	this.offset += res.data.length;
		// 	const sandpaintings = this.data.sandpaintings;
		// 	sandpaintings.push(...res.data);
		// 	this.setData({sandpaintings: sandpaintings})
		// }).bind(this))
		// .catch(err => {
		// 	wx.showToast({title: '获取数据失败', icon:"none"});
		// })
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

	onShareClick: function(event) {
		wx.showModal({
			title: '提示',
			content: '分享后其他人可以看到',
			success: ((res) => {
				if (!res.confirm) {
					return
				}
				const userInfo = wx.getStorageSync('userInfo');
				if (!userInfo) {
					wx.showToast({icon: 'none',title: '需要回到首页，点击 菜单-头像 获取头像做展示用'})
					return
				}

				const item = event.target.dataset.item;
				wx.cloud.uploadFile({
					cloudPath: item.id + '.png',
					filePath: item.localPath,
					success: (res) => {
						const db = wx.cloud.database()
						db.collection('sandpaintings').add({
							data: {
								_id: item.id,
								fileId: res.fileID,
								userAvatarUrl: userInfo.avatarUrl,
								userNickName: userInfo.nickName,
								horizontal: item.horizontal,
								width: item.width,
								height: item.height,
								likes: 0,
								createdAt: new Date().getTime(),
							},
							success: (res) => {
								const sandpaintings = wx.getStorageSync('sandpaintings');
								for (let i=0; i<sandpaintings.length; i++) {
									if (sandpaintings[i].id == event.target.dataset.item.id) {
										sandpaintings[i].share = true;
										break;
									}
								}
								wx.setStorageSync('sandpaintings', sandpaintings);

								for (let i=0; i<this.data.sandpaintings.length; i++) {
									if (this.data.sandpaintings[i].id == event.target.dataset.item.id) {
										this.data.sandpaintings[i].share = true;
										break;
									}
								}
								this.setData({sandpaintings: this.data.sandpaintings});

								wx.showToast({title: '成功'})
							},
							fail: (err) => {
								console.log(err)
								wx.showToast({icon: 'none',title: '新增记录失败，请重试'})
							}
						})
					},
					fail: (err) => {
						console.log(err)
						wx.showToast({icon: 'none',title: '上传文件失败，请重试'})
					}
				})
			}).bind(this),
		})
	},

	onShareAppMessage: function (res) {
		if (res.from !== 'button') {
			return {
				title: '不一样的沙图',
				path: '/pages/hotsandpaintings/hotsandpaintings',
			}
		}
		const imgUrl = res.target.dataset.item.localPath;
		return {
			title: '不一样的沙图',
			path: '/pages/picturepreview/picturepreview?imgUrl='+imgUrl,
			imageUrl: imgUrl,
		}
	},

	onDeleteClick: function(event) {
		wx.showModal({
			title: '提示',
			content: '删除后将作品将无法恢复，是否删除',
			success: ((res) => {
				if (!res.confirm) {
					return
				}			  

				const item = event.target.dataset.item;
				const sandpaintings = wx.getStorageSync('sandpaintings');
				for (let i=0; i<sandpaintings.length; i++) {
					if (sandpaintings[i].id == item.id) {
						sandpaintings.splice(i, 1);
						break;
					}
				}
				wx.setStorageSync('sandpaintings', sandpaintings);

				for (let i=0; i<this.data.sandpaintings.length; i++) {
					if (this.data.sandpaintings[i].id == item.id) {
						this.data.sandpaintings.splice(i, 1);
						break;
					}
				}
				this.setData({sandpaintings: this.data.sandpaintings});

				wx.showToast({title: '成功'})
			}).bind(this)
		})
	}
})