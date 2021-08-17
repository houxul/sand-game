const cloud = require('wx-server-sdk')
const request = require('request')
const names = require('./name.json');
const avatars = require('./avatar.json');

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV,
	traceUser: true,
})

exports.main = async (event, context) => {
	console.log('start ~~', new Date().toISOString())

	const sandpaintings = cloud.database().collection('sandpaintings');
	let additions = Math.floor(Math.random() * 3) + 1;

	const datas = await getPopulars();
	additions = additions > datas.length ? datas.length : additions;
	for (let i = 0; i < additions; i++) {
		const { id: dataId, width, height } = datas[i];
		console.log('for', i, dataId, width, height)

		const countRes = await sandpaintings.where({ autoIndex: dataId }).count()
		if (countRes.errMsg != 'collection.count:ok' || countRes.total > 0) {
			console.log('get count, sikp', countRes);
			continue;
		}

		const fileContent = await download(dataId);
		const id = guid();
		const cloudPath = id + '.jpg';
		const { fileID } = await cloud.uploadFile({ cloudPath, fileContent });
		console.log('uploadFile success')

		const nameIndex = Math.floor(Math.random() * names.length);
		const avatarIndex = nameIndex % avatars.length;
		const data = {
			_id: id,
			fileId: fileID,
			userAvatarUrl: avatars[avatarIndex],
			userNickName: names[nameIndex],
			horizontal: width > height,
			width: width,
			height: height,
			likes: likes(),
			createdAt: new Date().getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
			autoIndex: dataId,
		};
		await sandpaintings.add({ data });
		console.log('add  sandpainting success id:', id, dataId);
	}

	console.log('end ~~', new Date().toISOString())
	return true
}

function guid() {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function likes() {
	return Math.floor(Math.asin(Math.random()) * 1000);
}

async function getPopulars() {
	const now = new Date();
	now.setDate(now.getDate() - 5)
	const endDate = now.toISOString();
	now.setDate(now.getDate() - 1)
	const beginDate = now.toISOString();
	const url = `https://api.thisissand.com/v2/pieces?page=0&itemsPerPage=5&orderBy=viewCount&filterBegin[createdAt]=${beginDate}&filterEnd[createdAt]=${endDate}`
	console.log('start getPopulars', url)
	const results = await new Promise(function (resolve, reject) {
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body))
				return;
			}
			reject(error || response)
		})
	});

	console.log('end getPopulars')
	return results;
}

async function download(id) {
	const url = `https://api.thisissand.com/v2/files/${id}/download`;
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
	console.log('end download')
	return buffer;
}