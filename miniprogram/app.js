//app.js
import DataBus from './base/databus'

App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'dev-9gvi7hhi3a969b2f',
      traceUser: true,
    });
    this.globalData = {
      databus: new DataBus()
    }
  }
})
