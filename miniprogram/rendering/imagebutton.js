export default class ImageButton {
	constructor(options) {
		this.isLoad = false;

		const img = options.canvas.createImage();
		img.onload = (e) => {
			this.isLoad = true;
		}
		img.onerror = (e) => {
			wx.showToast({title: 'load img err:' + e})
		}
		img.src = options.imgSrc
		this.img = img;

		this.width  = options.width
		this.height = options.height

		this.x = options.x
		this.y = options.y
	}
  
	drawToCanvas(ctx) {
		if (!this.isLoad) {
			return;
		}
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
	}
  
	inside(x, y) {
		return (x > this.x) && (x < this.x + this.width) && (y > this.y) && (y < this.y + this.height);
	}
}
  