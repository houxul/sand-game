// miniprogram/pages/index/index.js
import SandTable from '../../rendering/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'
import GenImage from '../../rendering/genimage'
import ColorBoard from '../../rendering/colorboard'
import { guid, rgbToStr, hasColors, colorsId } from '../../base/utils'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		screenWidth: databus.screenWidth,
		screenHeight: databus.screenHeight,
		genImageWidth: databus.screenWidth,
		genImageHeight: databus.screenHeight,
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

		const myColors = databus.myColors.map((item) => {
			return {rgbs: item, radius: 25, id: colorsId(item)};
		})
		this.setData({myColors, useColorBoard: !wx.getStorageSync('colorboard')})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		wx.createSelectorQuery()
		.select('#genimage')
		.node(this.initGenImage.bind(this)).exec();

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

	initGenImage: function(res) {
		const canvas = res.node;
		this.genImage = new GenImage({canvas});
	},

	initSandTable: function(res) {
		const canvas = res.node;
		this.sandTable = new SandTable({canvas});

		this.sandTable.genSandStartCallback = (function() {
			this.setData({showMenuButton: false, showMyColors: false});
		}).bind(this)

		this.sandTable.genSandEndCallback = (function() {
			if (!this.data.showMenuButton) {
				this.setData({showMenuButton: true});
			}
		}).bind(this)

		this.sandTable.sandToSandPileCallback = (function(x, y, rgb) {
			this.genImage.update(x, y, rgb)
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
		this.setData({showMyColors: true});
		this.resetMyColorsRect();
	},
	onClickMenu: function(event) {
		this.sandTable.resetSandSourcePnt();
		this.setData({menuLeft: 0, showMyColors: false});
	},

	onClickMenuShadow: function(event) {
		this.setData({menuLeft: databus.screenWidth});
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
		if (!this.sandTable.fullSandPile) {
			wx.showModal({
				content: '确认绘制结束?',
				success: (res) => {
					if (!res.confirm) {
						return
					}
					this.finishSandTable();
				}
			});
			return;
		}
		this.finishSandTable();		
	},

	finishSandTable: function() {
		wx.showLoading({title: '正在保存'});
		const finishCallback = (function() {
			databus.reset()
			this.sandTable.reset();
			this.data.menuActions[3].tip = '../../images/new-msg.png';
			this.setData({menuActions: this.data.menuActions});
			wx.hideLoading();
		}).bind(this);
	
		if (!this.sandTable.fullSandPile) {
			this.genImage.updateBg(this.sandTable.sandPileSideline)
		}
		this.genImage.exec();
		let canvas = this.genImage.canvas;
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
		wx.showModal({
			content: '确认重新开始?',
			success: ((res) => {
				if (!res.confirm) {
					return
				}
				
				databus.reset()
				this.sandTable.reset();
				this.genImage.reset();
				this.setData({menuLeft: databus.screenWidth});
			}).bind(this)
		});
    },

    horizontalScreenRestartActionHandler: function() {
		databus.horizontal = !databus.horizontal;
		databus.reset()
		this.sandTable.reset();
		this.genImage.reset();

		this.data.menuActions[2].key = databus.horizontal ? '竖屏开始' : '横屏开始';
		this.setData({
			menuLeft: databus.screenWidth, 
			menuActions: this.data.menuActions, 
			clrPickBtnPntIndex: databus.horizontal*2,
			menuBtnPntIndex: (this.data.menuBtnPntIndex+1)%2,
			genImageWidth: databus.horizontal ? databus.screenHeight : databus.screenWidth,
			genImageHeight: databus.horizontal ? databus.screenWidth : databus.screenHeight,
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
	}
})