import storage from 'store'
import { login } from '@/api/auth'
import { getMe } from '@/api/user'
import { ACCESS_TOKEN } from '@/store/mutation-types'

const guest = {
  email: 'guest@example.com',
  username: 'guest',
  nickname: '游客',
  isGuest: true,
  class_taking: [],
  class_managing: [],
  roles: []
}

const user = {
  state: {
    token: '',
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(result => {
          storage.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', result.token)
          commit('SET_INFO', result.user)
          resolve()
        }).catch(error => {
          if (error.response && error.response.message !== 'SUCCESS') {
            switch (error.response.message) {
              case 'VALIDATION_ERROR':
                const err = new Error('VALIDATION_ERROR')
                err.validation = error.response.error
                reject(err)
                break
              default :
                if (error.response && error.response.message) {
                  reject(new Error(error.response.message))
                } else {
                  reject(error)
                }
                break
            }
          } else {
            reject(error)
          }
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.info && state.info.username) {
          resolve(state.info)
        }
        if (state.token) {
          getMe().then(result => {
            commit('SET_INFO', result.user)
            resolve(state.info)
          }).catch(err => {
            if (err.response && err.response.message && (err.response.message === 'AUTH_NEED_TOKEN' || err.response.message === 'AUTH_TOKEN_NOT_FOUND')) {
              commit('SET_INFO', guest)
              resolve(guest)
            } else {
              reject(err)
            }
          })
        } else {
          commit('SET_INFO', guest)
          resolve(guest)
        }
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '')
        commit('SET_INFO', guest)
        storage.remove(ACCESS_TOKEN)
        window.location.reload()
      })
    }

  }
}

export default user
