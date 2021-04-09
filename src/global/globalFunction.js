//全局函数 ，挂载到Vue实例上
import {url} from "@/request/http";

export default function install(Vue) {
    /**
     * checkIsLogin(params) 页面内某些功能需要用户登录时调用,调用示例如下
     * let res = this.checkIsLogin(this.$route.fullPath);
     * if(res === true) {
     *  // 做些什么......
     * }
     * 其中，参数为当前页面的全部路由fullPath（即包括query等参数）
     */
    //  检测用户登录状态并做相应的跳转
    Vue.prototype.checkIsLogin = function (params) {
        if (this.$store.getters.isLogin === false) { // 未登录时自动跳转到登录页面，并将当前页面的路由作为query传递给登陆页面
            this.$router.push({path: '/login', query: {Rurl: params}});
        } else {
            return true
        }
    };

    // 文件类型，图片，音乐，文档等
    Vue.prototype.fileType = function () {
        // 是回收站类型文件
        let that = this
        return {
            // 当前文件类型
            current() {
                return that.$route.query.fileType
            },
            isAll() {
                return that.$route.query.fileType === that.FILE_TYPE.ALL
            },
            isNotAll() {
                return that.$route.query.fileType !== that.FILE_TYPE.ALL
            },
            isRecycle() {
                return that.$route.query.fileType === that.FILE_TYPE.RECYCLE
            },
            isNotRecycle() {
                return that.$route.query.fileType !== that.FILE_TYPE.RECYCLE
            },
            isMusic() {
                return that.$route.query.fileType === that.FILE_TYPE.MUSIC
            },
            isImage() {
                return that.$route.query.fileType === that.FILE_TYPE.IMAGE
            },
            isVideo() {
                return that.$route.query.fileType === that.FILE_TYPE.VIDEO
            },
            isDoc() {
                return that.$route.query.fileType === that.FILE_TYPE.DOC
            },
            isApp() {
                return that.$route.query.fileType === that.FILE_TYPE.APP
            },
            isOther() {
                return that.$route.query.fileType === that.FILE_TYPE.OTHER
            },
            isShare() {
                return that.$route.query.fileType === that.FILE_TYPE.SHARE
            }
        }
    };

    // 文件查看模式 0列表模式 1网格模式 2 时间线模式
    Vue.prototype.fileModel = function () {
        // 是回收站类型文件
        let that = this
        return {
            current() {
                return that.$store.getters.currentFileModel
            },
            isTable() {
                return that.FILE_MODEL.TABLE === that.$store.getters.currentFileModel
            },
            isGrid() {
                return that.FILE_MODEL.GRID === that.$store.getters.currentFileModel
            },
            isTimeLine() {
                return that.FILE_MODEL.TIME_LINE === that.$store.getters.currentFileModel
            }
        }
    };

    // 文件路径，此处是id值，Long类型
    Vue.prototype.filePath = function () {
        // 是回收站类型文件
        let that = this
        return {
            // 文件查看模式 0列表模式 1网格模式 2 时间线模式
            current() {
                return that.$route.query.pid
            },
        }
    };

    // 文件下载
    Vue.prototype.getDownloadPath = fileId => url("/transfer/download/" + fileId)

    // 获取图片略缩图
    Vue.prototype.getThumbnailPath = fileId => url('/transfer/thumbnail/' + fileId)


    // 获取 office 文件在线预览路径
    Vue.prototype.getFileOnlineViewPathByOffice = fileId => {
        // 本地磁盘存储 - 在本地开发环境中，本地磁盘存储的文件是无法预览的，因为 office 要求文件可以在 Internet 访问
        let fileUrl = `${location.protocol}//${location.host}/` + url(`/transfer/download/${fileId}`)
        return `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`
    }

    // 是否退出登录
    Vue.prototype.isLoginPage = function (){
        return this.$route.name == 'Login'
    }

}
