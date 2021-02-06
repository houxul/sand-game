const cloud = require('wx-server-sdk')
const request = require('request')
const sizeOf = require('image-size');
const names = require('./name.json');
const avatars = require('./avatar.json');

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV,
	traceUser: true,
})

exports.main = async (event, context) => {
	const sandpaintings = cloud.database().collection('sandpaintings');
	const cmd = cloud.database().command
	const {data: [{autoIndex}]} = await sandpaintings.where({autoIndex: cmd.neq(null)}).field({autoIndex: true}).orderBy('autoIndex', 'desc').limit(1).get();

	const count = 1;
	for (let i=1; i<=count; i++) {
		const tmpAutoIndex = autoIndex + i;
		const url = `https://api.thisissand.com/v2/files/${tmpAutoIndex}/download`;
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

		const id = guid();
		const cloudPath = id + '.jpg';
		const { fileID } = await cloud.uploadFile({
			cloudPath,
			fileContent: buffer,
		});

		const nameIndex = Math.floor(Math.random()*names.length);
		const avatarIndex = nameIndex % avatars.length;
		const {width, height} = sizeOf(buffer);
		const data = {
			_id: id,
			fileId: fileID,
			userAvatarUrl: avatars[avatarIndex],
			userNickName: names[nameIndex],
			horizontal: width > height,
			width: width,
			height: height,
			likes: Math.floor(Math.random()*999),
			createdAt: new Date().getTime() - Math.floor(Math.random() * 30*24*60*60*1000),
			autoIndex: tmpAutoIndex,
		};
		await sandpaintings.add({data});
		console.log('add success id:', id, tmpAutoIndex);
	}

	return true
}

function guid() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}