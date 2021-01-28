// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV,
	traceUser: true,
})

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()
	const {like, sandPaintingId} = event

	const db = cloud.database();
	const ilike = db.collection('ilike');
	const res = await ilike.where({
		_openid: wxContext.OPENID,
		sandPaintingId,
	}).count();

	if (!(res.total ^ like)) {
		return
	}

	const cmd = db.command
	await db.collection('sandpaintings').doc(sandPaintingId).update({
		data: {
			likes: cmd.inc(like ? 1 : -1),
		}
	})

	if (like) {
		await ilike.add({data: {_openid: wxContext.OPENID, sandPaintingId}})
	} else {
		await ilike.where({_openid: wxContext.OPENID, sandPaintingId}).remove()
	}
	
}