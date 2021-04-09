import Vue from "vue";
import Vuex from "vuex";

import user from './module/user'
import fileList from './module/fileList'
import sideMenu from './module/sideMenu'
import imgReview from './module/imgReview'
import player from "@/store/module/player";
import {FOLD_TYPE, FILE_MODEL} from "@/global/globalConst";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    getters: {
        isLogin: (state) => state.user.isLogin,
        isPlaying: (state) => state.player.isPlaying,
        user: (state)=>state.user.user,
        //  左侧栏是否折叠
        isFold: (state) => Number(state.sideMenu.isFold),
        // 文件路径，key:id, value:{id, pid, parent}
        getFilePath: (state) => (pid) => {
            let path = '/'
            let id = pid
            while (id) {
                path = '/' + state.fileList.pathTreeMap[id].name + path
                id = state.fileList.pathTreeMap[id].pid
            }
            return path
        },
        // 传入目录id
        getPathTree: (state) => (pid) => {
            let list = []
            let id = pid
            while (id) {
                list.push(state.fileList.pathTreeMap[id])
                id = state.fileList.pathTreeMap[id].pid
            }
            return list.reverse();
        },

        //  操作列是否展开，false不展开，true展开
        operaColumnExpand: (state) =>
            state.fileList.operaColumnExpand !== null
                ? Number(state.fileList.operaColumnExpand)
                : document.body.clientWidth > 1280 ? FOLD_TYPE.UNFOLD : FOLD_TYPE.FOLD,
        selectedColumnList: (state) =>
            state.fileList.selectedColumnList === null
                ? ["extension", "fileSize", "updateTime", "deleteTime"]
                : state.fileList.selectedColumnList.split(","), //  列显隐
        currentFileModel: (state) => state.fileList.fileModel === null ? FILE_MODEL.TABLE : Number(state.fileList.fileModel), //  文件展示模式，0列表模式，1网格模式 2 时间线模式
    },
    mutations: {
        //
    },
    actions: {
        //
    },
    modules: {
        user,
        fileList,
        sideMenu,
        imgReview,
        player
    }
})
