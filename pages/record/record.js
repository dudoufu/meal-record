const util = require('../../utils/util')
const { MEAL_TYPES, TASTINESS_LIST } = require('../../utils/const')

Page({
  data: {
    // 页面状态
    recognizing: false,
    showResult: false,

    // 表单数据
    foodName: '',
    mealType: 'lunch',
    tastiness: 'okay',
    notes: '',
    imageUrl: '',      // 拍照/选图得到的临时路径
    recordFavorited: false,
    location: null,
    locationText: '',

    // 选项数据
    mealTypes: MEAL_TYPES,
    tastinessList: TASTINESS_LIST,

    // 手动录入
    showManual: false,
    manualName: '',
    manualMealType: 'lunch',
    manualTastiness: 'okay',
    manualNotes: ''
  },

  onLoad() {
    // 根据当前时间默认餐次
    const defaultMeal = util.getDefaultMealType()
    this.setData({
      mealType: defaultMeal,
      manualMealType: defaultMeal
    })
  },

  // ===== 公共：选图后处理 =====
  handleImageChosen(tempFilePath) {
    if (this.data.recognizing) return
    this.showEditForm(tempFilePath)
  },

  // ===== 拍照 =====
  takePhoto() {
    if (this.data.recognizing) return
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success(res) {
        that.handleImageChosen(res.tempFiles[0].tempFilePath)
      },
      fail() {}
    })
  },

  // ===== 相册选择 =====
  chooseImage() {
    if (this.data.recognizing) return
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success(res) {
        that.handleImageChosen(res.tempFiles[0].tempFilePath)
      },
      fail() {}
    })
  },

  // ===== 点击上传区域 =====
  startRecognition() {
    if (this.data.recognizing) return
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
            that.handleImageChosen(r.tempFiles[0].tempFilePath)
          }
        })
      }
    })
  },

  // ===== 拍照/选图后直接展示编辑表单（无AI识别） =====
  showEditForm(tempFilePath) {
    this.setData({
      recognizing: false,
      showResult: true,
      imageUrl: tempFilePath,
      foodName: ''
    })
    // 获取当前位置
    this.fetchLocation()
  },

  // ===== 获取当前位置 =====
  fetchLocation() {
    const that = this
    util.getLocationAddress(function(loc, err) {
      if (loc) {
        that.setData({
          location: { latitude: loc.latitude, longitude: loc.longitude },
          locationText: loc.address
        })
      } else if (err && err.errMsg && err.errMsg.indexOf('deny') !== -1) {
        that.setData({ locationText: '📍 位置授权已拒绝' })
      } else {
        that.setData({ locationText: '📍 位置获取失败' })
      }
    })
  },

  // ===== 点击图片重新拍照/选图 =====
  retakePhoto() {
    if (this.data.recognizing) return
    const that = this
    wx.showActionSheet({
      itemList: ['📷 重新拍照', '🖼️ 重新选择'],
      success(res) {
        const sourceType = res.tapIndex === 0 ? 'camera' : 'album'
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: [sourceType],
          success(r) {
            that.showEditForm(r.tempFiles[0].tempFilePath)
          }
        })
      }
    })
  },

  // ===== 表单交互 =====
  onNameInput(e) {
    this.setData({ foodName: e.detail.value })
  },

  onNotesInput(e) {
    this.setData({ notes: e.detail.value })
  },

  selectMealType(e) {
    this.setData({ mealType: e.currentTarget.dataset.key })
  },

  selectTastiness(e) {
    this.setData({ tastiness: e.currentTarget.dataset.key })
  },

  // ===== 保存记录 =====
  saveRecord() {
    const { foodName, mealType, tastiness, notes, imageUrl, recordFavorited, location, locationText } = this.data

    if (!foodName || foodName.trim() === '') {
      util.showToast('请输入食物名称')
      return
    }

    const now = Date.now()
    const record = {
      id: util.genId(),
      foodName: foodName.trim(),
      mealType,
      tastiness,
      notes: notes || '',
      imageUrl: imageUrl || '',
      isFavorited: recordFavorited,
      location: location || null,
      locationText: locationText || '',
      createdAt: now,
      updatedAt: now
    }

    const records = wx.getStorageSync('food_records') || []
    records.unshift(record)
    wx.setStorageSync('food_records', records)

    util.showToast('✅ 已保存到日记')

    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 500)
  },

  // ===== 收藏切换 =====
  toggleRecordFav() {
    this.setData({ recordFavorited: !this.data.recordFavorited })
  },

  // ===== 取消（不保存，返回首页） =====
  cancelRecord() {
    wx.navigateBack({ delta: 1 })
  },

  // ===== 手动录入 =====
  openManual() {
    this.setData({
      showManual: true,
      manualName: '',
      manualMealType: 'lunch',
      manualTastiness: 'good',
      manualCategory: '',
      manualNotes: ''
    })
  },

  closeManual() {
    this.setData({ showManual: false })
  },

  onManualNameInput(e) {
    this.setData({ manualName: e.detail.value })
  },

  onManualNotesInput(e) {
    this.setData({ manualNotes: e.detail.value })
  },

  selectManualMealType(e) {
    this.setData({ manualMealType: e.currentTarget.dataset.key })
  },

  selectManualTastiness(e) {
    this.setData({ manualTastiness: e.currentTarget.dataset.key })
  },

  saveManual() {
    const { manualName, manualMealType, manualTastiness, manualNotes } = this.data

    if (!manualName || manualName.trim() === '') {
      util.showToast('请输入食物名称')
      return
    }

    const now = Date.now()
    const record = {
      id: util.genId(),
      foodName: manualName.trim(),
      mealType: manualMealType,
      tastiness: manualTastiness,
      notes: manualNotes || '',
      imageUrl: '',
      isFavorited: false,
      location: null,
      locationText: '',
      createdAt: now,
      updatedAt: now
    }

    const records = wx.getStorageSync('food_records') || []
    records.unshift(record)
    wx.setStorageSync('food_records', records)

    this.setData({ showManual: false })

    util.showToast(`✅ 已记录「${record.foodName}」`)

    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 500)
  }
})
