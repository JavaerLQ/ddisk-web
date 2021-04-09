import {getLoginUserInfo} from "@/request/user.js";
import {url} from "@/request/http";

export default {
    state: {
        isLogin: false, //初始时候给一个 isLogin = false 表示用户未登录
        user: sessionStorage.getItem("user")||{
            username: '',
            imgUrl: '',
            email: '',
        },
        error: 0,
    },
    mutations: {
        setUserLogin(state, loginUser) {
            let imgUrl = loginUser.imgUrl;
            state.isLogin = true;
            if (imgUrl) {
                imgUrl = url('/transfer/thumbnail/' + imgUrl)
            } else {
                // 没有头像，显示的默认头像
                imgUrl = "@/assets/images/settings/userImg.png";
            }
            loginUser.imgUrl = imgUrl
            state.user = loginUser
            sessionStorage.setItem("user", loginUser);
        },
        setUserLogout(state) {
            sessionStorage.removeItem("user")
            state.isLogin = false
            state.user = {
                username: '',
                imgUrl: '',
                email: '',
            }
        },
        increaseError(state){
            state.error += 1;
        },
        resetError(state){
            state.error = 0
        }
    },
    actions: {
        getUserInfo(context) {
            // 登录成功返回LoginUser
            return getLoginUserInfo().then(user => {
                context.commit("resetError")
                context.commit("setUserLogin", user)
            }).catch(() => {
                    context.commit("increaseError")
                    context.commit("setUserLogout")
                }
            )
        }
    }
}
