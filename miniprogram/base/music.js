let instance

export default class Music {
	constructor() {
		if ( instance )
			return instance

		instance = this

		this.bgmAudio = new Audio()
		this.bgmAudio.loop = true
		this.bgmAudio.src	= 'audio/bg.wav'

		this.play()
	}

	play() {
		this.bgmAudio.play()
	}

	pause() {
		this.bgmAudio.pause()
	}
}
