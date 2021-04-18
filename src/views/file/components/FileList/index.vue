<template>
  <div class="file-list-wrapper">
    <!-- 操作按钮 -->
    <el-header>
      <OperationMenu
          :operationFile="operationFile"
          :selectionFile="selectionFile"
          :filePath="filePath().current()"
          :batchOperate.sync="batchOperate"
          @getSearchFileList="getSearchFileList"
          @getTableDataByType="getTableDataByType"
          @setMoveFileDialogData="setMoveFileDialogData"
      ></OperationMenu>
    </el-header>
    <div class="middle-wrapper">
      <!-- 面包屑导航栏 -->
      <BreadCrumb class="breadcrumb"></BreadCrumb>
    </div>
    <!-- 文件列表-表格模式 -->
    <FileTable
        :fileList="fileList"
        :loading="loading"
        v-if="fileModel().isTable()"
        @setMoveFileDialogData="setMoveFileDialogData"
        @setOperationFile="setOperationFile"
        @setSelectionFile="setSelectionFile"
        @getTableDataByType="getTableDataByType"
    ></FileTable>
    <!-- 文件列表-网格模式 -->
    <FileGrid
        :fileList="fileList"
        :loading="loading"
        :batchOperate="batchOperate"
        v-if="fileModel().isGrid()"
        @setMoveFileDialogData="setMoveFileDialogData"
        @setOperationFile="setOperationFile"
        @setSelectionFile="setSelectionFile"
        @getTableDataByType="getTableDataByType"
    ></FileGrid>
    <!-- 图片-时间线模式 -->
    <FileTimeLine class="image-model" v-if="fileModel().isTimeLine()" :fileList="fileList"></FileTimeLine>
    <div class="pagination-wrapper">
      <div class="current-page-count">当前页{{ fileList.length }}条</div>
      <el-pagination
          :current-page="pageData.currentPage"
          :page-size="pageData.pageCount"
          :total="pageData.total"
          :page-sizes="[10, 50, 100, 200]"
          layout="sizes, total, prev, pager, next"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
      >
      </el-pagination>
    </div>
    <!-- 移动文件模态框 -->
    <MoveFileDialog
        :dialogMoveFile="dialogMoveFile"
        @setSelectFilePath="setSelectFilePath"
        @confirmMoveFile="confirmMoveFile"
        @setMoveFileDialogData="setMoveFileDialogData"
    ></MoveFileDialog>
  </div>
</template>

<script>
import OperationMenu from './components/OperationMenu'
import BreadCrumb from './components/BreadCrumb'
import FileTable from './components/FileTable'
import FileGrid from './components/FileGrid'
import FileTimeLine from './components/FileTimeLine'
import MoveFileDialog from './components/MoveFileDialog'

import {
  getFileList,
  selectFileByFileType,
  getRecoveryFile,
  getFileTree,
  moveFile,
  batchMoveFile,
  searchFile,
} from '@/request/file.js'


