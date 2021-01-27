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
		showLoading: true,
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
			
			res.data.forEach(item => {
				item.ilike = this.ilikeSet.has(item._id)
				sandpaintings.push(item);
			});
			this.setData({sandpaintings: sandpaintings, showLoading: false});
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

	likeSandPainting(index, like) {
		const sandpainting = this.data.sandpaintings[index];
		const sandPaintingId = sandpainting._id;
		sandpainting.likes += (like ? 1 : -1);
		sandpainting.ilike = like;
		this.setData({sandpaintings: this.data.sandpaintings})

		if (!like) {
			this.ilikeSet.delete(sandPaintingId);
		} else {
			this.ilikeSet.add(sandPaintingId);
		}
	},

	onLikeClick: function(event) {
		const index = event.target.dataset.index;
		const sandPaintingId = this.data.sandpaintings[index]._id;
		const like = !this.ilikeSet.has(sandPaintingId);
		this.likeSandPainting(index, like);

		wx.cloud.callFunction({
			name: 'likesandpainting',
			data: {
				sandPaintingId,
			  	like: like,
			},
			success: function(res) {},
			fail: (function(err) {
				console.log(err)
				this.likeSandPainting(index, !like);
				wx.showToast({title: '操作失败', icon:"none"})
			}).bind(this),
		})
	},

	onShareAppMessage: function (res) {
		if (res.from !== 'button') {
			return {
				title: '彩色沙子',
				path: '/pages/hotsandpaintings/hotsandpaintings',
			}
		}
		const imgUrl = res.target.dataset.url;
		return {
			title: '彩色沙子',
			path: '/pages/picturepreview/picturepreview?imgUrl='+imgUrl,
			imageUrl: imgUrl,
		}
	}
})