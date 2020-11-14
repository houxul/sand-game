// miniprogram/pages/index/index.js
import SandTable from '../../rendering/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'
import RotateImage from '../../rendering/rotateimage'
import { guid, rgbToStr } from '../../base/utils'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		clrPickBtnRadius: 30,
		clrPickBtnPnts: [{x: databus.screenWidth - 80, y: 120}, {x: databus.screenWidth - 80, y: databus.screenHeight - 100}],
		clrPickBtnPntIndex: 0,
		showMenuButton: true,
		showMenu: false,
		avatarUrl: "../../images/default-avatar.png",
		menuActions: [
			{icon: "../../images/finish.png", key:"完成绘制"},
			{icon: "../../images/restart.png", key:"重新开始"},
			{icon: "../../images/landscape.png", key:"横屏开始"},
			{icon: "../../images/my.png", key:"我的作品"},
			// {icon: "../../images/picture.png", key:"照片沙绘"},
			{icon: "../../images/newest.png", key:"最新沙绘"},
			{icon: "../../images/fire.png", key:"热门沙绘"},
			{icon: "../../images/setting.png", key:"设置"},
			{icon: "../../images/help.png", key:"帮助"},
		],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const userInfo = wx.getStorageSync('userInfo');
		if (userInfo) {
			this.setData({avatarUrl: userInfo.avatarUrl});
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		wx.createSelectorQuery()
		.select('#rotateimage')
		.node(this.initRotateImage.bind(this)).exec();

		wx.createSelectorQuery()
		.select('#sandtable')
		.node(this.initSandTable.bind(this)).exec();

		wx.createSelectorQuery()
		.select('#colorpickerbutton')
		.node(this.initColorPickerButton.bind(this)).exec();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		if (this.colorPickerBtn) {
			this.colorPickerBtn.update();
		}


		if (!this.bgRgba || rgbToStr(this.bgRgba) != rgbToStr(databus.bgRgba)) {
			this.bgRgba = databus.bgRgba;
			if (this.sandTable) {
				this.sandTable.updateBg();
			}
		}
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

	initRotateImage: function(res) {
		const canvas = res.node;
		this.rotateImage = new RotateImage({canvas});
	},

	initSandTable: function(res) {
		const canvas = res.node;
		this.sandTable = new SandTable({canvas});

		this.sandTable.genSandStartCallback = (function() {
			this.setData({showMenuButton: false});
		}).bind(this)

		this.sandTable.genSandEndCallback = (function() {
			this.setData({showMenuButton: true});
		}).bind(this)
	},

	initColorPickerButton: function(res) {
		const canvas = res.node;
		this.colorPickerBtn = new RoundButton({
			canvas,
			radius: this.data.clrPickBtnRadius,
			rgbs: databus.pickerRgbs
		})
	},

	touchStartHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		this.sandTable.touchStartHandler(x, y);
	},

	touchMoveHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.inColorPickerButton(x, y)) {
			this.setData({clrPickBtnPntIndex: (this.data.clrPickBtnPntIndex+1)%2});
		}
		this.sandTable.touchMoveHandler(x, y);
	},

	touchEndHandler: function(event) {
		const {clientX:x, clientY:y} = event.changedTouches[0];
		this.sandTable.touchEndHandler(x, y);
	},

	inColorPickerButton: function(x, y) {
		const pnt = this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex];
		return (x > pnt.x) && (x < pnt.x + 2 * this.data.clrPickBtnRadius)
		&& (y > pnt.y) && (y < pnt.y + 2 * this.data.clrPickBtnRadius);
	},

	onClickColorPicker: function(event) {
		this.sandTable.resetSandSourcePnt();
		wx.navigateTo({
			url: '/pages/colorpicker/colorpicker',
		})
	},

	onClickMenu: function(event) {
		this.sandTable.resetSandSourcePnt();
		this.setData({showMenu: true});
	},

	onClickMenuShadow: function(event) {
		this.setData({showMenu: false});
	},


	onClickAvatar: function(res) {
		if (res.detail.userInfo) {
			const userInfo = res.detail.userInfo;
			const nickName = userInfo.nickName;
			const avatarUrl = userInfo.avatarUrl;
			wx.setStorageSync('userInfo', { nickName, avatarUrl});
			this.setData({avatarUrl});
		}
	},

	onMenuAction: function(event) {
		const index = event.currentTarget.dataset.index;
		switch(index) {
			case 0:
				this.finishActionHandler();
				break;
			case 1:
				this.restartActionHandler();
				break;
			case 2:
				this.horizontalScreenRestartActionHandler();
				break;
			case 3:
				this.mySandPaintingActionHandler();
				break;
			case 4:
				// this.photoSandPaintingActionHandler();
				this.newestSandPaintingActionHandler();
				break;
			case 5:
				this.hotActionHandler();
				break;
			case 6:
				this.settingActionHandler();
				break;
			case 7:
				this.helpActionHandler();
				break;
		}
	},

	finishActionHandler: function() {
		const finishCallback = (function() {
			databus.reset()
			this.sandTable.reset();
			this.data.menuActions[3].tip = '../../images/new-msg.png';
			this.setData({menuActions: this.data.menuActions});
		}).bind(this);
	
		let canvas = this.sandTable.canvas;
		if (databus.horizontal) {
			this.rotateImage.draw(this.sandTable.img);
			canvas = this.rotateImage.canvas;
		}

		wx.canvasToTempFilePath({
			canvas,
			success(res) {
				const tempFilePath = res.tempFilePath;
				const fs = wx.getFileSystemManager()
				fs.saveFile({
					tempFilePath: tempFilePath,
					success(res) {
						const savedFilePath = res.savedFilePath;
						const sandpaintings = wx.getStorageSync('sandpaintings') || [];
						sandpaintings.push({
							id: guid(),
							localPath: savedFilePath,
							horizontal: databus.horizontal,
							upload: false,
							width: databus.horizontal ? databus.screenHeight : databus.screenWidth,
							height: databus.horizontal ? databus.screenWidth : databus.screenHeight,
							createdAt: new Date().getTime(),
						})
						wx.setStorageSync('sandpaintings', sandpaintings);
						finishCallback();
					},
					fail(err) {
						console.log(err)
						wx.showToast({title:'保存本地失败，请重试', icon: 'none'})		
					}
				});
			},
			fail(err) {
				console.log(err)
				wx.showToast({title:'生成图片失败，请重试', icon: 'none'})
			}
		}, this)
	},

    restartActionHandler: function() {
		databus.reset()
		this.sandTable.reset();
		this.setData({showMenu: false});
    },

    horizontalScreenRestartActionHandler: function() {
		databus.horizontal = !databus.horizontal;
		databus.reset()
		this.sandTable.reset();

		this.data.menuActions[2].key = databus.horizontal ? '竖屏开始' : '横屏开始';
		this.setData({showMenu: false, menuActions: this.data.menuActions});
    },

	mySandPaintingActionHandler: function() {
		this.data.menuActions[3].tip = null;
		this.setData({showMenu: false, menuActions: this.data.menuActions});

		wx.navigateTo({
			url: '/pages/mysandpaintings/mysandpaintings',
		})
    },

    photoSandPaintingActionHandler: function() {
		this.setData({showMenu: false});
		wx.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success (res) {
				const tempFilePath = res.tempFilePaths[0];
				wx.navigateTo({url: '/pages/photosandpainting/photosandpainting?file='+tempFilePath})
			}
		})
	},

	newestSandPaintingActionHandler: function() {
		this.setData({showMenu: false});
		wx.navigateTo({url: '/pages/newestsandpaintings/newestsandpaintings'})
	},
	
    hotActionHandler: function() {
		this.setData({showMenu: false});
		wx.navigateTo({url: '/pages/hotsandpaintings/hotsandpaintings'})
	},

    settingActionHandler: function() {
		this.setData({showMenu: false});
		wx.navigateTo({url: '/pages/setting/setting'})
	},

    helpActionHandler: function() {
		this.setData({showMenu: false});
		wx.navigateTo({url: '/pages/help/help'})
	},
})