<template>
  <div class="operation-menu-wrapper" :class="'file-type-' + fileType().current()">
    <el-button-group class="operate-group">
      <el-button size="mini" type="primary" icon="el-icon-upload2" id="uploadFileId" @click="upload()"
                 v-if="fileType().isAll()">上传
      </el-button>
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="addFolder()" v-if="fileType().isAll()">新建文件夹
      </el-button>
      <el-button size="mini" type="primary" :disabled="!selectionFile.length" icon="el-icon-delete"
                 @click="deleteSelectedFile()">批量删除
      </el-button>
      <el-button size="mini" type="primary" :disabled="!selectionFile.length" icon="el-icon-download"
                 @click="recoverSelectedFile()" v-if="fileType().isRecycle()">批量恢复
      </el-button>
      <el-button size="mini" type="primary" :disabled="!selectionFile.length" icon="el-icon-rank"
                 @click="moveSelectedFile()" v-if="fileType().isAll()">批量移动
      </el-button>
      <!--            <el-button size="mini" icon="el-icon-document-copy">拷贝</el-button>-->
      <el-button size="mini" type="primary" :disabled="!selectionFile.length" icon="el-icon-download"
                 @click="downloadSelectedFile()" v-if="fileType().isNotRecycle()">批量下载
      </el-button>
    </el-button-group>

    <!-- 全局搜素文件 -->
    <el-input
        v-if="fileType().isAll()"
        class="select-file-input"
        v-model="searchFile.filename"
        placeholder="搜索您的文件"
        size="mini"
        maxlength="255"
        :clearable="true"
        @change="handleSearchInputChange"
        @clear="$emit('getTableDataByType')"
        @keyup.enter.native="handleSearchInputChange(searchFile.filename)"
    >
      <i slot="prefix" class="el-input__icon el-icon-search" title="点击搜索" @click="handleSearchClick"></i>
    </el-input>


    <!-- 批量操作 -->
    <el-button
        class="batch-opera-btn"
        :type="batchOperate ? 'primary' : ''"
        icon="el-icon-finished"
        size="mini"
        v-if="fileModel().isGrid()"
        @click="changeBatchOperate()"
    >
      {{ batchOperate ? '取消批量操作' : '批量操作' }}
    </el-button>


    <!-- 文件展示模式 -->
    <div class="change-file-model">
      <el-radio-group v-model="fileGroupLable" size="mini" @change="changeFileDisplayModel">
        <el-radio-button :label="0"><i class="el-icon-tickets"></i> 列表</el-radio-button>
        <el-radio-button :label="1"><i class="el-icon-s-grid"></i> 网格</el-radio-button>
        <el-radio-button :label="2" v-if="fileType().isImage()"><i class="el-icon-date"></i> 时间线</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 选择表格列 -->
    <SelectColumn class="select-column"></SelectColumn>

    <!-- 多选文件下载，页面隐藏 -->
    <a
        target="_blank"
        v-for="(item, index) in selectionFile"
        :key="index"
        :href="getDownloadPath(item.id)"
        :download="item.filename + '.' + item.extension"
        :title="'downloadLink' + index"
        :ref="'downloadLink' + index"
    ></a>
  </div>
</template>

<script>
import {
  batchDeleteFile, batchRecoverRecycle, batchDeleteRecoveryFile, makeDir
} from '@/request/file.js'
import SelectColumn from './SelectColumn'

