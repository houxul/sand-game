import DataBus from '../base/databus'
import {hslToRgb, rgbToStr, tryRun, genRgb, strToAb, abToStr} from '../base/utils'
let databus = new DataBus()

export default class ColorPicker {
    constructor(ctx) {
	  this.ctx = ctx

	  this.btnAreaY = databus.screenHeight - 100
	  
      this.switchCircle = {
        x: 50,
        y: (databus.screenHeight + this.btnAreaY)/2,
        radius: 15,
        colors: [[0,0,0], [255,255,255],[0,0,0],[255,255,255],[0,0,0]]
	  }
	  
      this.displayCircle = {
        x: databus.screenWidth - 50,
        y: (databus.screenHeight + this.btnAreaY)/2,
        radius: 30,
        colors: databus.pickerRgbs
      }

	  this.drawToCanvas(ctx);
    }

    drawToCanvas(ctx) {
		this.drawBackGround(ctx);
        this.drawCircle(ctx, this.switchCircle);
        this.drawCircle(ctx, this.displayCircle);
    }

    drawCircle(ctx, circle) {
      for (let i = circle.colors.length - 1; i>=0; i--) {
        const item = circle.colors[i];
        ctx.beginPath(); 
        ctx.arc(circle.x, circle.y, (i+1)*circle.radius/circle.colors.length, 0, 2*Math.PI, false); 
        ctx.fillStyle= rgbToStr(item); 
        ctx.closePath(); 
        ctx.fill();
      }
    }

    drawBackGround(ctx) {
		const img = ctx.createImageData(databus.screenWidth, this.btnAreaY)
		const imgData = img.data;

		const bufferStr = wx.getStorageSync('colorpicker.background');
		if (bufferStr) {
			const buffer = strToAb(bufferStr)
			const dataArray = new Uint8ClampedArray(buffer)
			for (let i=0; i<dataArray.length; i++) {
			  imgData[i]=dataArray[i]
			}
		} else {
			const hslX = 360 / databus.screenWidth
			const hslY = 100 / this.btnAreaY
			for (let x=0; x< databus.screenWidth; x++) {
				for (let y = 0; y < this.btnAreaY; y++) {
					const rgb = hslToRgb(x*hslX, 100, y*hslY);
					this.setImgData(imgData, x, y, [...rgb, 255])
				}
			}
			wx.setStorageSync('colorpicker.background', abToStr(imgData.buffer));
		}
		ctx.putImageData(img, 0, 0);

		const grd = ctx.createLinearGradient(0, this.btnAreaY, 0, databus.screenHeight)
		grd.addColorStop(0, "rgb(255,255,255)")
		grd.addColorStop(1, "rgb(0,0,0)")
		ctx.fillStyle = grd
		ctx.fillRect(0, this.btnAreaY, databus.screenWidth, databus.screenHeight-this.btnAreaY)

	}
	
	setImgData(imgData, x, y, rgba) {
		const dataIndex = 4 * (y * databus.screenWidth  + x)
		imgData[dataIndex] = rgba[0]
		imgData[dataIndex + 1] = rgba[1]
		imgData[dataIndex + 2] = rgba[2]
		imgData[dataIndex + 3] = rgba[3]
	}
    
    onClick = ((x, y) => {
      if (this.inCircle(x, y, this.displayCircle)) {
        tryRun(this.exitPageCallball)
        return true
      }

      if (this.inCircle(x, y, this.switchCircle)) {
        const colorNum = Math.floor(Math.random()*5)+2;
        const colors = []
        for (let i=0; i<colorNum; i++) {
          colors.push(genRgb())
        }
        this.updateDisplayCircleColors(colors)
        return true
      }

      const imgData = this.ctx.getImageData(x, y, 1, 1)
      this.updateDisplayCircleColors([[...imgData.data]])
      return true
    }).bind(this)
  
    inCircle(x, y, circle) {
      const {x: pntX, y: pntY} = circle
      if ((x-pntX)*(x-pntX) + (y-pntY)*(y-pntY) > circle.radius*circle.radius) {
        return false
      }
  
      return true
    }

    updateDisplayCircleColors(colors) {
		this.displayCircle.colors.splice(0, this.displayCircle.colors.length)
		this.displayCircle.colors.push(...colors)
		this.drawCircle(this.ctx, this.displayCircle);
	}
}
  