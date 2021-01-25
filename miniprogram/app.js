//app.js
import DataBus from './base/databus'
import { envVersion } from './base/utils'

App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'online-4gbvdd8wdd64ce2f',
      traceUser: true,
    });
    this.globalData = {
      databus: new DataBus()
    }
  }
})
