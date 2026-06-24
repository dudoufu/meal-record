// utils/cloud.js — 微信云开发数据服务
// 封装云数据库的增删改查，页面调用无需关心存储细节

const DB = wx.cloud.database()
const _ = DB.command

// 集合名
const COLLECTION = 'food_records'

/**
 * 获取当前用户的所有记录（按时间倒序）
 */
function getRecords() {
  return DB.collection(COLLECTION)
    .orderBy('createdAt', 'desc')
    .get()
    .then(res => res.data || [])
    .catch(err => {
      console.warn('[cloud] getRecords 失败，返回空数组', err)
      return []
    })
}

/**
 * 新增一条记录
 * @param {Object} record  记录数据（不含 _id / createdAt / updatedAt）
 * @returns {Promise<String>} 新记录的 _id
 */
function addRecord(record) {
  return DB.collection(COLLECTION).add({
    data: {
      ...record,
      createdAt: DB.serverDate(),
      updatedAt: DB.serverDate()
    }
  }).then(res => res._id)
    .catch(err => {
      console.warn('[cloud] addRecord 失败', err)
      return null
    })
}

/**
 * 更新一条记录
 * @param {String} id      记录 _id
 * @param {Object} data    要更新的字段
 */
function updateRecord(id, data) {
  return DB.collection(COLLECTION).doc(id).update({
    data: {
      ...data,
      updatedAt: DB.serverDate()
    }
  }).catch(err => {
    console.warn('[cloud] updateRecord 失败', err)
  })
}

/**
 * 删除一条记录
 * @param {String} id  记录 _id
 */
function deleteRecord(id) {
  return DB.collection(COLLECTION).doc(id).remove()
    .catch(err => {
      console.warn('[cloud] deleteRecord 失败', err)
    })
}

module.exports = {
  getRecords,
  addRecord,
  updateRecord,
  deleteRecord
}
