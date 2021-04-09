/**
 * post请求，formData格式，不传额外info参数,调用接口时，test({key: value}).then(res => {})
 * export const test = p => post('/user/getattentionstate', p);
 *
 * post请求，非formData格式，传递额外info = true参数，调用接口时，test({key: value},true).then(res => {})
 * export const test = (p, info) => post('/user/getattentionstate', p, info);
 *
 * 目前所有post接口均采用formData格式
 */

//  和用户信息相关的接口
import { get,post } from './http'

/* 用户登录 */
export const login = p => post('/user/login', p, true);
//qq登录接口
export const authorize = p => post('/user/authorize/qq', p);
// 获取登录用户信息
export const getLoginUserInfo = ()=>get("/user/info");
//退出登录
export const logout = () => get('/user/logout');
// 获取注册令牌
export const fetchRegisterToken = (p) => get('/user/register', p)
// 用户注册
export const addUser = p => post('/user/register', p);
// 设置用户头像
export const setAvatar = p => post('/user/avatar', p, true)

// 忘记密码1，发送邮件获取令牌
export const forgetPasswd1 = p=> get('/user/reset/passwd', p)
// 忘记密码2，修改密码
export const forgetPasswd2 = p=> post('/user/reset/passwd', p, true)

