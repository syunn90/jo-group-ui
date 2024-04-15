import storage from 'store'
import expirePlugin from 'store/plugins/expire'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

storage.addPlugin(expirePlugin)
const user = {
  state: {
    token: '',
    refresh_token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_REFRESH_TOKEN: (state, refreshToken) => {
      state.refresh_token = refreshToken
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        console.log('login form', userInfo)
        login(userInfo).then(response => {
          const result = response
          storage.set(ACCESS_TOKEN, result.access_token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          storage.set(REFRESH_TOKEN, result.refresh_token, new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', result.token)
          commit('SET_REFRESH_TOKEN', result.refresh_token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        // 请求后端获取用户信息
        getInfo().then(response => {
          const result = response.data
          if (result.roles && result.roles.permissions.length > 0) {
            const role = { ...result.roles }
            role.permissionList = role.permissions.map(permission => { return permission.permissionId })
            // 覆盖响应体的 role, 供下游使用
            result.role = role

            commit('SET_ROLES', role)
            commit('SET_INFO', result)
            commit('SET_NAME', { name: result.name, welcome: welcome() })
            commit('SET_AVATAR', result.avatar)
            // 下游
            resolve(result)
          } else {
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          storage.remove(ACCESS_TOKEN)
          storage.remove(REFRESH_TOKEN)
          resolve()
        }).catch((err) => {
          console.log('logout fail:', err)
          // resolve()
        }).finally(() => {
        })
      })
    }

  }
}

export default user
