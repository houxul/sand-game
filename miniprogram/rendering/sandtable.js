import DataBus from '../base/databus'
import Sand from '../base/sand'
import { tryRun } from '../base/utils'

let databus = new DataBus()

export default class SandTable {
  constructor(options) {
    this.canvas = options.canvas;
    this.canvas.width = databus.screenWidth
		this.canvas.height = databus.screenHeight
    this.ctx = options.canvas.getContext('2d');
    
    this.img = this.ctx.createImageData(databus.screenWidth, databus.screenHeight);
    this.imgData = this.img.data;
    for (let i=0; i< this.imgData.length; i+=4) {
      this.imgData[i] = databus.bgRgba[0];
      this.imgData[i+1] = databus.bgRgba[1];
      this.imgData[i+2] = databus.bgRgba[2];
      this.imgData[i+3] = databus.bgRgba[3];
    }

    this.sands = []
    this.sandPileSideline = new Array(this.img.height > this.img.width ? this.img.height : this.img.width);
    if (databus.horizontal) {
      this.sandPileSideline.fill(this.img.width)
    } else {
      this.sandPileSideline.fill(this.img.height)
    }
    this.corssZeroLineNum = 0;

    this.imgAlpha = this.alphaOverlay(1, databus.overlayAlpha) * 255
    this.resetSandSourcePnt();

    this.bindLoop = (() => {
      this.genSand();
      this.update();
      this.draw();
		
			this.canvas.requestAnimationFrame(this.bindLoop);
		}).bind(this);
    this.canvas.requestAnimationFrame(this.bindLoop);
  }

  reset() {
    if (databus.horizontal) {
      this.sandPileSideline.fill(this.img.width)
    } else {
      this.sandPileSideline.fill(this.img.height)
    }
    this.corssZeroLineNum = 0;
    for (let i=0; i< this.imgData.length; i+=4) {
      this.imgData[i] = databus.bgRgba[0];
      this.imgData[i+1] = databus.bgRgba[1];
      this.imgData[i+2] = databus.bgRgba[2];
      this.imgData[i+3] = databus.bgRgba[3];
    }
  }

  updateBg() {
    if (databus.horizontal) {
      for (let i=0; i < this.img.height; i++) {
        for (let j=0; j< this.sandPileSideline[i]; j++) {
          this.setImgData(j, i, databus.bgRgba);
        }
      }
    } else {
      for (let i=0; i < this.img.width; i++) {
        for (let j=0; j< this.sandPileSideline[i]; j++) {
          this.setImgData(i, j, databus.bgRgba);
        }
      }
    }
  }

  // saveProgress() {
  //   const imgDataBuffer = abToStr(this.imgData.buffer)
  //   wx.setStorageSync('sandtable.sandPileSideline', this.sandPileSideline)
  //   wx.setStorageSync('sandtable.imgDataBuffer', imgDataBuffer)
  // }

  // tryRecoveryProgress() {
  //   const sandPileSideline = wx.getStorageSync('sandtable.sandPileSideline')
  //   const imgDataBuffer = wx.getStorageSync('sandtable.imgDataBuffer')
  //   if (sandPileSideline &&imgDataBuffer) {
  //     this.sandPileSideline = sandPileSideline
  //     const buffer = strToAb(imgDataBuffer)
  //     const dataArray = new Uint8ClampedArray(buffer)
  //     for (let i=0; i<dataArray.length; i++) {
  //       this.imgData[i]=dataArray[i]
  //     }
  //   }
  // }

  get fullSandPile() {
    if (databus.horizontal) {
      return (this.corssZeroLineNum == this.img.height)
    } else {
      return (this.corssZeroLineNum == this.img.width)
    }
  }

  isCrossSandPileSideline(x,y) {
    if (databus.horizontal) {
      return this.sandPileSideline[y] <= x
    }
    return this.sandPileSideline[x] <= y
  }

