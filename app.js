// app.js
App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-d7gqjzrg851d0b029',
      traceUser: true
    })

    // 获取系统信息（状态栏高度等）
    const sysInfo = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = sysInfo.statusBarHeight || 44
    this.globalData.navBarHeight = 44

    // 启动时从云端同步数据到本地缓存
    this.syncCloudData()

    // 初始化用户信息
    const userInfo = wx.getStorageSync('user_info')
    if (!userInfo) {
      wx.setStorageSync('user_info', {
        nickName: '干饭人',
        avatarUrl: '',
        totalRecords: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      })
    }
  },

  // 从云数据库同步记录到本地缓存
  syncCloudData() {
    const cloud = require('./utils/cloud')
    cloud.getRecords().then(records => {
      if (records && records.length > 0) {
        wx.setStorageSync('food_records', records)
      }
    }).catch(() => {
      // 云同步失败时保持本地数据不变
    })
  },

  globalData: {}
})
