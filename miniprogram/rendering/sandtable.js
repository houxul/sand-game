import DataBus from '../base/databus'
import Sand from '../base/sand'
import { abToStr, strToAb, tryRun, rgbToStr } from '../base/utils'

let databus = new DataBus()

export default class SandTable {
  constructor(img) {
    this.img = img
    this.imgData = this.img.data.fill(214)

    this.sands = []
    this.sandPileSideline = new Array(this.img.width).fill(this.img.height);

    this.imgAlpha = this.alphaOverlay(1, databus.overlayAlpha) * 255
    this.genSandNum = (databus.genSandNumInterval[1] - databus.genSandNumInterval[0])/2
    this.autoMoveSpeed = 0
    this.touchMovePnts = [] 
  }


  reset() {
    this.sandPileSideline.fill(this.img.height)
    this.imgData.fill(214)

    this.genSandNum = (databus.genSandNumInterval[1] + databus.genSandNumInterval[0])/2
    this.autoMoveSpeed = 0
  }

  saveProgress() {
    const imgDataBuffer = abToStr(this.imgData.buffer)
    wx.setStorageSync('sandtable.sandPileSideline', this.sandPileSideline)
    wx.setStorageSync('sandtable.imgDataBuffer', imgDataBuffer)
  }

  tryRecoveryProgress() {
    const sandPileSideline = wx.getStorageSync('sandtable.sandPileSideline')
    const imgDataBuffer = wx.getStorageSync('sandtable.imgDataBuffer')
    if (sandPileSideline &&imgDataBuffer) {
      this.sandPileSideline = sandPileSideline
      const buffer = strToAb(imgDataBuffer)
      const dataArray = new Uint8ClampedArray(buffer)
      for (let i=0; i<dataArray.length; i++) {
        this.imgData[i]=dataArray[i]
      }
    }
  }

  isCrossSandPileSideline(x,y) {
    return this.sandPileSideline[x] <= y
  }

  tryAddSandToSandPile(sand) {
    if (!this.isCrossSandPileSideline(sand.preX, sand.preY)) {
      this.setImgData(sand.preX, sand.preY, [214, 214, 214, 214]);
    }

    // if (sand.crossBorder) {
    //   return
    // }

    const sandX = sand.curX;
    const sandY = sand.curY;
    if (this.isCrossSandPileSideline(sandX, sandY)) {
      this.addSandToSandPile(sandX, sandY, sand.rgb)
      return true;
    }

    this.setImgData(sandX, sandY, [sand.rgb[0],sand.rgb[1],sand.rgb[2], 255]);
    return false;
  }

  addSandToSandPile(x,y, rgb) {
    const xLeft = x-1 >= 0 && this.sandPileSideline[x-1] > this.sandPileSideline[x];
    const xRight = x+1 < this.img.width && this.sandPileSideline[x+1] > this.sandPileSideline[x];
    if (xLeft && xRight) {
      const rdm = Math.random();
      const xDir = rdm > 0.5 ? 1 : -1;
      this.addSandToSandPile(x+xDir, y, rgb)
      return;
    } else if (xLeft) {
      this.addSandToSandPile(x-1, y, rgb)
      return
    } else if (xRight) {
      this.addSandToSandPile(x+1, y, rgb)
      return
    }

    y = this.sandPileSideline[x] -1
    const overlayRgb = Math.floor( Math.random() * 256 );
    const rgba = [this.rgbOverlay(rgb[0], overlayRgb, 1, databus.overlayAlpha), 
    this.rgbOverlay(rgb[1], overlayRgb, 1, databus.overlayAlpha), 
    this.rgbOverlay(rgb[2], overlayRgb, 1, databus.overlayAlpha), this.imgAlpha]
    this.setImgData(x, y, rgba)
    this.sandPileSideline[x] -= 1
  }

  setImgData(x, y, rgba) {
    if (y < 0) {
      return
    }
    const dataIndex = 4 * (y * this.img.width  + x)
    this.imgData[dataIndex] = rgba[0]
    this.imgData[dataIndex + 1] = rgba[1]
    this.imgData[dataIndex + 2] = rgba[2]
    this.imgData[dataIndex + 3] = rgba[3]
  }

  genSand() {    
    if (!this.touchPoint) {
      return
    }
    let {x, y} = this.touchPoint;
    x = Math.floor(x)
    y = Math.floor(y)
    const cross = this.isCrossSandPileSideline(x, y)
    y = cross ? this.sandPileSideline[x] -1 : y
    const genSandNum = this.genSandNum + Math.floor(Math.random()*20)
    const rgb = databus.sandFrameColor
    for (let i=0; i<genSandNum; i++) {
      const sand = databus.pool.getItemByClass('sand', Sand)
      sand.init(x, y, rgb, !cross)
      this.sands.push(sand)
    }
  }

