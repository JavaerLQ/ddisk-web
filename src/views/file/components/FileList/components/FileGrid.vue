<template>
  <!-- 文件平铺 -->
  <div class="file-grid-wrapper">
    <ul class="file-list" v-loading="loading" element-loading-text="文件加载中……" @click.self="rightMenu.isShow = false"
        @scroll="rightMenu.isShow = false">
      <li
          class="file-item"
          v-for="(item, index) in fileListSorted"
          :key="index"
          :title="item | filenameComplete"
          @click="clickFileName(item, index, fileListSorted)"
          @contextmenu.prevent="rightClickFile(item, index, $event)"
      >
        <img class="file-img" :src="setFileImg(item)"/>
        <div class="file-name">{{ item | filenameComplete }}</div>
        <div
            class="file-checked-wrapper"
            :class="{ checked: item.checked }"
            v-show="batchOperate"
            @click.stop.self="item.checked = !item.checked"
        >
          <el-checkbox
              class="file-checked"
              v-model="item.checked"
              @click.stop="item.checked = !item.checked"
          ></el-checkbox>
        </div>
      </li>
    </ul>
    <transition name="el-fade-in-linear">
      <div class="right-menu" v-show="rightMenu.isShow" :style="`top: ${rightMenu.top}px; left: ${rightMenu.left}px;`">
        <el-button type="info" size="small" plain @click.native="deleteFileBtn(selectedFile)">删除</el-button>
        <el-button type="info" size="small" plain @click.native="recoverFileBtn(selectedFile)" v-show="fileType().isRecycle()">恢复</el-button>
        <el-button type="info" size="small" plain @click.native="showMoveFileDialog(selectedFile)"
                   v-show="fileType().isNotRecycle()"
        >移动
        </el-button>
        <el-button type="info" size="small" plain @click.native="renameFile(selectedFile)"
                   v-show="fileType().isNotRecycle()"
        >重命名
        </el-button
        >
        <el-button
            type="info"
            size="small"
            plain
            v-show="selectedFile.dir == false && fileType().isNotRecycle()"
            @click.native="rightMenu.isShow = false"
        >
          <a
              target="_blank"
              style="display: block;color: inherit;"
              :href="getDownloadPath(selectedFile.id)"
              :download="selectedFile.filename + '.' + selectedFile.extension"
          >下载</a
          >
        </el-button>
        <!--        <el-button-->
        <!--            type="info"-->
        <!--            size="small"-->
        <!--            plain-->
        <!--            @click.native="unzipFile(selectedFile)"-->
        <!--            v-if="fileType.isNotRecycle() && (selectedFile.extension == 'zip' || selectedFile.extension == 'rar')"-->
        <!--        >解压缩-->
        <!--        </el-button-->
        <!--        >-->
      </div>
    </transition>
  </div>
</template>

<script>
import {unzipfile, deleteFile, renameFile, deleteRecoveryFile, recoverRecycleFile} from '@/request/file.js'
import {mapGetters} from 'vuex'
import 'element-ui/lib/theme-chalk/base.css'
import {filenameComplete, filenameSplit} from "@/filters";

