// component/mycolor.js
import RoundButton from '../../rendering/roundbutton'
import { rgbToStr } from '../../base/utils'

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		index: Number,
		rgbs: Array,
		radius: Number,
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		showDelete: false,
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		onDelete: function(res) {
			this.triggerEvent('delete', {index: this.data.index, rgbs: this.data.rgbs}, {})
			this.setData({showDelete: false});
		}, 
		onLongPress: function(res) {
			this.setData({showDelete: true});
		},
		onClick: function(res) {
			this.triggerEvent('click', {index: this.data.index}, {})
		}
	},
	lifetimes: {
		attached: function() {
			const views = [];
			for (let i=0; i<this.data.rgbs.length; i++) {
				const step = this.data.radius/this.data.rgbs.length
				views.push({
					width: 2*(this.data.radius - i*step),
					height: 2*(this.data.radius - i*step),
					bg: rgbToStr(this.data.rgbs[i]),
					top: i * step,
					left: i * step,
				});
			}

			this.setData({views});
		},
		detached: function() {
			console.log('------------detached', this.data.index);
		}
	},

	initCanvas: function(res) {
		const canvas = res.node;
		new RoundButton({
			canvas,
			radius: this.data.radius,
			rgbs: this.data.rgbs,
		})
	}
})
