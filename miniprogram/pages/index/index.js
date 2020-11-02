// miniprogram/pages/index/index.js
import SandTable from '../../rendering/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		clrPickBtnRadius: 25,
		clrPickBtnPnts: [{x: databus.screenWidth - 70, y: 70}, {x: databus.screenWidth - 70, y: databus.screenHeight - 100}],
		clrPickBtnPntIndex: 0,
		showMenu: false,
		menuActions: [
			{icon: "../../images/finish.png", key:"完成绘制"},
			{icon: "../../images/restart.png", key:"重新开始"},
			{icon: "../../images/landscape.png", key:"横屏开始"},
			{icon: "../../images/my.png", key:"我的沙绘"},
			{icon: "../../images/picture.png", key:"照片沙绘"},
			{icon: "../../images/fire.png", key:"热门沙绘"},
			{icon: "../../images/setting.png", key:"设置"},
			{icon: "../../images/help.png", key:"帮助"},
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
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

	initSandTable: function(res) {
		const canvas = res.node;
		this.sandTable = new SandTable({canvas});
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
				this.photoSandPaintingActionHandler();
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
		wx.getUserInfo({
			success: function(res) {
			  const userInfo = res.userInfo;
			  const nickName = userInfo.nickName;
			  const avatarUrl = userInfo.avatarUrl;
			  
			  console.log(nickName, avatarUrl)
			},
			fail: function(res) {
				// TODO 保存到本地
			}
		  })
	},

    restartActionHandler: function() {
		databus.reset()
		this.sandTable.reset();
    },

    horizontalScreenRestartActionHandler: function() {
      console.log('------横批开始')
    },

    mySandPaintingActionHandler: function() {
      console.log('------我的沙绘')
    },

    photoSandPaintingActionHandler: function() {
      console.log('------照片沙绘')
	},
	
    hotActionHandler: function() {
		console.log('------月度最受喜欢的沙绘')
	},

    settingActionHandler: function() {
		console.log('------设置')
	},

    helpActionHandler: function() {
      console.log('------帮助')
	},
	
	saveSandPainting(callback) {
		// const imgPath = this.sandTable.offScreenCanvas.toTempFilePathSync();
		// wx.cloud.uploadFile({
		//   cloudPath: guid() + '.png',
		//   filePath: imgPath,
		//   success: (res) => {
		// 	const db = wx.cloud.database()
		// 	db.collection('SandPainting').add({
		// 	  data: {
		// 		fileId: res.fileID,
		// 		createdAt: new Date().getTime(),
		// 	  },
		// 	  success: (res) => {
		// 		tryRun(callback);
		// 	  },
		// 	  fail: (err) => {
		// 		wx.showToast({
		// 		  icon: 'none',
		// 		  title: '新增记录失败'
		// 		})
		// 	  }
		// 	})
		//   },
		//   fail: (err) => {
		// 	wx.showToast({
		// 	  icon: 'none',
		// 	  title: '上传文件失败'
		// 	})
		//   }
		// })
	},
})