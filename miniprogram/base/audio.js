let instance

export default class Audio {
	constructor() {
		if ( instance ) {
			return instance
		}
	
		instance = this
		this.init();
	}
	
	init() {
		this.playing = false;
		this.iac = wx.createInnerAudioContext()
		this.iac.loop = true
		this.iac.src = '/audio/bg.mp3';
	}

	play() {
		if (this.playing) {
			return;
		}
		this.playing = true;
		this.iac.play();
	}

	pause() {
		if (!this.playing) {
			return;
		}
		this.playing = false;
		this.iac.pause();
	}
}