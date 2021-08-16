// miniprogram/pages/index/index.js
import SandTable from '../../rendering/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'
import RotateImage from '../../rendering/rotateimage'
import ColorBoard from '../../rendering/colorboard'
import Autio from '../../base/audio';
import { guid, rgbToStr, hasColors, colorsId, wrapReject, confirmMessage, defaultShareImage } from '../../base/utils'

let databus = new DataBus()
let autio = new Autio();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		screenWidth: databus.screenWidth,
		screenHeight: databus.screenHeight,
		clrPickBtnRadius: 30,
		clrPickBtnPnts: [
			{x: databus.screenWidth - 80, y: 120}, 
			{x: databus.screenWidth - 80, y: databus.screenHeight - 100},
			{x: 30, y: 120}, 
			{x: databus.screenWidth - 80, y: 120}, 
		],
		clrPickBtnPntIndex: 0,
		menuBtnPnts: [
			{x: 30, y: 135}, 
			{x: 30, y: databus.screenHeight-100}
		],
		menuBtnPntIndex: 0,
		showMenuButton: true,
		menuLeft: databus.screenWidth,
		showMyColors: false,
		avatarUrl: "../../images/default-avatar.png",
		menuActions: [
			{icon: "../../images/finish.png", key:"完成绘制"},
			{icon: "../../images/restart.png", key:"重新开始"},
			{icon: "../../images/landscape.png", key:"横屏开始"},
			{icon: "../../images/my.png", key:"我的作品"},
			{icon: "../../images/newest.png", key:"最新作品"},
			{icon: "../../images/fire.png", key:"热门作品"},
			{icon: "../../images/picture.png", key:"沙子照片"},
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

		const myColors = databus.myColors.map((item) => {
			return {rgbs: item, radius: 25, id: colorsId(item)};
		})
		this.setData({myColors, useColorBoard: !wx.getStorageSync('colorboard')})

		if (databus.horizontal) {
			databus.horizontal = false;
		}

		this.promptDisplayed = wx.getStorageSync('prompt-displayed') || false;
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

		if (this.data.useColorBoard) {
			wx.createSelectorQuery()
			.select('#colorboard')
			.node(this.initColorBoard.bind(this)).exec();
		}
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		if (this.sandTable) {
			this.sandTable.cancelAnimationFrame();
			this.sandTable.requestAnimationFrame();
		}

		if (!this.promptDisplayed) {
			setTimeout((function() {
				wx.showModal({
					showCancel: false,
					content: '按下屏幕，移动手指，开始使用彩色沙子绘制图形吧！',
					confirmText: '知道了',
					success: (function(res) {
						if (!res.confirm) {
							return;
						}
						this.promptDisplayed = true;
						wx.setStorageSync('prompt-displayed', true);
					}).bind(this)
				})
			}).bind(this), 1000);
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		this.sandTable.cancelAnimationFrame();
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

	initRotateImage: function(res) {
		const canvas = res.node;
		this.rotateImage = new RotateImage({canvas});
	},

	initSandTable: function(res) {
		const canvas = res.node;
		this.sandTable = new SandTable({canvas});

		this.sandTable.genSandStartCallback = (function() {
			this.setData({showMenuButton: false, showMyColors: false});
			if (databus.voice) {
			}
		}).bind(this)

		this.sandTable.genSandEndCallback = (function() {
			if (!this.data.showMenuButton) {
				this.setData({showMenuButton: true});
			}
		}).bind(this)

		this.sandTable.sandFlowStartCallback = (function() {
			if (databus.voice) {
				autio.play();
			}
		}).bind(this)

		this.sandTable.sandFlowEndCallback = (function() {
			if (databus.voice) {
				autio.pause();
			}
		}).bind(this)

		databus.bgRgbaChangeCallback = ((bgRgba) => {
			if (!this.bgRgba || rgbToStr(this.bgRgba) != rgbToStr(databus.bgRgba)) {
				this.bgRgba = databus.bgRgba;
				if (this.sandTable) {
					this.sandTable.updateBg();
				}
			}
		}).bind(this);
	},

	initColorPickerButton: function(res) {
		const canvas = res.node;
		this.colorPickerBtn = new RoundButton({
			canvas,
			radius: this.data.clrPickBtnRadius,
			rgbs: databus.pickerRgbs
		})

		databus.pickerColorChange = (function() {
			this.colorPickerBtn.update();
		}).bind(this);
	},

	initColorBoard: async function(res) {
		const canvas = res.node;
		new ColorBoard({canvas})
	},

	touchStartHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		this.sandTable.touchStartHandler(x, y);
	},

	touchMoveHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.inColorPickerButton(x, y)) {
			this.setData({clrPickBtnPntIndex: (databus.horizontal*2) + (this.data.clrPickBtnPntIndex+1)%2});
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
		if (!this.data.showMenuButton || this.data.showMyColors) {
			this.setData({showMenuButton: true, showMyColors: false});
		}
		this.sandTable.resetSandSourcePnt();
		wx.navigateTo({
			url: '/pages/colorpicker/colorpicker',
		})
	},
	onLongPressColorPicker: function(event) {
		this.resetMyColorsRect();
		this.setData({showMyColors: true});
	},
	onClickMenu: function(event) {
		this.sandTable.resetSandSourcePnt();
		this.setData({menuLeft: 0, showMyColors: false});
	},

	onClickMenuShadow: function(event) {
		this.setData({menuLeft: databus.screenWidth});
	},
	onClickAvatar: function() {
		wx.getUserProfile({
      desc: '展示作者头像昵称',
      success: (res) => {
				const userInfo = res.userInfo;
				const nickName = userInfo.nickName;
				const avatarUrl = userInfo.avatarUrl;
				wx.setStorageSync('userInfo', { nickName, avatarUrl});
				this.setData({avatarUrl});
      }
    })
	},

	onMenuAction: function(event) {
		//const index = event.currentTarget.dataset.index;
		const key = event.currentTarget.dataset.key;
		switch(key) {
			case '完成绘制':
				this.finishActionHandler();
				break;
			case '重新开始':
				this.restartActionHandler();
				break;
			case '横屏开始':
			case '竖屏开始':
				this.switchScreenActionHandler();
				break;
			case '我的作品':
				this.mySandPaintingActionHandler();
				break;
			case '沙子照片':
				this.photoSandPaintingActionHandler();
				break;
			case '最新作品':
				this.newestSandPaintingActionHandler();
				break;
			case '热门作品':
				this.hotActionHandler();
				break;
			case '设置':
				this.settingActionHandler();
				break;
			case '帮助':
				this.helpActionHandler();
				break;
		}
	},

	finishActionHandler: async function() {
		if (!this.sandTable.fullSandPile) {
			const confirm = await confirmMessage('提示', '确认绘制结束?')
			if (!confirm) {
				return;
			}
		}
		this.finishSandTable();
	},

	finishSandTable: async function() {
		wx.showLoading({title: '正在保存'});
	
		let canvas = this.sandTable.canvas;
		if (databus.horizontal) {
			this.rotateImage.draw(this.sandTable.img);
			canvas = this.rotateImage.canvas;
		}

		const { tempFilePath } = await new Promise((resolve, reject) => {
			wx.canvasToTempFilePath({
				canvas,
				fileType: 'jpg',
				quality: 0.5,
				success: resolve,
				fail: wrapReject(reject, '生成图片失败，请重试'),
			}, this)
		});
		
		const { savedFilePath } = await new Promise((resolve, reject) => {
			const fs = wx.getFileSystemManager()
			fs.saveFile({
				tempFilePath,
				success: resolve,
				fail: wrapReject(reject, '保存本地失败，请重试'),
			});
		});

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

		databus.reset()
		this.sandTable.reset();
		this.data.menuActions[3].tip = '../../images/new-msg.png';
		this.setData({menuActions: this.data.menuActions});
		wx.hideLoading();
	},

    restartActionHandler: async function() {
		const confirm = await confirmMessage('提示', '确认重新开始?')
		if (!confirm) {
			return;
		}
		databus.reset()
		this.sandTable.reset();
		this.setData({menuLeft: databus.screenWidth});
    },

    switchScreenActionHandler: function() {
		databus.horizontal = !databus.horizontal;
		databus.reset()
		this.sandTable.switchScreen(databus.horizontal)

		this.data.menuActions[2].key = databus.horizontal ? '竖屏开始' : '横屏开始';
		this.setData({
			menuLeft: databus.screenWidth, 
			menuActions: this.data.menuActions, 
			clrPickBtnPntIndex: databus.horizontal*2,
			menuBtnPntIndex: (this.data.menuBtnPntIndex+1)%2,
		});
    },

	mySandPaintingActionHandler: function() {
		this.data.menuActions[3].tip = null;
		this.setData({menuLeft: databus.screenWidth, menuActions: this.data.menuActions});

		wx.navigateTo({
			url: '/pages/mysandpaintings/mysandpaintings',
		})
    },

    photoSandPaintingActionHandler: function() {
		this.setData({menuLeft: databus.screenWidth});
		wx.navigateTo({url: '/pages/photosandpainting/photosandpainting'})
	},

	newestSandPaintingActionHandler: function() {
		this.setData({menuLeft: databus.screenWidth});
		wx.navigateTo({url: '/pages/newestsandpaintings/newestsandpaintings'})
	},
	
    hotActionHandler: function() {
		this.setData({menuLeft: databus.screenWidth});
		wx.navigateTo({url: '/pages/hotsandpaintings/hotsandpaintings'})
	},

    settingActionHandler: function() {
		this.setData({menuLeft: databus.screenWidth});
		wx.navigateTo({url: '/pages/setting/setting'})
	},

    helpActionHandler: function() {
		this.setData({menuLeft: databus.screenWidth});
		wx.navigateTo({url: '/pages/help/help'})
	},
	onClickAddColor: function(res) {
		if (hasColors(databus.myColors, databus.pickerRgbs)) {
			wx.showToast({title: '颜色已经存在', icon:"none"})
			return
		}

		databus.myColors.push([...databus.pickerRgbs]);
		wx.setStorageSync('databus.myColors', databus.myColors)
		
		this.data.myColors.push({rgbs: [...databus.pickerRgbs], id: colorsId(databus.pickerRgbs), radius: 25});
		this.setData({myColors: this.data.myColors});
		this.resetMyColorsRect();
	},
	onDeleteMyColor: function(res) {
		const {index} = res.detail;

		databus.myColors.splice(index, 1);
		wx.setStorageSync('databus.myColors', databus.myColors)

		this.data.myColors.splice(index, 1);
		this.setData({myColors: this.data.myColors});
		this.resetMyColorsRect();
	},
	onClickMyColor: function(res) {
		const index = res.detail.index;
		const rgbs = this.data.myColors[index].rgbs;
		databus.resetPickerRgbs(rgbs);
		this.setData({showMyColors: false});
	},
	resetMyColorsRect: function(res) {
		const count = databus.myColors.length + 1;
		const cell = 50 + 2 * 8;
		if (databus.horizontal) {
			const maxCellNum = 6;
			const width = Math.ceil(count / maxCellNum) * cell;
			const height = count <= maxCellNum ? count * cell : maxCellNum * cell;
			const top = (databus.screenHeight -  height)/2;
			const left = (databus.screenWidth -  width)/2;
			const layout = 'column-reverse';
			this.setData({
				myColorsRect: {
					height, width, top, left, layout
				}
			})
		} else {
			const maxCellNum = 4;
			const height = Math.ceil(count / maxCellNum) * cell;
			const width = count <= maxCellNum ? count * cell : maxCellNum * cell;
			const top = (databus.screenHeight -  height)/2;
			const left = (databus.screenWidth -  width)/2;
			const layout = 'row';
			this.setData({
				myColorsRect: {
					height, width, top, left, layout
				}
			})
		}
	},

	onShareAppMessage: function (res) {
		return {
			title: '用沙子绘出多彩美图',
			imageUrl: defaultShareImage(),
		}
	},

	onShareTimeline: function (res) {
		return {
			title: '用沙子绘出多彩美图',
			imageUrl: defaultShareImage(),
		}
	}
})