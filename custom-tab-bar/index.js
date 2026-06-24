Component({
  data: {
    selected: 0
  },

  lifetimes: {
    attached() {
      // 从页面路径获取当前选中 tab
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage) {
        const route = currentPage.route
        const tabMap = {
          'pages/index/index': 0,
          'pages/stats/stats': 1,
          'pages/profile/profile': 2
        }
        if (tabMap[route] !== undefined) {
          this.setData({ selected: tabMap[route] })
        }
      }
    }
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const pages = ['pages/index/index', 'pages/stats/stats', 'pages/profile/profile']
      wx.switchTab({ url: '/' + pages[index] })
    }
  }
})
