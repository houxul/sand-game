// miniprogram/pages/photosandpainting/photosandpainting.js
import SandPhoto from '../../rendering/sandphoto'
import { guid } from '../../base/utils'

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
				this.setData({img:res.tempFilePaths[0]});
			}).bind(this),
		})
	},

	onGenIamge: function() {
		this.setData({showMask: true, progress: 0});
		this.sandPhoto.exec(this.data.img);
	},

	onUploadIamge: async function() {
		const filePath = this.data.img
		const { size } = await new Promise((resolve, reject) => {
			wx.getFileInfo({
				filePath,
				success: resolve,
				fail: reject,
			});
		});
		console.log('size:', size)
		if (size > 500 * 1024) {
			throw new Error('图片尺寸过大');
		}

		const { width, height } = await new Promise((resolve, reject) => {
			wx.getImageInfo({
				src: filePath,
				success: resolve,
				fail: reject,
			});
		});

		const id = guid();
		console.log('id:', id);
		const { fileID } = await new Promise((resolve, reject) => {
			wx.cloud.uploadFile({
				cloudPath:  id + '.jpg',
				filePath,
				success: resolve,
				fail: reject,
			});
		});
		console.log('fileId:', fileID);

		const { names } = require('../../resources/name');
		const { avatars } = require('../../resources/avatar');
		const data = {
			_id: id,
			fileId: fileID,
			userAvatarUrl: avatars[Math.floor(Math.random()*avatars.length)],
			userNickName: names[Math.floor(Math.random()*names.length)],
			horizontal: width > height,
			width: width,
			height: height,
			likes: Math.floor(Math.random()*999),
			createdAt: new Date().getTime() - Math.floor(Math.random() * 30*24*60*60*1000),
		};
		const db = wx.cloud.database()
		await new Promise((resolve, reject) => {
			db.collection('sandpaintings').add({
				data,
				success: resolve,
				fail: reject,
			});
		});
		wx.showToast({title: '成功'})
	}
})