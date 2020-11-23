
export function genRgb() {
    return [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];
}

export function rgbToStr(rgb) {
	return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

export function rgbToHex(rgb) {
	const ff = function(num) {
		let str = num.toString(16)
		if (str.length == 1) {
			str = '0' + str
		}
		return str
	}
	return '#' + ff(rgb[0]) + ff(rgb[1]) + ff(rgb[2]);
}

export function strToRgb(str) {
	return str.split('(')[1].split(')')[0].split(',').map(item => parseInt(item));
}

export function hslToRgb(h,s,l){
	h=h/360;
	s=s/100;
	l=l/100;
	const rgb=[];
	const q=l>=0.5?(l+s-l*s):(l*(1+s));
	const p=2*l-q;
	rgb[0]=h+1/3;
	rgb[1]=h;
	rgb[2]=h-1/3;
	for(let i=0; i<rgb.length;i++){
	  let tc=rgb[i];
	  if(tc<0){
		tc=tc+1;
	  }else if(tc>1){
		tc=tc-1;
	  }
	  switch(true){
		case (tc<(1/6)):
		  tc=p+(q-p)*6*tc;
		  break;
		case ((1/6)<=tc && tc<0.5):
		  tc=q;
		  break;
		case (0.5<=tc && tc<(2/3)):
		  tc=p+(q-p)*(4-6*tc);
		  break;
		default:
		  tc=p;
		  break;
	  }
	  rgb[i]=Math.round(tc*255);
	}
	
	return rgb;
}

export function abToStr(buf) {
	const bufView = new Uint16Array(buf);
	const len = bufView.length;
	let binary = '';
	for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bufView[i]);
	}
	return binary;
}

export function strToAb(str) {
	const buf = new ArrayBuffer(str.length * 2);
	const bufView = new Uint16Array(buf);
	for (let i = 0; i < str.length; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

export function tryRun(func, ...args) {
	if (func) {
		func(...args)
	}
}

export function guid() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export function timeFormat(t) {
	const interval = (new Date().getTime() - t)/1000;

	if (interval < 60) {
		return "刚刚"
	} else if (interval < 60*60) {
		return Math.floor(interval/60) + "分钟前";
	} else if (interval < 24*60*60) {
		return Math.ceil(interval/3600) + "小时前";
	} else {
		const date = new Date(t + 8*3600*100);
		return date.toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.');
	}
}

export function equalColor(rgbM, rgbN) {
	for (let i=0; i<3; i++) {
		if (rgbM[i] != rgbN[i]) {
			return false;
		}
	}
	return true;
}

export function equalColors(rgbListM, rgbListN) {
	if (rgbListM.length != rgbListN.length) {
		return false;
	}

	for (let i=0; i<rgbListM.length; i++) {
		if (!equalColor(rgbListM[i], rgbListN[i])) {
			return false
		}
	}
	return true;
}

export function hasColors(rgbLists, rgbList) {
	for (let i=0;i<rgbLists.length; i++) {
		if (equalColors(rgbLists[i], rgbList)) {
			return true;
		}
	}

	return false;
}

export function colorsId(rgbList) {
	const rgbs = []
	for (let i=0; i<rgbList.length; i++) {
		rgbs.push(rgbToStr(rgbList[i]))
	}

	return rgbs.join('-');
}

export function similarColor(rgbM, rgbN) {
	const threshold = 100;
	let diff = 0;
	for (let i=0;i <3; i++) {
		diff += (rgbM[i] - rgbN[i])*(rgbM[i] - rgbN[i]);
	}
	return diff < threshold;
}

export function existSimilarColor(rgbs, rgb) {
	for (let i=0; i<rgbs.length; i++) {
		if (similarColor(rgbs[i], rgb)) {
			return true;
		}
	}

	return false;
}

export function genUnsimilarColors(colors = [], minNum = 1, maxNum = 5) {
	const colorNum = Math.floor(Math.random()*(maxNum-minNum+1)) + minNum;
	const diffList = [...colors];
	const newColors = [];

	let count = 0;
	while (count < colorNum) {
		const color = genRgb();
		if (existSimilarColor(diffList, color)) {
			continue;
		}
		count+=1;
		diffList.push(color);
		newColors.push(color);
	}
	return newColors;
}