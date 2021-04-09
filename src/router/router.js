import Router from 'vue-router'
import Vue from 'vue'
import {ROOT_PATH, FILE_TYPE, SYSTEM_NAME} from "@/global/globalConst";

Vue.use(Router)
export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'Home',
            redirect: {path: '/file', query: {fileType: FILE_TYPE.ALL, pid: ROOT_PATH}}
        }, {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/user/Login.vue'),
            meta: {title: '登录 - ' + SYSTEM_NAME},
        }, {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/user/Register.vue'),
            meta: {title: '注册 - ' + SYSTEM_NAME},
        }, {
            path: '/file',
            name: 'File',
            component: () => import('@/views/file/File.vue'),
            meta: {
                requireAuth: true,
                title: SYSTEM_NAME,
                content: {
                    description: '基于springboot + vue 框架开发的Web文件系统，旨在为用户提供一个简单、方便的文件存储方案'
                }
            }
        }, {
            path: '/500',
            name: 'Error_500',
            component: () => import('@/views/ErrorPage/500.vue'),
            meta: {title: '500 - ' + SYSTEM_NAME},
        }, {
            path: '/401',
            name: 'Error_401',
            component: () => import('@/views/ErrorPage/401.vue'),
            meta: {title: '401 - ' + SYSTEM_NAME},
        }, {
            path: '*',
            name: 'Error_404',
            component: () => import('@/views/ErrorPage/404.vue'),
            meta: {title: '404 - ' + SYSTEM_NAME},
        }
    ]
})


const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
};
