const { MONTH_NAMES, WEEKDAY_NAMES, TASTINESS_MAP, FOOD_EMOJI_MAP } = require('./const')

// 获取时段问候语
function getGreeting() {
  const h = new Date().getHours()
  let period = '下午'
  let emoji = '👋'
  if (h >= 5 && h < 9) { period = '早上'; emoji = '🌅' }
  else if (h >= 9 && h < 12) { period = '上午'; emoji = '☀️' }
  else if (h >= 12 && h < 14) { period = '中午'; emoji = '🌞' }
  else if (h >= 14 && h < 18) { period = '下午'; emoji = '👋' }
  else if (h >= 18 && h < 22) { period = '晚上'; emoji = '🌆' }
  else { period = '深夜'; emoji = '🌙' }
  return { text: `${emoji} ${period}好，干饭人`, period, emoji }
}

// 根据当前时间推荐餐次
function getDefaultMealType() {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'breakfast'  // 5:00-10:59 → 早餐
  if (h >= 11 && h < 14) return 'lunch'     // 11:00-13:59 → 午餐
  if (h >= 17 && h < 21) return 'dinner'    // 17:00-20:59 → 晚餐
  return 'snack'                             // 其他时段 → 加餐
}

// 格式化日期为字符串 YYYY-MM-DD
function formatDate(date) {
  const d = date || new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 格式化日期为显示字符串
function formatDateDisplay(date) {
  const d = date || new Date()
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const ds = formatDate(d)
  const ts = formatDate(today)
  const ys = formatDate(yesterday)

  if (ds === ts) return '今天'
  if (ds === ys) return '昨天'
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// 格式化日期为年月字符串
function formatYearMonth(date) {
  const d = date || new Date()
  return `${d.getFullYear()}年${MONTH_NAMES[d.getMonth()]}`
}

// 格式化时间为 HH:MM
function formatTime(date) {
  const d = date || new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 补齐两位数
function pad(n) {
  return String(n).padStart(2, '0')
}

// 判断两个日期是否是同一天
function isSameDay(d1, d2) {
  return formatDate(d1) === formatDate(d2)
}

// 生成唯一ID
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// 获取食物对应的emoji
function getFoodEmoji(foodName) {
  if (!foodName) return '🍽️'
  for (const [key, emoji] of Object.entries(FOOD_EMOJI_MAP)) {
    if (foodName.includes(key)) return emoji
  }
  return '🍽️'
}

// 获取好吃程度显示信息
function getTastinessInfo(key) {
  return TASTINESS_MAP[key] || TASTINESS_MAP.good
}

// 计算连续记录天数
function calcStreak(records) {
  if (!records || records.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 获取所有有记录的日期（去重）
  const dateSet = new Set()
  records.forEach(r => {
    const d = new Date(r.createdAt)
    dateSet.add(formatDate(d))
  })

  // 从今天往前数
  let streak = 0
  const cursor = new Date(today)
  while (dateSet.has(formatDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// 获取今日记录
function getTodayRecords(records) {
  const todayStr = formatDate(new Date())
  return records.filter(r => formatDate(new Date(r.createdAt)) === todayStr)
}

// 获取最近N条记录
function getRecentRecords(records, n = 8) {
  return [...records]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, n)
}

// 按日期获取记录
function getRecordsByDate(records, date) {
  const dateStr = formatDate(date)
  return records.filter(r => formatDate(new Date(r.createdAt)) === dateStr)
}

// 获取某月的记录
function getRecordsByMonth(records, year, month) {
  return records.filter(r => {
    const d = new Date(r.createdAt)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

// 计算好吃程度分布
function calcTastinessDist(records) {
  const dist = { amazing: 0, good: 0, okay: 0, bad: 0 }
  records.forEach(r => {
    if (dist[r.tastiness] !== undefined) dist[r.tastiness]++
  })
  return dist
}

// 计算好评率（amazing + good 占比）
function calcPositiveRate(records) {
  if (records.length === 0) return 0
  const dist = calcTastinessDist(records)
  const positive = dist.amazing + dist.good
  return Math.round((positive / records.length) * 100)
}

// 获取本月受欢迎排行榜
function calcMonthlyRank(records) {
  // 按食物名称分组
  const foodMap = {}
  records.forEach(r => {
    if (!foodMap[r.foodName]) {
      foodMap[r.foodName] = { name: r.foodName, records: [], category: r.category }
    }
    foodMap[r.foodName].records.push(r)
  })

  // 计算每个食物的好评率
  const ranked = Object.values(foodMap).map(f => ({
    name: f.name,
    category: f.category,
    count: f.records.length,
    positiveRate: calcPositiveRate(f.records)
  }))

  // 按好评率排序，取Top3
  return ranked.sort((a, b) => b.positiveRate - a.positiveRate).slice(0, 3)
}

// 获取饮食分类占比
function calcCategoryDist(records) {
  const dist = {}
  records.forEach(r => {
    const cat = r.category || '其他'
    dist[cat] = (dist[cat] || 0) + 1
  })
  const total = records.length || 1
  return Object.entries(dist).map(([key, count]) => ({
    category: key,
    count,
    percent: Math.round((count / total) * 100)
  })).sort((a, b) => b.count - a.count)
}

// 本周的范围（周一开始）
function getWeekRange(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 周一
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

// 获取本周记录
function getWeekRecords(records) {
  const { monday, sunday } = getWeekRange(new Date())
  return records.filter(r => {
    const d = new Date(r.createdAt)
    return d >= monday && d <= sunday
  })
}

// 食物卡片背景色池（确定性分配，不随机）
const FOOD_BG_COLORS = ['#fef3c7', '#dcfce7', '#e0e7ff', '#fce4ec', '#f3e8ff', '#fff7ed', '#ecfeff', '#f5f5f4']

// 根据ID确定性获取背景色
function getBgColorById(id) {
  if (!id) return FOOD_BG_COLORS[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash = hash & hash
  }
  return FOOD_BG_COLORS[Math.abs(hash) % FOOD_BG_COLORS.length]
}

// 调起微信地图选点 → 返回 { name, address, latitude, longitude }
// 全类目可用，无需额外权限申请
function pickLocation(callback) {
  wx.chooseLocation({
    success(res) {
      callback({
        name: res.name || '',
        address: res.address || '',
        latitude: res.latitude,
        longitude: res.longitude
      })
    },
    fail() {
      callback(null) // 用户取消或失败
    }
  })
}

// Toast 提示
function showToast(msg) {
  const app = getApp()
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
}

module.exports = {
  getGreeting,
  getDefaultMealType,
  formatDate,
  formatDateDisplay,
  formatYearMonth,
  formatTime,
  isSameDay,
  genId,
  getFoodEmoji,
  getTastinessInfo,
  getBgColorById,
  FOOD_BG_COLORS,
  calcStreak,
  getTodayRecords,
  getRecentRecords,
  getRecordsByDate,
  getRecordsByMonth,
  calcTastinessDist,
  calcPositiveRate,
  calcMonthlyRank,
  calcCategoryDist,
  getWeekRecords,
  pickLocation,
  showToast
}