  tryAddSandToSandPile(sand) {
    if (!this.isCrossSandPileSideline(sand.preX, sand.preY)) {
      this.setImgData(sand.preX, sand.preY, databus.bgRgba);
    }

    if (sand.crossBorder) {
      return true
    }

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
    if (databus.horizontal) {
      const yLeft = y-1 >= 0 && this.sandPileSideline[y-1] > this.sandPileSideline[y];
      const yRight = y+1 < this.img.height && this.sandPileSideline[y+1] > this.sandPileSideline[y];
      if (yLeft && yRight) {
        const rdm = Math.random();
        const yDir = rdm > 0.5 ? 1 : -1;
        this.addSandToSandPile(x, y+yDir, rgb)
        return;
      } else if (yLeft) {
        this.addSandToSandPile(x, y-1, rgb)
        return
      } else if (yRight) {
        this.addSandToSandPile(x, y+1, rgb)
        return
      }
  
      x = this.sandPileSideline[y] -1
      const overlayRgb = Math.floor( Math.random() * 256 );
      const rgba = [this.rgbOverlay(rgb[0], overlayRgb, 1, databus.overlayAlpha), 
      this.rgbOverlay(rgb[1], overlayRgb, 1, databus.overlayAlpha), 
      this.rgbOverlay(rgb[2], overlayRgb, 1, databus.overlayAlpha), this.imgAlpha]
      this.setImgData(x, y, rgba)
      this.sandPileSideline[y] -= 1
    } else {
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

      if (this.sandPileSideline[x] == 0) {
        this.corssZeroLineNum++;
      }
    }
  }

  setImgData(x, y, rgba) {
    if (x<0 || y < 0) {
      return
    }
    const dataIndex = 4 * (y * this.img.width  + x)
    this.imgData[dataIndex] = rgba[0]
    this.imgData[dataIndex + 1] = rgba[1]
    this.imgData[dataIndex + 2] = rgba[2]
    this.imgData[dataIndex + 3] = rgba[3]
  }

  genSand() {
    if (this.fullSandPile) {
      this.resetSandSourcePnt();
      tryRun(this.genSandEndCallback);
      return;
    }

    if (!this.movePnts.length && !this.sandSourcePnt) {
      return
    }

    let sandSourcePnt = this.sandSourcePnt;
    if (this.movePnts.length) {
      sandSourcePnt = this.movePnts.shift();
    }
    let {x, y} = sandSourcePnt;
    x = Math.floor(x)
    y = Math.floor(y)
    let cross = false;
    if (databus.horizontal) {
      cross = this.sandPileSideline[y] <= x
      x = cross ? this.sandPileSideline[y] -1 : x
    } else {
      cross = this.sandPileSideline[x] <= y
      y = cross ? this.sandPileSideline[x] -1 : y
    }
    for (let i=0; i<databus.genSandNum; i++) {
      const sand = databus.pool.getItemByClass('sand', Sand)
      sand.init(x, y, databus.sandFrameColor, !cross)
      this.sands.push(sand)
    }

    if (this.autoGenSand) {
      this.sandSourcePnt = databus.autoDownSandFramePnt;
    }
  }

  update() {
    for (let i = this.sands.length-1; i >= 0; i--) {
      const item = this.sands[i]
      item.update()
      if (this.tryAddSandToSandPile(item)) {
        this.sands.splice(i, 1)
        databus.pool.recover('sand', item)
      }
    }
  }


  draw() {
    this.ctx.putImageData(this.img, 0, 0);
  }

  rgbOverlay(c1, c2, a1, a2) {
    return (c1*a1 + c2*a2 -c1*a1*a2)/(a1+a2-a1*a2)
  }

  alphaOverlay(a1, a2) {
    return a1+a2-a1*a2;
  }

  touchStartHandler(x, y) {
    if (this.autoGenSand) {
      this.autoGenSand = false;
    }
    this.sandSourcePnt = {x, y};
    tryRun(this.genSandStartCallback)
    return true
  }

  touchMoveHandler(x, y) {
    this.sandSourcePnt = {x, y};
    this.movePnts.push({x, y});
    return true
  }

  touchEndHandler(x, y) {
    this.sandSourcePnt = undefined;
    const lastTouchTime = this.lastTouchTime;
    this.lastTouchTime = new Date().getTime();
    if (databus.autoDownSand && (new Date().getTime() - lastTouchTime < 500)) {
      this.autoGenSand = true;
      this.sandSourcePnt = databus.autoDownSandFramePnt;
      return true
    }
 
    tryRun(this.genSandEndCallback)
    return true
  }

  /* touchDirection() {
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
  }*/

  resetSandSourcePnt() {
    this.movePnts = [];
    this.sandSourcePnt = undefined;
    this.autoGenSand = false;
  }
}