import request from '@/utils/request'

const authApi = {
  Login: '/auth/login',
  Register: '/auth/register',
  EmailRegistered: '/auth/email_registered'
}

export function login (parameter) {
  return new Promise((resolve, reject) => {
    request({
      url: authApi.Login,
      method: 'post',
      data: parameter
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

export function register (parameter) {
  return new Promise((resolve, reject) => {
    request({
      url: authApi.Register,
      method: 'post',
      data: parameter
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

export function emailRegistered (email) {
  return new Promise((resolve, reject) => {
    request({
      url: authApi.EmailRegistered,
      method: 'get',
      params: {
        email: email
      }
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
