import request from '@/utils/request'
import api from '@/api/api'
const userApi = {
  GetUser: '/api/user/',
  UserMe: '/api/user/me',
  GetUsers: '/api/users',
  ChangePassword: '/api/user/change_password'
}

export function getUser (id) {
  return api({
    url: userApi.GetUser + id,
    method: 'get'
  })
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

export function changePassword (parameter) {
  return api({
    url: userApi.ChangePassword,
    method: 'post',
    data: parameter
  })
}

export function updateMe (parameter) {
  return api({
    url: userApi.UserMe,
    method: 'put',
    data: parameter
  })
}

export function getUsers (param) {
  return api({
    url: userApi.GetUsers,
    method: 'get',
    params: {
      ...param
    }
  })
}
