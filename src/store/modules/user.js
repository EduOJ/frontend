import storage from 'store'
import { login } from '@/api/auth'
import { getMe } from '@/api/user'
import { ACCESS_TOKEN } from '@/store/mutation-types'

const guest = {
  email: 'guest@example.com',
  username: 'guest',
  nickname: 'Guest',
  isGuest: 'true'
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
          if (error.response.message !== 'SUCCESS') {
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
            console.log(result)
            commit('SET_INFO', result.user)
            resolve(state.info)
          }).catch(err => {
            if (err.response && err.response.message === 'AUTH_NEED_TOKEN') {
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
        // return state.info || {}
        // getInfo().then(response => {
        //   const result = response.result
        //
        //   if (result.role && result.role.permissions.length > 0) {
        //     const role = result.role
        //     role.permissions = result.role.permissions
        //     role.permissions.map(per => {
        //       if (per.actionEntitySet != null && per.actionEntitySet.length > 0) {
        //         const action = per.actionEntitySet.map(action => { return action.action })
        //         per.actionList = action
        //       }
        //     })
        //     role.permissionList = role.permissions.map(permission => { return permission.permissionId })
        //     commit('SET_ROLES', result.role)
        //     commit('SET_INFO', result)
        //   } else {
        //     reject(new Error('getInfo: roles must be a non-null array !'))
        //   }
        //
        //   commit('SET_NAME', { name: result.name, welcome: welcome() })
        //   commit('SET_AVATAR', result.avatar)
        //
        //   resolve(response)
        // }).catch(error => {
        //   reject(error)
        // })
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
