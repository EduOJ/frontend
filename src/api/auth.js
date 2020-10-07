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
}

export function register (parameter) {
  return api({
    url: authApi.Register,
    method: 'post',
    data: parameter
  })
}

export function emailRegistered (email) {
  return api({
    url: authApi.EmailRegistered,
    method: 'get',
    params: {
      email: email
    }
  })
}
