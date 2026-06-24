const util = require('../../utils/util')

Page({
  data: {
    nickName: '干饭人',
    avatarEmoji: '😊',
    avatarUrl: '',
    totalRecords: 0,
    favCount: 0,
    streak: 0,
    topPadding: 54
  },

  onLoad() {
    const app = getApp()
    const statusBarHeight = app.globalData.statusBarHeight || 44
    this.setData({ topPadding: statusBarHeight + 10 })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const records = wx.getStorageSync('food_records') || []
    const userInfo = wx.getStorageSync('user_info') || {}
    const favCount = records.filter(r => r.isFavorited).length

    this.setData({
      nickName: userInfo.nickName || '干饭人',
      avatarUrl: userInfo.avatarUrl || '',
      totalRecords: records.length,
      favCount,
      streak: util.calcStreak(records)
    })
  },

  // ===== 获取微信用户信息 =====
  getUserInfo() {
    const that = this
    // 尝试用 getUserProfile 获取（需用户点击触发）
    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于展示用户信息',
        success(res) {
          const data = res.userInfo
          // 保存到存储
          const userInfo = wx.getStorageSync('user_info') || {}
          userInfo.nickName = data.nickName
          userInfo.avatarUrl = data.avatarUrl
          wx.setStorageSync('user_info', userInfo)

          that.setData({
            nickName: data.nickName,
            avatarUrl: data.avatarUrl
          })
        },
        fail() {
          util.showToast('已取消授权')
        }
      })
    } else {
      util.showToast('请点击头像授权')
    }
  },

  goToPhotos() {
    wx.navigateTo({
      url: '/pages/photos/photos'
    })
  },

  goToFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  showComingSoon() {
    util.showToast('功能开发中，敬请期待')
  }
})
