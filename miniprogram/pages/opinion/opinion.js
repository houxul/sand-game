import {  wrapReject } from '../../base/utils'

Page({
    data: {
        textContent: '',
    },
    bindFormSubmit: async function (e) {
        if (e.detail.value.textarea == '') {
            return;
        }

        const opinion = wx.cloud.database().collection('opinion');
        await new Promise(function (resolve, reject) {
            opinion.add({
                data: {
                    content: e.detail.value.textarea,
                    createdAt: new Date().getTime(),
                },
                success: resolve,
                fail: wrapReject(reject, '提交建议失败'),
            })
        })

        this.setData({ textContent: '' });
        wx.showToast({
            icon: 'success',
            title: '提交成功',
        })
    }
})