  update() {    
    if (this.touchPoint && this.autoGenSand) {
      this.touchPoint.x += this.autoMoveSpeed;
      if (this.touchPoint.x > this.img.width) {
        this.touchPoint.x = 3
      } 
      if (this.touchPoint.x < 0) {
        this.touchPoint.x = this.img.width - 3
      }
    } 

    for (let i = this.sands.length-1; i >= 0; i--) {
      const item = this.sands[i]
      item.update()
      if (this.tryAddSandToSandPile(item)) {
        this.sands.splice(i, 1)
        databus.pool.recover('sand', item)
      }
    }
  }

  drawToCanvas(ctx) {
    ctx.putImageData(this.img, 0, 0);
  }

  rgbOverlay(c1, c2, a1, a2) {
    return (c1*a1 + c2*a2 -c1*a1*a2)/(a1+a2-a1*a2)
  }

  alphaOverlay(a1, a2) {
    return a1+a2-a1*a2;
  }

  touchStartHandler(x, y) {
    this.touchMovePnts.splice(0, this.touchMovePnts.length);
    if (this.autoGenSand) {
      return true
    }
    this.touchPoint = {x, y}
    tryRun(this.genSandStartCallback)
    return true
  }

  touchMoveHandler(x, y) {
    if (this.autoGenSand) {
      if (this.touchMovePnts.length > 50) {
        this.touchMovePnts.shift();
      }
      this.touchMovePnts.push({x, y})
      return true
    }

    this.touchPoint = {x, y}
    return true
  }

  touchEndHandler(x, y) {
    if (new Date().getTime() - this.touchTime < 500) {
      this.touchTime = new Date().getTime();
      this.autoGenSand = true
      this.autoMoveSpeed = 0
      return true
    }

    const touchDir = this.touchDirection()
    if (this.autoGenSand) {
      if (touchDir == 2 || touchDir == 4) {
        if ((this.autoMoveSpeed > 0 && touchDir == 4) || (this.autoMoveSpeed < 0 && touchDir == 2)) {
          this.autoMoveSpeed = 0
        }
        this.autoMoveSpeed += (this.touchMovePnts[this.touchMovePnts.length-1].x - this.touchMovePnts[0].x)*5/this.img.width
        return true
      }

      if (touchDir == 1 || touchDir == 3) {
        this.genSandNum += (this.touchMovePnts[this.touchMovePnts.length-1].y - this.touchMovePnts[0].x)*15/(databus.genSandNumInterval[1]-databus.genSandNumInterval[0])
        if (this.genSandNum > databus.genSandNumInterval[1]) {
          this.genSandNum = databus.genSandNumInterval[1]
        }
        if (this.genSandNum < databus.genSandNumInterval[0]) {
          this.genSandNum = databus.genSandNumInterval[0]
        }
        return true
      }
    }

    tryRun(this.genSandEndCallback)
    this.touchTime = new Date().getTime();
    this.touchPoint = null
    this.autoGenSand = false
    return true
  }

  touchDirection() {
    let [xDirection, yDirection] = [0, 0]
    let [xInvalidDirection, yInvalidDirection] = [false, false]
    for (let i=5; i<this.touchMovePnts.length; i+=5) {
      if (xInvalidDirection && yInvalidDirection) {
        return 0
      } 
      const {x,y} = this.touchMovePnts[i]
      const {x:preX, y:preY} = this.touchMovePnts[i-5]
      
      const xMove = (x-preX)
      if (!xInvalidDirection && xMove != 0) {
        if (xDirection == 0) {
          xDirection = xMove > 0 ? 1 : -1 
        } else if (xMove*xDirection < 0) {
          xInvalidDirection = true
        }
      }

      const yMove = (y-preY)
      if (!yInvalidDirection && yMove != 0) {
        if (yDirection == 0) {
          yDirection = yMove > 0 ? 1 : -1 
        } else if (yMove*yDirection < 0) {
          yInvalidDirection = true
        }
      }
    }

    if (!xInvalidDirection&&!yInvalidDirection) {
      if (this.touchMovePnts.length < 10) {
        return 0
      }
      xInvalidDirection = (this.touchMovePnts[this.touchMovePnts.length-1].x - this.touchMovePnts[0].x)*xDirection <
      (this.touchMovePnts[this.touchMovePnts.length-1].y - this.touchMovePnts[0].y)*yDirection
    }

    if (!xInvalidDirection) {
      return xDirection > 0 ? 2 : 4
    }
    return yDirection > 0 ? 3 : 1
  }
}