import {getStorage} from '@/request/file.js'

export default {
    state: {
        isFold: sessionStorage.getItem("isFold"),
        storageUsedValue: 0, //  已使用存储容量
        storageMaxValue: 0 //  最大存储容量
    },
    mutations: {
        switchFold(state) {
            state.isFold =  !state.isFold
            sessionStorage.setItem("isFold", state.isFold);
        },
        setStorageInfo(state, storageInfo) {
            state.storageUsedValue = Number(storageInfo.usedStorage)
            state.storageMaxValue = Number(storageInfo.maxStorage)
        }
    },
    actions: {
        showStorage(context) {
            return getStorage().then(res => {
                context.commit('setStorageInfo', res)
            }).catch(err => this.$message.error(err.msg));
        }
    }
}
