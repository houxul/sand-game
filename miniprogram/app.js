//app.js
import DataBus from './base/databus'

App({
  onLaunch: function () {
    this.globalData = {
      databus: new DataBus()
    }
  }
})
