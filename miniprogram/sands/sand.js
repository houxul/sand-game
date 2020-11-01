import DataBus from '../base/databus'

let databus = new DataBus()

export default class Sand {
  init(x, y, rgb, down) {
    this.rgb = rgb

    const xRandom = Math.random() * 10 - 5
    this.x = x + xRandom
    this.y= y + Math.random() * 20 - 6
    this.vx = Math.random() * 1.5;
    if (xRandom > 0)  {
      this.vx  = - this.vx
    }

    this.vy = (down ? 7 : -7) * Math.random();
    this.acceleration = 0.65

    this.update();
  }

  get curX() {
    return Math.floor(this.x)
  }

  get curY() {
    return Math.floor(this.y)
  }

  update() {
    this.preX = this.curX;
    this.preY = this.curY;

    if ( this.x + this.vx > databus.screenWidth -1 ){
      this.x = databus.screenWidth -1
    } else if (this.x + this.vx < 0) {
      this.x = 0
    } else {
      this.x += this.vx;
    }

    this.vy = this.vy + this.acceleration
    this.y += this.vy;
  }
}