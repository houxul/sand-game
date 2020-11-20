const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
	const sandpaintings = cloud.database().collection('sandpaintings');
	const cmd = cloud.database().command
	return await sandpaintings.where({
		likes: cmd.lte(100)
	}).update({
		data: {
		  likes: cmd.inc(Math.floor(Math.random()*5+1))
		},
	})
}