const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
	const sandpaintings = cloud.database().collection('sandpaintings');
	const cmd = cloud.database().command
	const now = new Date().getTime();
	const before = now - 7 * 24 * 60 * 60 * 1000
	return await sandpaintings.where({
		createdAt: cmd.gt(before),
		likes: cmd.lte(77)
	}).update({
		data: {
		  likes: cmd.inc(Math.floor(Math.random()*3))
		},
	})
}