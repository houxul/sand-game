import { PhotoMatrix } from './photomatrix'

worker.onMessage(function (res) {
	const { action, data } = res;
	switch (action) {
		case 'photomatrix':
			new PhotoMatrix(data);
			break;
	} 
})