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
		this.ilikeSet = new Set();
		this.offset = 0;
		this.limit = 4;
		this.loadData();
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
		db.collection('sandpaintings').orderBy('likes', 'desc')
		.skip(this.offset) 
		.limit(this.limit)
		.get()
		.then((res => {
			if (res.data.length == 0) {
				return
			}
			this.offset += res.data.length;
			const sandpaintings = this.data.sandpaintings;
			
			res.data.forEach(item => {
				item.ilike = this.ilikeSet.has(item._id)
				sandpaintings.push(item);
			});
			this.setData({sandpaintings: sandpaintings})
		}).bind(this))
		.catch(err => {
			wx.showToast({title: '获取数据失败，请重试', icon:"none"});
		})
	},

	loadData() {
		const ilike = wx.cloud.database().collection('ilike');
		ilike.count({
			success: (function(res) {
				ilike.limit(res.total).get().then((res => {
					res.data.forEach(item => {this.ilikeSet.add(item.sandPaintingId)});
					this.loadSandpaintings();
				}).bind(this))
				.catch(err => {
					console.log(err);
					wx.showToast({title: '获取数据失败，请重试', icon:"none"});
				})
			}).bind(this),
			fail: function(err) {
				console.log(err);
				wx.showToast({
				  title: '获取数据失败，请重试',
				  icon: 'none'
				})
			}
		});
	},

	onImageClick: function(event) {
		wx.previewImage({
		  urls: this.data.sandpaintings.map(item=> item.fileId),
		  current: event.target.dataset.url,
		  fail: function(err) {
			  console.log(err)
			  wx.showToast({title: '预览失败',})
		  }
		}, true);
	},

	onLikeClick: function(event) {
		const item = event.target.dataset.item;
		const sandPaintingId = item._id;
		const like = !this.ilikeSet.has(sandPaintingId)
		wx.cloud.callFunction({
			name: 'likesandpainting',
			data: {
				sandPaintingId,
			  	like: like,
			},
			success: (function(res) {
				if (!like) {
					this.ilikeSet.delete(sandPaintingId);
				} else {
					this.ilikeSet.add(sandPaintingId);
				}

				for (let i=0; i < this.data.sandpaintings.length; i++) {
					if (item._id == this.data.sandpaintings[i]._id) {
						this.data.sandpaintings[i].likes += (like ? 1 : -1);
						this.data.sandpaintings[i].ilike = like;
						break;
					}
				}

				this.setData({sandpaintings: this.data.sandpaintings})
			}).bind(this),
			fail: function(err) {
				console.log(err)
				wx.showToast({title: '操作失败', icon:"none"})
			}
		})
		return
	},

	onShareAppMessage: function (res) {
		if (res.from !== 'button') {
			return {
				title: '彩色沙子',
				path: '/pages/hotsandpaintings/hotsandpaintings',
			}
		}
		const imgUrl = res.target.dataset.item.fileId;
		return {
			title: '彩色沙子',
			path: '/pages/picturepreview/picturepreview?imgUrl='+imgUrl,
			imageUrl: imgUrl,
		}
	}
})