export default {
  name: 'FileGrid',
  props: {
    fileList: Array, //  文件列表
    loading: Boolean,
    batchOperate: Boolean
  },
  data() {
    return {
      fileListSorted: this.fileList,
      //  移动文件模态框数据
      dialogMoveFile: {
        isBatchMove: false,
        visible: false, //  是否可见
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      },
      downloadFilePath: '',
      viewFilePath: '',
      // 右键菜单
      rightMenu: {
        isShow: false,
        top: 0,
        left: 0
      },
      selectedFile: {}
    }
  },
  computed: {
    /**
     * selectedColumnList: 列显隐
     * operaColumnExpand: 判断当前用户设置的操作列是否展开 0不展开 1展开
     * fileModel: 文件查看模式 0列表模式 1网格模式
     *  */
    ...mapGetters(['selectedColumnList', 'operaColumnExpand', 'currentFileModel']),
    //  判断当前路径下是否有普通文件
    isIncludeNormalFile() {
      return this.fileList.map((data) => data.dir).includes(0)
    },
    //  判断当前路径下是否有压缩文件
    isIncludeZipRarFile() {
      return (
          this.fileList.map((data) => data.extension).includes('zip') ||
          this.fileList.map((data) => data.extension).includes('rar')
      )
    },
    // 批量操作模式 - 被选中的文件
    selectedFileList() {
      let res = this.fileListSorted.filter((item) => item.checked)
      return res
    }
  },
  watch: {
    // 文件平铺模式 排序-文件夹在前
    fileList(newValue) {
      this.fileListSorted = [...newValue]
          .sort((pre, next) => {
            return next.dir - pre.dir
          })
          .map((item) => {
            return {
              ...item,
              checked: false
            }
          })
    },
    // 批量操作模式 - 被选中的文件
    selectedFileList(newValue) {
      if (newValue.length) {
        this.$emit('setSelectionFile', newValue)
      }
    }
  },
  methods: {
    /**
     * 文件操作相关书事件
     */
    // 文件右键事件
    rightClickFile(item, index, mouseEvent) {
      if (!this.batchOperate) {
        this.rightMenu.isShow = false
        setTimeout(() => {
          this.selectedFile = item
          this.rightMenu.top = mouseEvent.clientY - 64
          this.rightMenu.left = mouseEvent.clientX + 18
          this.rightMenu.isShow = true
        }, 100)
      }
    },
    /**
     * 表格数据获取相关事件
     */
    /**
     * 表格数据获取相关事件
     */
    //  根据文件扩展名设置文件图片
    setFileImg(row) {
      if (!row.extension) {
        //  文件夹
        return this.FILE_IMG_MAP.dir
      } else if (!this.FILE_IMG_TYPE_LIST.includes(row.extension)) {
        //  无法识别文件类型的文件
        return this.FILE_IMG_MAP.unknown
      } else if (['jpg', 'png', 'jpeg', 'gif'].includes(row.extension)) {
        // 图片类型，直接显示缩略图
        return this.getThumbnailPath(row.id)
      } else {
        //  可以识别文件类型的文件
        return this.FILE_IMG_MAP[row.extension]
      }
    },
    //  计算文件大小
    calculateFileSize(size) {
      const B = 1024
      const KB = Math.pow(1024, 2)
      const MB = Math.pow(1024, 3)
      const GB = Math.pow(1024, 4)
      if (!size) {
        return '_'
      } else if (size < KB) {
        return (size / B).toFixed(0) + 'KB'
      } else if (size < MB) {
        return (size / KB).toFixed(1) + 'MB'
      } else if (size < GB) {
        return (size / MB).toFixed(2) + 'GB'
      } else {
        return (size / GB).toFixed(3) + 'TB'
      }
    },

    //  点击文件名
    clickFileName(row) {
      //  若是目录则进入目录
      if (row.dir) {
        this.$router.push({
          query: {
            pid: row.id,
            fileType: this.fileType().current()
          }
        })
      }
      //  若是文件，则进行相应的预览
      else {
        //  若当前点击项是图片
        if (this.IMG_TYPE_LIST.includes(row.extension)) {
          let data = {
            imgReviewVisible: true,
            imgReviewList: [
              {
                id: row.id,
                fileUrl: this.getDownloadPath(row.id),
                downloadLink: this.getDownloadPath(row.id),
                filename: row.filename,
                extension: row.extension
              }
            ],
            activeIndex: 0
          }
          this.$store.commit('setImgReviewData', data)
        }
        //  若当前点击项是可以使用office在线预览的
        if (['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'].includes(row.extension)) {
          window.open(this.getFileOnlineViewPathByOffice(row.id), '_blank')
        }
        //  若当前点击项是pdf
        if (row.extension === 'pdf') {
          window.open(this.getDownloadPath(row.id), '_blank')
        }
        //  若当前点击项是html、js、css、json
        const CODE = ['html', 'js', 'css', 'json']
        if (CODE.includes(row.extension)) {
          window.open(this.getDownloadPath(row.id), '_blank')
        }
        //  若当前点击项是视频mp4格式
        const VIDEO = ['mp4']
        if (VIDEO.includes(row.extension)) {
          window.open(this.getDownloadPath(row.id), '_blank')
        }
        //  若当前点击项是视频mp3格式
        const AUDIO = ['mp3']
        if (AUDIO.includes(row.extension)) {
          window.open(this.getDownloadPath(row.id), '_blank')
        }
      }
    },
    /**
     * 移动按钮相关事件
     */
    //  操作列-移动按钮：打开移动文件模态框
    showMoveFileDialog(file) {
      this.rightMenu.isShow = false
      //  第一个参数: 是否批量移动；第二个参数：打开/关闭移动文件模态框
      this.$emit('setOperationFile', file)
      this.$emit('setMoveFileDialogData', false, true)
    },

    //  操作列-解压缩按钮
    unzipFile(fileInfo) {
      const loading = this.$loading({
        lock: true,
        text: '正在解压缩，请稍等片刻...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      unzipfile(fileInfo).then(() => {
        this.$emit('getTableDataByType')
        this.$store.dispatch('showStorage')
        this.$message.success('解压成功')
        loading.close()
      }).catch(err => {
        console.log(err)
        this.$message.error("系统忙，解压失败")
      })
    },

    /**
     * 恢复按钮事件
     */
    recoverFileBtn(fileInfo) {
      let data = {
        userFileId: fileInfo.id
      }
      if (this.fileType().isRecycle()) { //  回收站里 - 彻底删除
        this.$confirm('是否恢复该文件?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          recoverRecycleFile(data).then(() => {
                this.$message({
                  type: 'success',
                  message: filenameComplete(fileInfo) + '已恢复'
                })
                this.$emit('getTableDataByType')
                this.$store.dispatch('showStorage')
                this.$store.dispatch('fetchPathTreeMap')
              }
          )
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消恢复'
          })
        })
      }
    },

    //  操作列-删除按钮
    deleteFileBtn(fileInfo) {
      if (this.fileType().isRecycle()) { //  回收站里 - 彻底删除
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.confirmDeleteFile(fileInfo, true)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {  //  非回收站
        this.$confirm('删除后可在回收站查看, 是否继续删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.confirmDeleteFile(fileInfo, false)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    //  删除文件模态框-确定按钮
    confirmDeleteFile(fileInfo, type) {
      let data = {userFileId: fileInfo.id}
      if (type) {  //  回收站中删除
        deleteRecoveryFile(data).then(() => {
          this.$emit('getTableDataByType')
          this.$store.dispatch('showStorage')
          this.$message.success('删除成功')
          this.$store.dispatch('fetchPathTreeMap')
        }).catch(err => {
          console.log(err)
          this.$message.error("系统忙，删除失败")
        })
      } else {  //  非回收站删除
        deleteFile(data).then(() => {
          this.$emit('getTableDataByType')
          this.$store.dispatch('showStorage')
          this.$message.success('删除成功')
        }).catch(err => {
          console.log(err)
          this.$message.error("系统忙，删除失败")
        })
      }
    },
    // 文件重命名
    renameFile(fileInfo) {
      let filename = filenameComplete(fileInfo)
      this.$prompt('请输入文件名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: filename
      }).then(({value}) => {
        let name = filenameSplit(value)
        if (!name.filename) {
          throw new Error("错误文件名")
        }
        if (fileInfo.filename === name.filename && fileInfo.extension === name.extension) {
          throw new Error("文件名未发生改变")
        }
        fileInfo.oldFilename = fileInfo.filename
        fileInfo.oldExtension = fileInfo.extension
        fileInfo.filename = name.filename
        fileInfo.extension = name.extension
        this.confirmRenameFile(fileInfo)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    // 文件重命名模态框 确定按钮
    confirmRenameFile(fileInfo) {
      console.log(fileInfo)
      let data = {
        userFileId: fileInfo.id,
        filename: fileInfo.filename
      }
      if (!fileInfo.dir) {
        data.extension = fileInfo.extension
      }
      renameFile(data).then(() => {
        this.$emit('getTableDataByType')
        this.$store.dispatch('showStorage')
        this.$message.success('重命名成功')
      }).catch((err) => {
        fileInfo.filename = fileInfo.oldFilename
        fileInfo.extension = fileInfo.oldExtension
        console.error(err)
        this.$message.error("系统忙，重命名失败")
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
@import '~@/assets/styles/mixins.styl'

.file-grid-wrapper
  .file-list
    height calc(100vh - 206px)
    overflow-y auto
    display flex
    flex-wrap wrap
    align-items flex-start
    align-content flex-start
    setScrollbar(10px)

    .file-item
      margin 0 16px 16px 0
      position relative
      width 120px
      padding 8px
      text-align center
      cursor pointer

      &:hover
        background $tabBackColor

        .file-name
          font-weight 550

      .file-img
        width 80px
        height 80px

      .file-name
        margin-top 8px
        height 44px
        line-height 22px
        font-size 12px
        word-break break-all
        setEllipsis(2)

      .file-checked-wrapper
        position absolute
        top 0
        left 0
        z-index 2
        background rgba(245, 247, 250, 0.5)
        width 100%
        height 100%

        .file-checked
          position absolute
          top 16px
          left 24px

      .file-checked-wrapper.checked
        background rgba(245, 247, 250, 0)

  .right-menu
    position fixed
    display flex
    flex-direction column

    >>> .el-button
      margin 0
      border-radius 0
</style>
