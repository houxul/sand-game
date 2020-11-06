// miniprogram/pages/photosandpainting/photosandpainting.js
import DataBus from '../../base/databus'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		showMask: true,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.overlayAlpha = 0.2
		this.file = options.file; //'../../images/default-avatar.png';
		wx.getImageInfo({
			src: this.file,
			success: ((res) => {
				this.oriImgWidth = res.width;
				this.oriImgHeight = res.height;
				this.setData({
					imgWidth: databus.screenWidth,
					imgHeight: res.height * databus.screenWidth/res.width,
				})
			}).bind(this),
			fail(res) {
				wx.showToast({title: '获取照片尺寸失败，请重试', icon: 'none'})
			}
		})

		this.setData({img: this.file});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		this.imgAlpha = this.alphaOverlay(1, this.overlayAlpha) * 255;

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
			const canvas = res.node;
			this.canvas = canvas;
			canvas.width = this.oriImgWidth;
			canvas.height = this.oriImgHeight;

			const ctx = canvas.getContext('2d');
			const img = canvas.createImage();
			img.onload = (res) => {
				ctx.drawImage(img, 0, 0);
				const imgData = ctx.createImageData(this.oriImgWidth, this.oriImgHeight);
				for (let x=0; x<this.oriImgWidth; x++) {
					for (let y=0; y<this.oriImgHeight; y++) {
						const overlayRgb = Math.floor( Math.random() * 256 );
						const rgb = ctx.getImageData(x, y, 1, 1).data;
						const newRgba = [this.rgbOverlay(rgb[0], overlayRgb, 1, this.overlayAlpha), 
						  				this.rgbOverlay(rgb[1], overlayRgb, 1, this.overlayAlpha), 
										  this.rgbOverlay(rgb[2], overlayRgb, 1, this.overlayAlpha), this.imgAlpha]
						this.setImgData(imgData, x, y, newRgba);
					}

					this.setData({progressPercent: x*100/this.oriImgWidth});
				}

				ctx.clearRect(0, 0, this.oriImgWidth, this.oriImgHeight);
				ctx.putImageData(imgData, 0, 0);
				wx.canvasToTempFilePath({
					canvas,
					success: ((res) => {
						const tempFilePath = res.tempFilePath;
						this.setData({img: tempFilePath, showMask:false});
						wx.showToast({title: '成功'})
					}).bind(this),
					fail(res) {
						wx.showToast({title:'生成图片失败，请重试', icon: 'none'})
					}
				}, this)
			}
			img.onerror = (res) => {
				wx.showToast({title:'加载图片失败，请重试', icon: 'none'})
			}
			img.src = this.file;

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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	rgbOverlay: function(c1, c2, a1, a2) {
		return (c1*a1 + c2*a2 -c1*a1*a2)/(a1+a2-a1*a2)
	},
	
	alphaOverlay: function(a1, a2) {
		return a1+a2-a1*a2;
	},

	setImgData: function(img, x, y, rgba) {
		const dataIndex = 4 * (y * img.width  + x)
		img.data[dataIndex] = rgba[0]
		img.data[dataIndex + 1] = rgba[1]
		img.data[dataIndex + 2] = rgba[2]
		img.data[dataIndex + 3] = rgba[3]
	},

	onClickImg: function() {
		wx.previewImage({
		  urls: [this.data.img],
		})
	}
})