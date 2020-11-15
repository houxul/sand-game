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
    this.screenWidth  = sysInfo.screenWidth
    this.screenHeight = sysInfo.screenHeight

    this.windowWidth  = sysInfo.windowWidth
    this.windowHeight = sysInfo.windowHeight

    this.gameOver   = false
    this.sandFrame  = 0
    this.autoDownSandFrame = 0;
    this.genSandNum = 30;
    this.overlayAlpha = 0.08;
    this.pickerRgbs = [genRgb(), genRgb(), genRgb(), genRgb()]
    this.pickerLinearGradient = new Array(2000)
    this.resetPickerLinearGradient()
    this.horizontal = false;
    this.colorChangeSpeed = 50;
    this.autoDownSand = true;
    this.bgRgba = [214, 214, 214, 214];
    this.movementTrack = [];
    this.resetMovementTrack();

    this.default = {
      bgRgba: this.bgRgba,
    }

    this.loadSetting();
  }

  reset(){
    this.sandFrame = 0
    this.autoDownSandFrame = 0;
  }

  // saveProgress() {
  //   wx.setStorageSync('databus', {sandFrame: this.sandFrame})
  // }

  // tryRecoveryProgress() {
  //   const databus = wx.getStorageSync('databus')
  //   if (databus&&databus.sandFrame) {
  //     this.sandFrame = databus.sandFrame
  //   }
  // }

  loadSetting() {
    const load = (function(key) {
      const value = wx.getStorageSync('databus.'+key)
      if (value == "" || value == undefined || value == null) {
        return;
      }
      Reflect.set(this, key, value)
    }).bind(this);

    load('colorChangeSpeed');
    load('autoDownSand');
    load('bgRgba');
    load('genSandNum');
    load('movementTrack');

    // const info = wx.getStorageInfoSync();
    // console.log('-------------', info);
  }

  updateSetting(options) {
    for (const item in options) {
      Reflect.set(this, item, options[item])
      wx.setStorageSync('databus.' + item, options[item])
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
    return this.pickerLinearGradient[Math.floor(this.sandFrame * this.colorChangeSpeed/1600) % (this.pickerLinearGradient.length)]
  }

  get autoDownSandFramePnt() {
    this.autoDownSandFrame++ 
    const track = this.movementTrack[this.autoDownSandFrame%this.movementTrack.length];
    return {x: track[0], y:track[1]};
  }

  resetMovementTrack() {
    this.movementTrack.splice(0, this.movementTrack.length);
    const arcHeight = this.screenWidth/2;
		for (let i=0; i< this.screenHeight; i++) {
      this.movementTrack.push([arcHeight * (Math.sin(4*i/arcHeight)+1), i]);
    }
  }
}
