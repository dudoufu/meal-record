// app.js
App({
  onLaunch() {
    // 获取系统信息（状态栏高度等）
    const sysInfo = wx.getSystemInfoSync()
    this.globalData.statusBarHeight = sysInfo.statusBarHeight || 44
    this.globalData.navBarHeight = 44

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

  globalData: {}
})
