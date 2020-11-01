import Pool from './pool'
import { genRgb } from './utils'

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

    this.gameOver   = false
    this.sandFrame  = 0
    this.genSandNumInterval = [10, 50]
    this.overlayAlpha = 0.08;
    this.pickerRgbs = [genRgb(), genRgb(), genRgb(), genRgb()]
    this.pickerLinearGradient = new Array(1500)
    this.resetPickerLinearGradient()
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

  resetPickerLinearGradient() {
    this.sandFrame = 0
    const colors = this.pickerRgbs.concat([this.pickerRgbs[0]]);
    const step = this.pickerLinearGradient.length/this.pickerRgbs.length
    for (let i=0; i < this.pickerLinearGradient.length; i++) {
      const colorIndex = Math.floor(i/step)
      const percent = (i%step)/step
      const startColor = colors[colorIndex]
      const endColor = colors[colorIndex+1]
      const r = startColor[0] + (endColor[0] - startColor[0]) * percent
      const g = startColor[1] + (endColor[1] - startColor[1]) * percent
      const b = startColor[2] + (endColor[2] - startColor[2]) * percent
      this.pickerLinearGradient[i] = [r, g, b]
    }
  }

  get sandFrameColor() {
    this.sandFrame++
    return this.pickerLinearGradient[this.sandFrame % (this.pickerLinearGradient.length)]
  }
}