export default {
  name: 'OperationMenu',
  props: {
    selectionFile: Array,
    operationFile: Object,
    batchOperate: Boolean //  批量操作模式
  },
  components: {
    SelectColumn
  },
  data() {
    return {
      // 文件搜索数据
      searchFile: {
        filename: ''
      },
      fileTree: [],
      batchDeleteFileDialog: false,
      fileGroupLable: this.FILE_MODEL.TABLE, //  文件展示模式
    }
  },
  computed: {
    //  上传文件组件参数
    uploadFileData: {
      get() {
        let data = {
          folderId: this.filePath().current(),
          isDir: false
        }
        if (!data.folderId) {
          delete data.folderId
        }
        return data;
      },
      set() {
        return {
          folderId: this.ROOT_PATH,
          isDir: false
        }
      }
    },
  },
  watch: {},
  mounted() {
    this.fileGroupLable = this.fileModel().current()
    this.$EventBus.$on('refreshList', () => {
      this.$emit('getTableDataByType')
    })
    this.$EventBus.$on('refreshStorage', () => {
      this.$store.dispatch('showStorage')
    })
  },
  methods: {
    upload() {
      // 打开文件选择框
      this.$EventBus.$emit('openUploader', this.uploadFileData)
    },
    //  新建文件夹按钮：打开模态框
    addFolder() {
      this.$prompt('请输入文件夹名称', '创建文件夹', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({value}) => {
        this.createFolder(value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    },
    //  新建文件夹模态框-确定按钮
    createFolder(filename) {

      if (filename === null || filename === undefined || filename === '') {
        throw new Error("文件名不能为空")
      }
      let data = {
        name: filename,
      }
      if (this.filePath().current()) {
        data.pid = this.filePath().current()
      }
      makeDir(data).then(() => {
        this.$message.success('添加成功')
        this.$emit('getTableDataByType')
      }).catch(err => this.$message.warning(err.msg));
    },

    //  批量操作-删除按钮
    deleteSelectedFile() {
      let data = {
        userFileIds: this.selectionFile.flatMap(row => row.id)
      }
      let deleteApi;
      if (this.fileType().isNotRecycle()){
        deleteApi = batchDeleteFile
      }else{
        deleteApi = batchDeleteRecoveryFile
      }
      //  批量删除接口
      deleteApi(data).then(() => {
        this.$message({
          message: "文件删除成功",
          type: 'success'
        })
        this.$emit('getTableDataByType')
        this.$store.dispatch('showStorage')
      }).catch(err => {
        console.error(err)
        this.$message.error("系统忙，删除失败")
      })
    },
    recoverSelectedFile(){
      let data = {
        userFileIds: this.selectionFile.flatMap(row => row.id)
      }
      //  批量恢复接口
      batchRecoverRecycle(data).then(() => {
        this.$message({
          message: "删除文件已恢复",
          type: 'success'
        })
        this.$emit('getTableDataByType')
        this.$store.dispatch('showStorage')
      }).catch(err => {
        console.error(err)
        this.$message.error("系统忙，恢复失败")
      })
    },
    //  批量操作-移动按钮
    moveSelectedFile() {
      this.$emit('setMoveFileDialogData', true, true)
    },
    //  批量操作：下载按钮
    downloadSelectedFile() {
      for (let i = 0; i < this.selectionFile.length; i++) {
        let name = 'downloadLink' + i
        this.$refs[name][0].click()
      }
    },
    handleSearchInputChange(value) {
      if (value === '') {
        this.$emit('getTableDataByType')
      } else {
        this.$emit('getSearchFileList', value)
      }
    },
    // 图片网格模式下 - 批量操作切换
    changeBatchOperate() {
      this.$emit('update:batchOperate', !this.batchOperate)
    },
    // 切换文件查看模式
    changeFileDisplayModel(label) {
      this.$store.commit('changeFileModel', label)
    },
    handleSearchClick() {
      this.$emit('getSearchFileList', this.searchFile.filename)
    },
  }
}
</script>

<style lang="stylus" scoped>
.operation-menu-wrapper.file-type-6
  margin 8px 0
  justify-content flex-end

.operation-menu-wrapper
  padding 16px 0
  display flex
  justify-content space-between
  align-items: center;

  .operate-group
    flex 1

  .change-image-model,
  .change-file-model
    margin-right 8px

  .batch-opera-btn
    margin-right 8px

  .select-file-input {
    margin-right: 8px;
    width: 200px;

    .el-icon-search {
      cursor: pointer;
      font-size: 16px;

      &:hover {
        color: $Primary;
      }
    }
  }
</style>
