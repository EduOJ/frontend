import request from '@/utils/request'
import api from '@/api/api'
const userApi = {
  GetUser: '/api/user/',
  UserMe: '/api/user/me'
}

export function getUser (id) {
  return api({
    url: userApi.GetUser + id,
    method: 'get'
  })
  // return new Promise((resolve, reject) => {
  //   request().then(resp => {
  //     if (resp.message === 'SUCCESS') {
  //       resolve(resp.data)
  //     } else {
  //       const err = new Error(resp.message)
  //       err.response = resp
  //       reject(err)
  //     }
  //   }).catch(err => {
  //     reject(err)
  //   })
  // })
}

export function getMe () {
  // 此函数遇到未登录的情况报错, 而不是跳转到登录界面.
  // 因此不用封装的api函数.
  return new Promise((resolve, reject) => {
    request({
      url: userApi.UserMe,
      method: 'get'
    }).then(resp => {
      if (resp.message === 'SUCCESS') {
        resolve(resp.data)
      } else {
        const err = new Error(resp.message)
        err.response = resp
        reject(err)
      }
    }).catch(err => {
      reject(err)
    })
  })
}
