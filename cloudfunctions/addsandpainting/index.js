const cloud = require('wx-server-sdk')
const request = require('request')
const sizeOf = require('image-size');
const names = require('./name.json');
const avatars = require('./avatar.json');

const baseIndex = 10003000;
const baseTime = 1628179200;
const cellNum = 2;

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV,
	traceUser: true,
})

exports.main = async (event, context) => {
	console.log('start ~~', new Date().toISOString())

	const sandpaintings = cloud.database().collection('sandpaintings');
	const count = Math.floor(Math.random() * cellNum) + 1;
	const currentDataIndex = baseIndex + Math.floor((new Date().getTime() / 1000 - baseTime) / (24 * 60 * 60)) * cellNum;
	for (let i = 1; i <= count; i++) {
		const tmpAutoIndex = currentDataIndex + i;
		const url = `https://api.thisissand.com/v2/files/${tmpAutoIndex}/download`;
		console.log('start download url: ', url)
		const buffer = await new Promise(function (resolve, reject) {
			let chunks = [];
			const res = request(url);
			res.on('data', function (chunk) {
				chunks.push(chunk);
			});
			res.on('end', function () {
				resolve(Buffer.concat(chunks));
			});
		})
		console.log('download finish')

		const id = guid();
		const cloudPath = id + '.jpg';
		const { fileID } = await cloud.uploadFile({
			cloudPath,
			fileContent: buffer,
		});
		console.log('uploadFile success')

		const nameIndex = Math.floor(Math.random() * names.length);
		const avatarIndex = nameIndex % avatars.length;
		const { width, height } = sizeOf(buffer);
		const data = {
			_id: id,
			fileId: fileID,
			userAvatarUrl: avatars[avatarIndex],
			userNickName: names[nameIndex],
			horizontal: width > height,
			width: width,
			height: height,
			likes: Math.floor(Math.random() * 999),
			createdAt: new Date().getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
			autoIndex: tmpAutoIndex,
		};
		await sandpaintings.add({ data });
		console.log('add  sandpainting success id:', id, tmpAutoIndex);
		console.log('end ~~', new Date().toISOString())
	}

	return true
}

function guid() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}