import request from '@/utils/request'

const userApi = {
  GetUser: '/user/',
  UserMe: '/user/me'
}

export function getUser (id) {
  return new Promise((resolve, reject) => {
    request({
      url: userApi.GetUser + id,
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

export function getMe () {
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
