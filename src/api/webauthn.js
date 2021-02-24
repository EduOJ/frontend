import api from './api'

const authApi = {
  Register: '/api/webauthn/register',
  Login: '/api/auth/login/webauthn'
}

export function beginRegister () {
  return api({
    url: authApi.Register,
    method: 'get'
  })
}
export function finishRegister (data) {
  return api({
    url: authApi.Register,
    method: 'post',
    data: data,
    withCredentials: true
  })
}

export function beginLogin (data) {
  return api({
    url: authApi.Login,
    method: 'get',
    params: data
  })
}
export function finishLogin (username, data) {
  return api({
    url: authApi.Login,
    method: 'post',
    data: data,
    withCredentials: true,
    params: {
      username: username
    }
  })
}
