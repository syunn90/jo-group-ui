import request from '@/utils/request'

const userApi = {
  Login: '/auth/oauth2/token',
  Logout: '/auth/token/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/code/image',
  SendSms: '/account/sms',
  SendSmsErr: '/account/sms_err',
  // get my info
  UserInfo: '/biz/user/info',
  UserMenu: '/user/nav'
}

/**
 * login func
 * parameter: {
 *     username: '',
 *     password: '',
 *     remember_me: true,
 *     captcha: '12345'
 * }
 * @param parameter
 * @returns {*}
 */
export function login (parameter) {
  return request({
    url: userApi.Login + '?code=' + parameter.code + '&grant_type=' + parameter.grant_type + '&randomStr=' + parameter.randomStr + '&username=' + parameter.username + '&password=' + parameter.password,
    method: 'post'
    // data: parameter,
    // headers: {
    //   // 'Authorization': 'Basic Y2xpZW50OjEyMzQ=',
    //   'Content-Type': 'application/x-www-form-urlencoded'
    // }
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
  return request({
    url: userApi.UserInfo,
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
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
    method: 'get'
  })
}

/**
 * get user 2step code open?
 * @param parameter {*}
 */
export function get2step (parameter) {
  return request({
    url: userApi.twoStepCode,
    method: 'get',
    params: parameter,
    responseType: 'blob'
  })
}
