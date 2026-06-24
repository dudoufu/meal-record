// 好吃程度定义
const TASTINESS_MAP = {
  amazing: { emoji: '😋', label: '超赞', color: '#f59e0b', rank: 1 },
  good: { emoji: '🤩', label: '好吃', color: '#10b981', rank: 2 },
  okay: { emoji: '😐', label: '一般', color: '#6366f1', rank: 3 },
  bad: { emoji: '😣', label: '踩雷', color: '#ef4444', rank: 4 }
}

const TASTINESS_LIST = [
  { key: 'amazing', emoji: '😋', label: '超赞', color: '#f59e0b' },
  { key: 'good', emoji: '🤩', label: '好吃', color: '#10b981' },
  { key: 'okay', emoji: '😐', label: '一般', color: '#6366f1' },
  { key: 'bad', emoji: '😣', label: '踩雷', color: '#ef4444' }
]

// 餐次定义
const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐', emoji: '🌅', order: 1 },
  { key: 'lunch', label: '午餐', emoji: '☀️', order: 2 },
  { key: 'dinner', label: '晚餐', emoji: '🌆', order: 3 },
  { key: 'snack', label: '加餐', emoji: '🍿', order: 4 }
]

// 食物分类
const CATEGORIES = [
  { key: '主食', emoji: '🍚' },
  { key: '水果', emoji: '🍎' },
  { key: '饮料', emoji: '🥤' },
  { key: '零食', emoji: '🍿' }
]

// 食物emoji映射（用于没有图片时显示）
const FOOD_EMOJI_MAP = {
  '米饭': '🍚', '面条': '🍜', '牛肉面': '🍜', '拉面': '🍜',
  '饺子': '🥟', '包子': '🥟', '面包': '🍞', '馒头': '🥟',
  '披萨': '🍕', '汉堡': '🍔', '三明治': '🥪', '寿司': '🍣',
  '咖喱': '🍛', '炒饭': '🍛', '盖饭': '🍛',
  '鸡肉': '🍗', '鸡腿': '🍗', '烤鸭': '🍗',
  '牛排': '🥩', '烤肉': '🥩', '红烧肉': '🥩',
  '沙拉': '🥗', '蔬菜': '🥬', '青菜': '🥬',
  '苹果': '🍎', '香蕉': '🍌', '橙子': '🍊', '水果': '🍎',
  '咖啡': '☕', '拿铁': '🥛', '奶茶': '🧋', '饮料': '🥤',
  '蛋糕': '🍰', '甜品': '🍰', '冰淇淋': '🍦',
  '火锅': '🍲', '汤': '🍲', '麻辣烫': '🍲',
  '鸡蛋': '🥚', '煎蛋': '🍳', '灌饼': '🍳',
  '披萨': '🍕', '意面': '🍝',
  '葡萄': '🍇', '西瓜': '🍉', '柠檬': '🍋', '草莓': '🍓',
  '牛奶': '🥛', '啤酒': '🍺', '茶': '🍵',
  '饼干': '🍪', '糖果': '🍬'
}

// 星期名称
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

module.exports = {
  TASTINESS_MAP,
  TASTINESS_LIST,
  MEAL_TYPES,
  CATEGORIES,
  FOOD_EMOJI_MAP,
  WEEKDAY_NAMES,
  MONTH_NAMES
}
