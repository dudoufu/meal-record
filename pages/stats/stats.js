const util = require('../../utils/util')
const { MEAL_TYPES, TASTINESS_MAP, WEEKDAY_NAMES, MONTH_NAMES } = require('../../utils/const')

Page({
  data: {
    monthText: '',
    dateCells: [],
    selectedDateStr: '',
    scrollToId: '',
    dayRecordCount: 0,
    dayMealCount: 0,
    dayRecords: [],
    mealGroups: [],
    weekTotal: 0,
    weekMealDist: [],
    weekMealTypeCount: 0,
    weekAvgDaily: 0,
    monthFavRecords: [],
    maxDate: '',
    topPadding: 54
  },

  onLoad() {
    const app = getApp()
    const statusBarHeight = app.globalData.statusBarHeight || 44
    this.setData({ topPadding: statusBarHeight + 10 })

    this.currentDate = new Date()
    this.selectedDate = new Date()
    this.setData({
      selectedDateStr: util.formatDate(this.selectedDate),
      maxDate: util.formatDate(new Date())
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  loadData() {
    const records = wx.getStorageSync('food_records') || []

    this.buildDateStrip(records)
    this.updateDayContent(records)
    this.updateStats(records)
  },

  // ===== 日期条 =====
  buildDateStrip(records) {
    const base = new Date(this.currentDate)
    const cells = []
    const today = new Date()

    // 当月第一天
    const firstDay = new Date(base.getFullYear(), base.getMonth(), 1)
    // 回退到周日
    firstDay.setDate(firstDay.getDate() - firstDay.getDay())

    // 渲染 42 天（6周）
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstDay)
      d.setDate(firstDay.getDate() + i)

      const dateStr = util.formatDate(d)
      const isToday = util.isSameDay(d, today)
      const isSelected = util.isSameDay(d, this.selectedDate)
      const isOtherMonth = d.getMonth() !== base.getMonth()

      // 这天是否有记录
      const hasRecord = records.some(r => util.isSameDay(new Date(r.createdAt), d))

      cells.push({
        dateStr,
        weekday: WEEKDAY_NAMES[d.getDay()],
        day: d.getDate(),
        isToday,
        isSelected,
        isOtherMonth,
        hasRecord
      })
    }

    this.setData({
      monthText: util.formatYearMonth(base),
      dateCells: cells,
      selectedDateStr: util.formatDate(this.selectedDate),
      scrollToId: 'date-' + util.formatDate(this.selectedDate)
    })
  },

  selectDate(e) {
    const dateStr = e.currentTarget.dataset.date
    this.selectedDate = new Date(dateStr)
    const records = wx.getStorageSync('food_records') || []
    this.buildDateStrip(records)
    this.updateDayContent(records)
  },

  changeMonth(e) {
    const delta = parseInt(e.currentTarget.dataset.delta)
    this.currentDate.setMonth(this.currentDate.getMonth() + delta)
    // 确保选中日期在该月内
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0)
    if (this.selectedDate > lastDay) {
      this.selectedDate = new Date(lastDay)
    }
    const records = wx.getStorageSync('food_records') || []
    this.buildDateStrip(records)
    this.updateDayContent(records)
  },

  // ===== 日期选择器 =====
  onDateChange(e) {
    const dateStr = e.detail.value
    if (!dateStr) return
    const parts = dateStr.split('-')
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    this.currentDate = new Date(d)
    this.selectedDate = new Date(d)
    const records = wx.getStorageSync('food_records') || []
    this.buildDateStrip(records)
    this.updateDayContent(records)
    util.showToast(`📅 已跳转到 ${util.formatDateDisplay(d)}`)
  },

  // ===== 日内容 =====
  updateDayContent(records) {
    const dayRecords = records.filter(r =>
      util.isSameDay(new Date(r.createdAt), this.selectedDate)
    )

    // 当日记录数
    const dayRecordCount = dayRecords.length

    // 餐次数
    const mealSet = new Set(dayRecords.map(r => r.mealType))
    const dayMealCount = mealSet.size

    // 按餐次分组
    const mealGroups = MEAL_TYPES.map(mt => {
      const items = dayRecords
        .filter(r => r.mealType === mt.key)
        .map(r => ({
          id: r.id,
          foodName: r.foodName,
          emoji: util.getFoodEmoji(r.foodName),
          imageUrl: r.imageUrl || '',
          bgColor: util.getBgColorById(r.id),
          timeLabel: util.formatTime(new Date(r.createdAt)),
          notes: r.notes,
          tasteEmoji: TASTINESS_MAP[r.tastiness]?.emoji || '🤩',
          tasteLabel: TASTINESS_MAP[r.tastiness]?.label || '好吃',
          tastiness: r.tastiness
        }))
      return {
        mealKey: mt.key,
        emoji: mt.emoji,
        label: mt.label,
        records: items
      }
    }).filter(g => g.records.length > 0)

    this.setData({
      dayRecordCount,
      dayMealCount,
      dayRecords,
      mealGroups
    })
  },

  // ===== 统计 =====
  updateStats(records) {
    // 本周记录
    const weekRecords = util.getWeekRecords(records)
    const weekTotal = weekRecords.length

    // 本周餐次分布
    const MEAL_DIST_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899']
    const weekMealDist = MEAL_TYPES.map((mt, i) => {
      const count = weekRecords.filter(r => r.mealType === mt.key).length
      return {
        key: mt.key,
        emoji: mt.emoji,
        label: mt.label,
        count,
        percent: weekTotal > 0 ? Math.round((count / weekTotal) * 100) : 0,
        color: MEAL_DIST_COLORS[i]
      }
    })
    const weekMealTypeCount = weekMealDist.filter(m => m.count > 0).length
    const weekAvgDaily = weekTotal > 0 ? Math.max(1, Math.round(weekTotal / 7)) : 0

    // 本月收藏
    const now = new Date()
    const monthFavRecords = records
      .filter(r => {
        const d = new Date(r.createdAt)
        return r.isFavorited && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(r => {
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
          tasteLabel: tasteInfo.label
        }
      })

    this.setData({
      weekTotal,
      weekMealDist,
      weekMealTypeCount,
      weekAvgDaily,
      monthFavRecords
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
