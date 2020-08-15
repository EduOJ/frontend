import request from '@/utils/request'

const userApi = {
  Login: '/auth/login',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/auth/2step-code',
  SendSms: '/account/sms',
  SendSmsErr: '/account/sms_err',
  // get my info
  UserMe: '/user/me',
  UserMenu: '/user/nav'
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return new Promise((resolve, reject) => {
    request({
      url: userApi.Login,
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

export function getSmsCaptcha (parameter) {
  return request({
    url: userApi.SendSms,
    method: 'post',
    data: parameter
  })
}

export function getInfo () {
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

export function getCurrentUserNav () {
  return request({
    url: userApi.UserMenu,
    method: 'get'
  })
}

export function logout () {
  return request({
    url: userApi.Logout,
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
