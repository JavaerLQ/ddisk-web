<template>
  <div class="file-table-wrapper">
    <!-- 文件表格 -->
    <el-table
        class="file-table"
        :class="'file-type-' + fileType().current()"
        ref="multipleTable"
        fit
        v-loading="loading"
        element-loading-text="文件加载中……"
        tooltip-effect="dark"
        :data="fileList"
        :default-sort="{ prop: 'dir', order: 'descending' }"
        @select-all="selectAllFileRow"
        @select="selectFileRow"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="dir" width="60" align="center">
        <template slot-scope="scope">
          <img :src="setFileImg(scope.row)" style="width: 30px;"/>
        </template>
      </el-table-column>
      <el-table-column prop="filename" :sort-by="['dir', 'filename']" sortable show-overflow-tooltip>
        <template slot="header">
          <span>文件名</span>
        </template>
        <template slot-scope="scope">
          <div style="cursor:pointer;" @click="clickFileName(scope.row)">
            {{ scope.row | filenameComplete }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="fileType().isRecycle() ? '原路径' : '路径'" prop="pid" show-overflow-tooltip
                       v-if="fileType().isNotAll()">
        <template slot-scope="scope">
          <span
              style="cursor: pointer;"
              title="点击跳转"
              @click="$router.push({ query: { pid: scope.row.pid, fileType: FILE_TYPE.ALL } })" v-text="getFilePath(scope.row.pid)"></span>
        </template>
      </el-table-column>
      <el-table-column
          label="类型"
          width="80"
          prop="extension"
          :sort-by="['dir', 'extension']"
          sortable
          show-overflow-tooltip
          v-if="selectedColumnList.includes('extension')"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.extension">{{ scope.row.extension }}</span>
          <span v-else>文件夹</span>
        </template>
      </el-table-column>
      <el-table-column
          label="大小"
          width="80"
          prop="fileSize"
          :sort-by="['dir', 'fileSize']"
          sortable
          show-overflow-tooltip
          align="right"
          v-if="selectedColumnList.includes('fileSize')"
      >
        <template slot-scope="scope">
          <div style="padding: 0 10px;">{{ calculateFileSize(scope.row.fileSize) }}</div>
        </template>
      </el-table-column>
      <el-table-column
          label="修改日期"
          prop="updateTime"
          width="180"
          :sort-by="['dir', 'updateTime']"
          show-overflow-tooltip
          sortable
          v-if="selectedColumnList.includes('updateTime')"
      ></el-table-column>
      <el-table-column
          label="删除日期"
          prop="deleteTime"
          width="180"
          :sort-by="['dir', 'deleteTime']"
          show-overflow-tooltip
          sortable
          v-if="fileType().isRecycle() && selectedColumnList.includes('deleteTime')"
      ></el-table-column>
      <el-table-column :width="operaColumnWidth">
        <template slot="header">
          <span>操作</span>
          <i
              class="el-icon-circle-plus"
              title="展开操作列按钮"
              @click="$store.commit('changeOperaColumnExpand', FOLD_TYPE.UNFOLD)"
          ></i>
          <i class="el-icon-remove" title="收起操作列按钮"
             @click="$store.commit('changeOperaColumnExpand', FOLD_TYPE.FOLD)"></i>
        </template>
        <template slot-scope="scope">
          <div v-if="operaColumnExpand">
            <el-button type="danger" size="mini" @click.native="deleteFileBtn(scope.row)">删除</el-button>
            <el-button type="success" size="mini" @click.native="recoverFileBtn(scope.row)" v-if="fileType().isRecycle()">恢复</el-button>
            <el-button type="primary" size="mini" @click.native="showMoveFileDialog(scope.row)"
                       v-if="fileType().isNotRecycle()">移动</el-button>
            <el-button type="primary" size="mini" @click.native="renameFile(scope.row)"
                       v-if="fileType().isNotRecycle()">重命名</el-button>
            <el-button type="success" size="mini" v-if="scope.row.dir==false && fileType().isNotRecycle()">
              <a
                  target="_blank"
                  style="display: block;color: inherit;"
                  :href="getDownloadPath(scope.row.id)"
                  :download="scope.row.filename + '.' + scope.row.extension"
              >下载</a
              >
            </el-button>
            <!--            <el-button-->
            <!--                type="warning"-->
            <!--                size="mini"-->
            <!--                @click.native="unzipFile(scope.row)"-->
            <!--                v-if="fileType().isNotRecycle() && (scope.row.extension == 'zip' || scope.row.extension == 'rar')"-->
            <!--            >解压缩-->
            <!--            </el-button>-->
          </div>
          <el-dropdown trigger="click" v-else>
            <el-button size="mini">
              操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="deleteFileBtn(scope.row)">删除</el-dropdown-item>
              <el-dropdown-item @click.native="recoverFileBtn(scope.row)" v-if="fileType().isRecycle()">恢复
              </el-dropdown-item>
              <el-dropdown-item @click.native="showMoveFileDialog(scope.row)" v-if="fileType().isNotRecycle()">移动
              </el-dropdown-item>
              <el-dropdown-item @click.native="renameFile(scope.row)" v-if="fileType().isNotRecycle()">重命名
              </el-dropdown-item>
              <!--              <el-dropdown-item-->
              <!--                  v-if="scope.row.extension === 'zip' && fileType().isNotRecycle()"-->
              <!--                  @click.native="unzipFile(scope.row)">解压缩-->
              <!--              </el-dropdown-item>-->
              <el-dropdown-item v-if="scope.row.dir == false && fileType().isNotRecycle()">
                <a
                    target="_blank"
                    style="display: block;color: inherit;"
                    :href="getDownloadPath(scope.row.id)"
                    :download="scope.row.filename + '.' + scope.row.extension">下载</a>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {unzipfile, deleteFile, renameFile, deleteRecoveryFile, recoverRecycleFile} from '@/request/file.js'
import {mapGetters} from 'vuex'
import {filenameComplete, filenameSplit} from "@/filters";

export default {
  name: 'FileTable',
  props: {
    fileList: Array,  //  文件列表
    loading: Boolean
  },
  data() {
    return {
      //  移动文件模态框数据
      dialogMoveFile: {
        isBatchMove: false,
        visible: false, //  是否可见
        fileTree: [], //  目录树
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      },
      viewFilePath: '',
    }
  },
  computed: {
    //  selectedColumnList:判断当前用户设置的左侧栏是否折叠, operaColumnExpand:判断当前用户设置的操作列是否展开
    ...mapGetters(['selectedColumnList', 'operaColumnExpand','getFilePath']),
    //  判断当前路径下是否有普通文件
    isIncludeNormalFile() {
      return this.fileList.map((data) => data.dir).includes(false)
    },
    //  判断当前路径下是否有压缩文件
    isIncludeZipRarFile() {
      return (
          this.fileList.map((data) => data.extension).includes('zip') ||
          this.fileList.map((data) => data.extension).includes('rar')
      )
    },
    operaColumnWidth() {
      return this.fileType().isRecycle()
          ? 150 : this.operaColumnExpand
              ? this.isIncludeNormalFile ? 290 : 220 : 100
    },
  },
  methods: {
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
          // window.open(this.getFileOnlineViewPathByOffice(row.id), '_blank')
          window.open(this.getDownloadPath(row.id), '_blank')
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
        if (this.VIDEO_TYPE_LIST.includes(row.extension)) {
          let data = {
            visible : true,
            url: this.getDownloadPath(row.id),
            filename: row.filename + '.' + row.extension
          }
          this.$store.commit('setVideoReviewData', data)
        }
        //  若当前点击项是视频mp3格式
        if (this.MUSIC_TYPE_LIST.includes(row.extension)) {
          let data = {
            visible : true,
            url: this.getDownloadPath(row.id),
            filename: row.filename + '.' + row.extension
          }
          this.$store.commit('setVideoReviewData', data)
        }
      }
    },

    /**
     * 表格勾选框事件
     */
    //  表格-全选事件, selectoin 勾选的行数据
    selectAllFileRow(selection) {
      this.$emit('setSelectionFile', selection)
    },
    //  表格-选中一行事件, selectoin 勾选的行数据
    selectFileRow(selection) {
      this.$emit('setSelectionFile', selection)
    },

    /**
     * 移动按钮相关事件
     */
    //  操作列-移动按钮：打开移动文件模态框
    showMoveFileDialog(file) {
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
      }).catch(err=>{
        console.log(err)
        this.$message.error("系统忙，解压失败")
      })
    },

    /**
     * 恢复按钮事件
     */
    recoverFileBtn(fileInfo){
      let data = {
        userFileId: fileInfo.id
      }
      if (this.fileType().isRecycle()) { //  回收站里 - 彻底删除
        this.$confirm('是否恢复该文件?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          recoverRecycleFile(data).then(()=>
              this.$message({
                type: 'success',
                message: filenameComplete(fileInfo) + '已恢复'
              })
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
          console.error(err)
          this.$message.error("系统忙，删除失败")
        })
      } else {  //  非回收站删除
        deleteFile(data).then(() => {
          this.$emit('getTableDataByType')
          this.$store.dispatch('showStorage')
          this.$message.success('删除成功')
        }).catch(err => {
          console.error(err)
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
        if (!name.filename){
          throw new Error("错误文件名")
        }
        if (fileInfo.filename===name.filename && fileInfo.extension===name.extension){
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
      if (!fileInfo.dir){
        data.extension = fileInfo.extension
      }
      renameFile(data).then(() => {
          this.$emit('getTableDataByType')
          this.$store.dispatch('showStorage')
          this.$message.success('重命名成功')
      }).catch((err)=>{
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
.file-table-wrapper
  margin-top 2px

  .file-type-0
    height calc(100vh - 206px) !important

    >>> .el-table__body-wrapper
      height calc(100vh - 264px) !important

  .file-type-6
    height calc(100vh - 211px) !important

    >>> .el-table__body-wrapper
      height calc(100vh - 263px) !important

  .file-table
    width 100% !important
    height calc(100vh - 203px)

    >>> .el-table__header-wrapper
      th
        background $tabBackColor
        padding 8px 0

      .el-icon-circle-plus, .el-icon-remove
        margin-left 6px
        cursor pointer
        font-size 16px

        &:hover
          color $Primary

    >>> .el-table__body-wrapper
      height calc(100vh - 255px)
      overflow-y auto
      setScrollbar(10px)

      td
        padding 8px 0

  .img-review-wrapper
    position fixed
    top 0
    right 0
    bottom 0
    left 0
    overflow auto
    width 100%
    height 100%
    z-index 2010
    text-align center
    display flex
    align-items center
    animation imgReviewAnimation 0.3s
    -webkit-animation imgReviewAnimation 0.3s /* Safari and Chrome */
    animation-iteration-count 0.3
    -webkit-animation-iteration-count 0.3
    animation-fill-mode forwards
    -webkit-animation-fill-mode forwards /* Safari 和 Chrome */
    @keyframes imgReviewAnimation
      0%
        background transparent
      100%
        background rgba(0, 0, 0, 0.8)
    @keyframes imgReviewAnimation
      0%
        background transparent
      100%
        background rgba(0, 0, 0, 0.8)

    .img-large
      margin 0 auto
      max-width 80%
      max-height 100%
</style>
