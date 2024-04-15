import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'
var retryRequests = []
var isRefreshing = false
// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    if (error.response.status === 424) {
      const config = error.response.config
      if (!isRefreshing) {
        isRefreshing = true
        return getRefreshTokenFunc().then(res => {
          storage.set(ACCESS_TOKEN, res.data.access_token, new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          store.commit('SET_TOKEN', res.data.access_token)
          config.headers['Authorization'] = `Bearer ${res.data.access_token}`
          retryRequests.forEach((cb) => cb(res.data.access_token))
          // 重试完清空这个队列
          retryRequests = []
          return request(config)
        }).catch((e) => {
          console.log(e)
          storage.set(ACCESS_TOKEN, '', 7 * 24 * 60 * 60 * 1000)
          store.commit('SET_TOKEN', '')
          notification.error({
            message: '错误',
            description: '登录过期，请重新登录',
            duration: 1.5
            // onClose: () => {
            //   window.location.reload()
            // }
          })
        }).finally(() => {
          isRefreshing = false
        })
      } else {
        // 正在刷新token，返回一个未执行resolve的promise
        return new Promise((resolve) => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          retryRequests.push((token) => {
            config.headers.Authorization = 'Bearer ' + token
            resolve(request(config))
          })
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

function getRefreshTokenFunc () {
  return axios.post('/auth/oauth2/token?grant_type=refresh_token&refresh_token=' + storage.get(REFRESH_TOKEN))
}
const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
