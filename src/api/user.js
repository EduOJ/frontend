import request from '@/utils/request'
import api from '@/api/api'
import router from '@/router'
import { notification } from 'ant-design-vue'
const userApi = {
  GetUser: '/api/user/:id',
  GetUserProblemInfo: '/api/user/:id/problem_info',
  UserMe: '/api/user/me',
  GetUsers: '/api/users',
  ChangePassword: '/api/user/change_password',
  UpdateEmail: '/api/user/update_email',
  VerifyEmail: '/api/user/email_verification',
  ResendEmail: '/api/user/resend_email_verification',
  ResetPassword: '/api/auth/password_reset'
}

export function getUser (id) {
  return api({
    url: userApi.GetUser.replace(':id', id),
    method: 'get'
  })
}
export function getUserProblemInfo (id) {
  return api({
    url: userApi.GetUserProblemInfo.replace(':id', id),
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
      } else if (resp.message === 'AUTH_NEED_EMAIL_VERIFICATION') {
        router.push({ name: 'verify_email' })
        notification.warning({
          message: '警告',
          description: '请验证邮箱'
        })
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

export function updateEmail (parameter) {
  return api({
    url: userApi.UpdateEmail,
    method: 'put',
    data: parameter
  })
}

export function verifyEmail (patameter) {
  return api({
    url: userApi.VerifyEmail,
    method: 'post',
    data: patameter
  })
}

export function resendEmail (parameter) {
  return api({
    url: userApi.ResendEmail,
    method: 'post',
    data: parameter
  })
}

export function requestResetPassword (parameter) {
  return api({
    url: userApi.ResetPassword,
    method: 'post',
    data: parameter
  })
}

export function doResetPassword (parameter) {
  return api({
    url: userApi.ResetPassword,
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
