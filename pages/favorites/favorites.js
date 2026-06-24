const util = require('../../utils/util')
const { MEAL_TYPES, TASTINESS_MAP } = require('../../utils/const')

Page({
  data: {
    totalCount: 0,
    records: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const allRecords = wx.getStorageSync('food_records') || []
    // 筛选收藏的记录
    const favRecords = allRecords.filter(r => r.isFavorited)

    const records = favRecords.map(r => {
      const mealType = MEAL_TYPES.find(m => m.key === r.mealType) || MEAL_TYPES[1]
      const tasteInfo = TASTINESS_MAP[r.tastiness] || TASTINESS_MAP.good
      return {
        id: r.id,
        foodName: r.foodName,
        emoji: util.getFoodEmoji(r.foodName),
        imageUrl: r.imageUrl || '',
        bgColor: util.getBgColorById(r.id),
        mealLabel: mealType.emoji + ' ' + mealType.label,
        timeLabel: util.formatDateDisplay(new Date(r.createdAt)) + ' ' + util.formatTime(new Date(r.createdAt)),
        tasteEmoji: tasteInfo.emoji,
        tasteLabel: tasteInfo.label
      }
    })

    this.setData({
      totalCount: records.length,
      records
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
