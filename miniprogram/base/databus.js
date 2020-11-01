import Pool from './pool'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this
    this.init()
  
    // this.tryRecoveryProgress();
  }

  init() {
    this.pool = new Pool()

    const sysInfo = wx.getSystemInfoSync()
    this.screenWidth  = sysInfo.windowWidth
    this.screenHeight = sysInfo.windowHeight

    this.frame      = 0
    this.score      = 0
    this.animations = []
    this.gameOver   = false
    this.sandFrame  = 0
    this.genSandNumInterval = [10, 50]
    this.overlayAlpha = 0.08;
    this.backGroundRgba = [214, 214, 214, 255]
  }

  reset(){
    this.sandFrame = 0
  }

  saveProgress() {
    wx.setStorageSync('databus', {sandFrame: this.sandFrame})
  }

  tryRecoveryProgress() {
    const databus = wx.getStorageSync('databus')
    if (databus&&databus.sandFrame) {
      this.sandFrame = databus.sandFrame
    }
  }
}
