import api from './api'

const authApi = {
  Login: '/api/auth/login',
  Register: '/api/auth/register',
  EmailRegistered: '/api/auth/email_registered'
}

export function login (parameter) {
  return api({
    url: authApi.Login,
    method: 'post',
    data: parameter
  })
  // return new Promise((resolve, reject) => {
  //   request({
  //     url: authApi.Login,
  //     method: 'post',
  //     data: parameter
  //   }).then(resp => {
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

export function register (parameter) {
  return api({
    url: authApi.Register,
    method: 'post',
    data: parameter
  })
  // return new Promise((resolve, reject) => {
  //   request({
  //     url: authApi.Register,
  //     method: 'post',
  //     data: parameter
  //   }).then(resp => {
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

export function emailRegistered (email) {
  return api({
    url: authApi.EmailRegistered,
    method: 'get',
    params: {
      email: email
    }
  })
  // return new Promise((resolve, reject) => {
  //   request({
  //     url: authApi.EmailRegistered,
  //     method: 'get',
  //     params: {
  //       email: email
  //     }
  //   }).then(resp => {
  //     if (resp.message === 'SUCCESS') {
  //       resolve(resp.data)
  //     } else {
  //       const err = new Error(resp.message)
  //       err.response = resp
  //       reject(err)
  //     }
  //   }).catch(err => {
  //     if (err.response && err.response.message && err.response.message === 'AUTH_SESSION_EXPIRED') {
  //       reject(err)
  //     }
  //   })
  // })
}
