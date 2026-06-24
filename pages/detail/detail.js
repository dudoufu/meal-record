const util = require('../../utils/util')
const { TASTINESS_LIST, TASTINESS_MAP, MEAL_TYPES } = require('../../utils/const')

Page({
  data: {
    recordId: '',
    // 预览模式数据
    foodName: '',
    foodEmoji: '🍽️',
    imageUrl: '',
    mealLabel: '',
    timeLabel: '',
    tastiness: 'okay',
    tastinessEmoji: '😐',
    tastinessLabel: '一般',
    notes: '',
    createdAtDisplay: '',
    isFavorited: false,
    locationText: '',
    // 编辑模式数据
    editMode: false,
    editFoodName: '',
    editMealType: 'lunch',
    editTastiness: 'okay',
    editNotes: '',
    editImageUrl: '',
    // 选项
    tastinessList: TASTINESS_LIST,
    mealTypes: MEAL_TYPES
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ recordId: options.id })
      this.loadRecord(options.id)
    }
  },

  onShow() {
    if (this.data.recordId) {
      this.loadRecord(this.data.recordId)
    }
  },

  loadRecord(id) {
    const records = wx.getStorageSync('food_records') || []
    const record = records.find(r => r.id === id)

    if (!record) {
      util.showToast('记录不存在')
      wx.navigateBack()
      return
    }

    const mealType = MEAL_TYPES.find(m => m.key === record.mealType) || MEAL_TYPES[1]
    const createdDate = new Date(record.createdAt)
    const tasteInfo = TASTINESS_MAP[record.tastiness] || TASTINESS_MAP.okay

    this.setData({
      // 预览
      foodName: record.foodName,
      foodEmoji: util.getFoodEmoji(record.foodName),
      imageUrl: record.imageUrl || '',
      mealLabel: mealType.emoji + ' ' + mealType.label,
      timeLabel: util.formatDateDisplay(createdDate) + ' ' + util.formatTime(createdDate),
      tastiness: record.tastiness || 'okay',
      tastinessEmoji: tasteInfo.emoji,
      tastinessLabel: tasteInfo.label,
      notes: record.notes || '',
      createdAtDisplay: `${util.formatDateDisplay(createdDate)} ${util.formatTime(createdDate)}`,
      isFavorited: record.isFavorited || false,
      locationText: record.locationText || '',
      // 编辑（拷贝当前值）
      editMode: false,
      editFoodName: record.foodName,
      editMealType: record.mealType || 'lunch',
      editTastiness: record.tastiness || 'okay',
      editNotes: record.notes || '',
      editImageUrl: record.imageUrl || ''
    })
  },

  // ===== 进入编辑模式 =====
  enterEditMode() {
    this.setData({
      editMode: true,
      editFoodName: this.data.foodName,
      editMealType: this.data.editMealType,
      editTastiness: this.data.tastiness,
      editNotes: this.data.notes,
      editImageUrl: this.data.imageUrl
    })
  },

  // ===== 取消编辑 =====
  cancelEdit() {
    this.setData({ editMode: false })
  },

  // ===== 编辑表单交互 =====
  onEditNameInput(e) {
    this.setData({ editFoodName: e.detail.value })
  },

  onEditNotesInput(e) {
    this.setData({ editNotes: e.detail.value })
  },

  selectEditMealType(e) {
    this.setData({ editMealType: e.currentTarget.dataset.key })
  },

  selectEditTastiness(e) {
    this.setData({ editTastiness: e.currentTarget.dataset.taste })
  },

  // ===== 重新拍照/选图 =====
  retakePhoto() {
    const that = this
    wx.showActionSheet({
      itemList: ['📷 拍照', '🖼️ 从相册选择'],
      success(res) {
        const sourceType = res.tapIndex === 0 ? 'camera' : 'album'
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: [sourceType],
          success(r) {
            that.setData({ editImageUrl: r.tempFiles[0].tempFilePath })
          }
        })
      }
    })
  },

  // ===== 保存编辑 =====
  saveEdit() {
    const { recordId, editFoodName, editMealType, editTastiness, editNotes, editImageUrl, isFavorited } = this.data

    if (!editFoodName || editFoodName.trim() === '') {
      util.showToast('请输入食物名称')
      return
    }

    const records = wx.getStorageSync('food_records') || []
    const idx = records.findIndex(r => r.id === recordId)
    if (idx === -1) return

    records[idx].foodName = editFoodName.trim()
    records[idx].mealType = editMealType
    records[idx].tastiness = editTastiness
    records[idx].notes = editNotes || ''
    records[idx].imageUrl = editImageUrl
    records[idx].isFavorited = isFavorited
    records[idx].updatedAt = Date.now()
    wx.setStorageSync('food_records', records)

    util.showToast('✅ 已保存修改')
    this.setData({ editMode: false })
    this.loadRecord(recordId)
  },

  // ===== 收藏切换 =====
  toggleFavorite() {
    const id = this.data.recordId
    const records = wx.getStorageSync('food_records') || []
    const idx = records.findIndex(r => r.id === id)
    if (idx === -1) return

    const newVal = !records[idx].isFavorited
    records[idx].isFavorited = newVal
    records[idx].updatedAt = Date.now()
    wx.setStorageSync('food_records', records)

    this.setData({ isFavorited: newVal })
    util.showToast(newVal ? '❤️ 已收藏' : '💔 已取消收藏')
  },

  // ===== 删除记录 =====
  deleteRecord() {
    const that = this
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${this.data.foodName}」这条记录吗？`,
      confirmText: '删除',
      confirmColor: '#ef4444',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          const records = wx.getStorageSync('food_records') || []
          const filtered = records.filter(r => r.id !== that.data.recordId)
          wx.setStorageSync('food_records', filtered)
          util.showToast('🗑️ 已删除')
          setTimeout(() => {
            wx.navigateBack()
          }, 500)
        }
      }
    })
  }
})
