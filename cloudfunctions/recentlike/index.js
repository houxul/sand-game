// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	const sandpaintings = cloud.database().collection('sandpaintings');
	const cmd = cloud.database().command;
	const now = new Date().getTime();
	const before = now - 2 * 60 * 60 * 1000;
	return await sandpaintings.where({
		createdAt: cmd.gt(before)
	}).update({
		data: {
		  likes: cmd.inc(Math.floor(Math.random()*3))
		},
	})
}