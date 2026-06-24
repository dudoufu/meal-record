const util = require('../../utils/util')

Page({
  data: {
    totalCount: 0,
    groups: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const records = wx.getStorageSync('food_records') || []

    // 按日期分组（倒序）
    const dateMap = {}
    records.forEach(r => {
      const d = new Date(r.createdAt)
      const dateStr = util.formatDate(d)
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = []
      }
      dateMap[dateStr].push(r)
    })

    // 排序
    const sortedDates = Object.keys(dateMap).sort().reverse()

    const today = util.formatDate(new Date())
    const yesterday = util.formatDate(new Date(Date.now() - 86400000))

    const groups = sortedDates.map(dateStr => {
      let dateLabel
      if (dateStr === today) {
        dateLabel = '今天'
      } else if (dateStr === yesterday) {
        dateLabel = '昨天'
      } else {
        const parts = dateStr.split('-')
        dateLabel = `${parseInt(parts[1])}月${parseInt(parts[2])}日`
      }

      const photos = dateMap[dateStr].map(r => ({
        id: r.id,
        emoji: util.getFoodEmoji(r.foodName),
        imageUrl: r.imageUrl || '',
        bgColor: util.getBgColorById(r.id)
      }))

      return {
        dateStr,
        dateLabel,
        photos
      }
    })

    this.setData({
      totalCount: records.length,
      groups
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
  }
})
