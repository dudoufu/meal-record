const util = require('../../utils/util')
const { MEAL_TYPES, TASTINESS_MAP } = require('../../utils/const')

Page({
  data: {
    greeting: '👋 下午好，干饭人',
    todayCount: 0,
    streak: 0,
    todayDist: { amazing: 0, good: 0, okay: 0, bad: 0 },
    recentRecords: [],
    topPadding: 54
  },

  onLoad() {
    const app = getApp()
    const statusBarHeight = app.globalData.statusBarHeight || 44
    this.setData({
      topPadding: statusBarHeight + 10
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  loadData() {
    // 更新问候
    const { text } = util.getGreeting()

    // 获取所有记录
    const records = wx.getStorageSync('food_records') || []

    // 今日记录
    const todayRecords = util.getTodayRecords(records)
    const todayCount = todayRecords.length

    // 连续记录天数
    const streak = util.calcStreak(records)

    // 今日好吃分布
    const todayDist = util.calcTastinessDist(todayRecords)

    // 最近记录
    const recentRaw = util.getRecentRecords(records, 8)
    const recentRecords = recentRaw.map(r => {
      const mealType = MEAL_TYPES.find(m => m.key === r.mealType) || MEAL_TYPES[1]
      const tasteInfo = TASTINESS_MAP[r.tastiness] || TASTINESS_MAP.good
      return {
        id: r.id,
        foodName: r.foodName,
        emoji: util.getFoodEmoji(r.foodName),
        imageUrl: r.imageUrl || '',
        bgColor: util.getBgColorById(r.id),
        mealLabel: mealType.emoji + ' ' + mealType.label,
        timeLabel: util.formatTime(new Date(r.createdAt)),
        tasteEmoji: tasteInfo.emoji,
        tasteLabel: tasteInfo.label,
        tastiness: r.tastiness
      }
    })

    this.setData({
      greeting: text,
      todayCount,
      streak,
      todayDist,
      recentRecords
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  goToRecord() {
    wx.navigateTo({
      url: '/pages/record/record'
    })
  },

  goToStats() {
    wx.switchTab({
      url: '/pages/stats/stats'
    })
  }
})
