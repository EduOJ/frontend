import request from '@/utils/request.js'
import router from '@/router'
import store from '@/store'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { notification } from 'ant-design-vue'

const api = req => {
  return new Promise((resolve, reject) => {
    request(req).then(resp => {
      if (resp.message && resp.message === 'SUCCESS') {
        resolve(resp.data)
      } else {
        if (resp.message === 'AUTH_NEED_TOKEN' || resp.message === 'AUTH_SESSION_EXPIRED') {
          store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))
          store.dispatch('GetInfo').then(data => {
            store.commit('SET_INFO', data)
          })
          notification.error({
            message: '错误',
            description: resp.message === 'AUTH_NEED_TOKEN' ? '本页面需要登录才能访问' : '你的登录状态已经过期'
          })
          router.push('/user/login')
        } else if (resp.message === 'PERMISSION_DENIED') {
          router.push({ path: '/' })
          notification.error({
            message: '错误',
            description: `你没有这么做的权限`
          })
        }
        const err = new Error(resp.message)
        err.response = resp
        reject(err)
      }
    }).catch(err => {
      alert('这不应该发生! 只应该是网络错误!')
      alert(JSON.stringify(err))
      reject(err)
    })
  })
}

export default api
