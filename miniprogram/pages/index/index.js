// miniprogram/pages/index/index.js
import SandTable from '../../rendering/sandtable'
import DataBus from '../../base/databus'
import RoundButton from '../../rendering/roundbutton'
import ImageButton from '../../rendering/imagebutton'

let databus = new DataBus()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		clrPickBtnRadius: 25,
		clrPickBtnPnts: [{x: databus.screenWidth - 50, y: 100}, {x: databus.screenWidth - 50, y: databus.screenHeight - 100}],
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
		.node(this.initCanvas.bind(this)).exec();
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

	updateCanvas: function() {
		this.sandTable.genSand();
		this.sandTable.update();
	},

	randerCanvas: function() {
		this.ctx.clearRect(0, 0, databus.screenWidth, databus.screenHeight)
		this.sandTable.drawToCanvas(this.ctx);
		this.colorPickerBtn.drawToCanvas(this.ctx);
		this.menuBtn.drawToCanvas(this.ctx);
	},
	
	initCanvasSize: function(canvas) {
		canvas.width = databus.screenWidth
		canvas.height = databus.screenHeight
	},

	initCanvas: function(res) {
		const canvas = res.node;
		this.ctx = canvas.getContext('2d');

		this.initCanvasSize(canvas);
		
		const img = this.ctx.createImageData(databus.screenWidth, databus.screenHeight)
		this.sandTable = new SandTable(img);

		this.colorPickerBtn = new RoundButton({
			radius: this.data.clrPickBtnRadius,
			rgbs: databus.pickerRgbs,
			centre: this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex],
		})

		this.menuBtn = new ImageButton({
			x: 40,
			y: 79,
			width: 40,
			height: 40,
			canvas: canvas,
			imgSrc: `../../images/menu${Math.floor(Math.random()*6)}.png`
		})
		
		this.bindLoop = (() => {
			this.updateCanvas()
			this.randerCanvas()
		
			canvas.requestAnimationFrame(this.bindLoop);
		}).bind(this);
		canvas.requestAnimationFrame(this.bindLoop);
	},

	touchStartHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.isButtonInside(x, y)) {
			return;
		}

		this.sandTable.touchStartHandler(x, y);
	},

	touchMoveHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.isButtonInside(x, y)) {
			this.setData({clrPickBtnPntIndex: (this.data.clrPickBtnPntIndex+1)%2})
			this.colorPickerBtn.updateCentre(this.data.clrPickBtnPnts[this.data.clrPickBtnPntIndex]);
			return;
		}
		this.sandTable.touchMoveHandler(x, y);
	},

	touchEndHandler: function(event) {
		const {clientX:x, clientY:y} = event.changedTouches[0];
		if (this.isButtonInside(x, y)) {
			this.sandTable.resetSandSourcePnt();
			return;
		}
		this.sandTable.touchEndHandler(x, y);
	},

	tapHandler: function(event) {
		const {clientX:x, clientY:y} = event.touches[0];
		if (this.menuBtn.inside(x, y)) {
			this.sandTable.resetSandSourcePnt();
			this.setData({showMenu: true});
		}
		if (this.colorPickerBtn.inside(x, y)) {
			wx.navigateTo({
				url: '/pages/colorpicker/colorpicker',
			})
		}
	},

	isButtonInside: function(x, y) {
		return this.menuBtn.inside(x, y) || this.colorPickerBtn.inside(x, y);
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