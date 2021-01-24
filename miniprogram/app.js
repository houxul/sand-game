//app.js
import DataBus from './base/databus'
import { envVersion } from './base/utils'

App({
  onLaunch: function () {
    wx.cloud.init({
      env: envVersion() == 'release' ? 'online-4gbvdd8wdd64ce2f' : 'dev-9gvi7hhi3a969b2f',
      traceUser: true,
    });
    this.globalData = {
      databus: new DataBus()
    }
  }
})