export default {
  name: 'FileList',
  components: {
    OperationMenu,
    BreadCrumb,
    FileTable,
    FileGrid,
    FileTimeLine,
    MoveFileDialog
  },
  data() {
    return {
      fileNameSearch: '',
      loading: true, //  表格数据-loading
      fileList: [], //  表格数据-文件列表
      pageData: {
        currentPage: 1,
        pageCount: 10,
        total: 0
      },
      //  移动文件模态框数据
      dialogMoveFile: {
        isBatchMove: false,
        visible: false, //  是否可见
        fileTree: [] //  目录树
      },
      selectFilePath: Number, //  移动文件路径
      operationFile: {}, // 当前操作行
      selectionFile: [], // 勾选的文件
      batchOperate: false //  批量操作模式
    }
  },
  computed: {
    //  当前查看的文件路径
    currentPath: {
      get() {
        return this.$route.query.pid
      },
      set() {
        return this.ROOT_PATH
      }
    },
    // 文件类型
    currentFileType: {
      get() {
        return this.$route.query.fileType
      },
      set() {
        return this.FILE_TYPE.ALL
      }
    },
    // 文件查看模式 0列表模式 1网格模式 2 时间线模式
    currentFileModel() {
      return this.$store.getters.fileModel
    },
  },
  watch: {
    currentPath() {
      if (this.isLoginPage()){
        return
      }
      this.setPageCount()
      this.getTableDataByType()
    },
    currentFileType(newValue, oldValue) {
      if (this.isLoginPage()){
        return
      }
      if (oldValue === this.FILE_TYPE.IMAGE && this.fileModel().isTimeLine()) {
        this.$store.commit('changeFileModel', this.FILE_MODEL.TABLE)
      }
      this.setPageCount()
      this.getTableDataByType()
    },
    // 监听文件查看模式
    currentFileModel() {
      this.setPageCount()
      this.getTableDataByType()
    }
  },
  created() {
    this.$store.dispatch('fetchPathTreeMap')
    this.setPageCount()
    this.getTableDataByType()
  },
  methods: {
    /**
     * 表格数据获取相关事件
     */
    reflushFileList(res) {
      this.loading = false
      this.fileList = res.data
      this.pageData.total = res.total
    },
    // 调整分页大小
    setPageCount() {
      this.pageData.currentPage = 1
      if (this.fileModel().isTable()) {
        this.pageData.pageCount = 10
      }
      if (this.fileModel().isGrid()) {
        this.pageData.pageCount = 40
      }
    },
    // 获取文件列表数据
    getTableDataByType() {
      this.batchOperate = false
      this.loading = true

      // 分类型
      if (this.fileType().isNotAll()) {
        if (this.fileType().isRecycle()) {
          this.showFileRecovery() //  回收站
        } else {
          this.showFileListByType()
        }
      } else {
        // 全部文件
        this.showFileList()
      }
    },
    // 获取当前路径下的文件列表
    showFileList() {
      let data = {
        pid: this.currentPath,
        currentPage: this.pageData.currentPage,
        pageCount: this.pageData.pageCount
      }
      getFileList(data).then((res) => {
        this.reflushFileList(res)
      }).catch(err => {
        console.log(err)
        this.$message.error("服务器正忙")
      })
    },
    // 分页组件 当前页码改变
    handleCurrentChange(currentPage) {
      this.pageData.currentPage = currentPage
      this.getTableDataByType()
    },
    handleSizeChange(pageCount) {
      this.pageData.pageCount = pageCount
      this.getTableDataByType()
    },
    // 获取回收站文件列表
    showFileRecovery() {
      let data = {
        currentPage: this.pageData.currentPage,
        pageCount: this.pageData.pageCount
      }
      getRecoveryFile(data).then((res) => {
        this.reflushFileList(res)
      }).catch(err =>{
        console.log(err)
        this.$message.error("服务器正忙")
      })
    },
    // 根据文件类型展示文件列表
    showFileListByType() {
      //  分类型
      let data = {
        currentPage: this.pageData.currentPage,
        pageCount: this.pageData.pageCount,
        fileType: this.fileType().current()
      }
      selectFileByFileType(data).then((res) => {
        this.fileList = res.data
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.$message.error("服务器正忙")
      })
    },

    /**
     * 表格勾选框事件
     */
    //  勾选的行
    setSelectionFile(selection) {
      this.selectionFile = selection
    },

    /**
     * 移动按钮相关事件
     */
    //  当前操作行
    setOperationFile(operationFile) {
      this.operationFile = operationFile
    },
    //  设置移动文件模态框相关数据，isBatchMove为null时是确认移动，值由之前的值而定
    setMoveFileDialogData(isBatchMove, visible) {
      this.initFileTree()
      this.dialogMoveFile.isBatchMove = isBatchMove ? isBatchMove : this.dialogMoveFile.isBatchMove
      this.dialogMoveFile.visible = visible
    },
    //  移动文件模态框：初始化文件目录树
    initFileTree() {
      getFileTree().then((res) => {
        this.dialogMoveFile.fileTree = [res]
      }).catch(err => {
        console.log(err)
        this.$message.error("服务器正忙")
      })
    },
    //  设置移动后的文件路径
    setSelectFilePath(selectFilePath) {
      this.selectFilePath = selectFilePath
    },
    //  移动文件模态框-确定按钮事件
    confirmMoveFile() {
      if (this.dialogMoveFile.isBatchMove) {
        //  批量移动
        let data = {
          from: this.selectionFile.flatMap(row => row.id),
          to: this.selectFilePath
        }
        if (!data.to) {
          delete data.to
        }
        batchMoveFile(data).then(() => {
          this.$message.success("文件移动成功")
          this.getTableDataByType()
          this.dialogMoveFile.visible = false
          this.selectionFile = []
          this.$store.dispatch('fetchPathTreeMap')
        }).catch(err => {
          console.error(err)
          this.$message.error("系统忙，移动失败")
        })
      } else {
        //  单文件移动
        let data = {
          from: this.operationFile.id,
          to: this.selectFilePath,
        }
        if (!data.to) {
          delete data.to
        }
        moveFile(data).then(() => {
          this.$store.dispatch('fetchPathTreeMap')
          this.$message.success('移动文件成功')
          this.getTableDataByType()
          this.dialogMoveFile.visible = false
        }).catch(err => {
          console.error(err)
          this.$message.error("系统忙，移动失败")
        })
      }
    },
    // 获取搜索文件结果列表
    getSearchFileList(filename) {
      this.loading = true
      searchFile({
        currentPage: this.pageData.currentPage,
        pageCount: this.pageData.pageCount,
        filename: filename
      }).then(res => {
        this.reflushFileList(res)
      }).catch(err => {
        console.error(err)
        this.$message.error("服务器正忙")
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
.file-list-wrapper
  >>> .el-header
    padding 0

  .middle-wrapper
    margin-bottom 8px

  .pagination-wrapper
    position relative
    border-top 1px solid $BorderBase
    height 44px
    line-height 44px
    text-align center

    .current-page-count
      position absolute
      left 16px
      height 32px
      line-height 32px
      font-size 13px
      color $RegularText
</style>
