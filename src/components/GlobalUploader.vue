<template>
  <div id="global-uploader">

    <!-- 上传 -->
    <uploader
        ref="uploader"
        :options="options"
        :autoStart="false"
        @file-added="filesAdded"
        @file-success="onFileSuccess"
        @file-progress="onFileProgress"
        @file-error="onFileError"
        class="uploader-app">
      <uploader-unsupport></uploader-unsupport>

      <uploader-btn id="global-uploader-btn" :attrs="attrs" ref="uploadBtn">选择文件</uploader-btn>

      <uploader-list v-show="panelShow">
        <div class="file-panel" slot-scope="props" :class="{'collapse': collapse}">
          <div class="file-title">
            <span class="title-span">上传列表</span>
            <div class="operate">
              <el-button @click="fileListShow" type="text" :title="collapse ? '展开':'折叠' ">
                <i class="iconfont" :class="collapse ? 'el-icon-full-screen': 'el-icon-minus'"></i>
              </el-button>
              <el-button @click="close" type="text" title="关闭">
                <i class="iconfont el-icon-close"></i>
              </el-button>
            </div>
          </div>

          <ul class="file-list">
            <li v-for="file in props.fileList" :key="file.id">
              <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true"></uploader-file>
            </li>
            <div class="no-file" v-if="!props.fileList.length"><i class="iconfont icon-empty-file"></i> 暂无待上传文件</div>
          </ul>
        </div>
      </uploader-list>

    </uploader>

  </div>
</template>

<script>
import {url} from "@/request/http";
import {mergeFile} from "@/request/file";
import SparkMD5 from 'spark-md5'
import {CHUNK_SIZE} from "@/global/globalConst";

export default {
  data() {
    return {
      options: {
        target: url('/transfer/upload'), // 目标上传 URL
        chunkSize: CHUNK_SIZE, // 1M
        fileParameterName: 'file',
        maxChunkRetries: 3,
        simultaneousUploads: 5, //并发上传数
        forceChunkSize: true,
        testChunks: true,   //是否开启服务器分片校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          let data = JSON.parse(message);
          if (data.skipUpload) {
            return true;
          }
          return (data.uploaded || []).indexOf(chunk.offset + 1) >= 0
        },
        parseTimeRemaining: function (timeRemaining, parsedTimeRemaining) {
          return parsedTimeRemaining
              .replace(/\syears?/, '年')
              .replace(/\days?/, '天')
              .replace(/\shours?/, '小时')
              .replace(/\sminutes?/, '分钟')
              .replace(/\sseconds?/, '秒')
        },
        query() {
        },
      },
      attrs: {
        accept: '*'
      },
      panelShow: false,   //选择文件后，展示上传panel
      collapse: false,
    }
  },
  mounted() {
    this.$nextTick(()=>{
      this.$EventBus.$on('openUploader', query => {
        this.params = query || {};
        if (this.$refs.uploadBtn) {
          this.$refs.uploadBtn.$el.click()
        }
      });
    })
   
  },
  computed: {
    //Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    }
  },
  methods: {
    // 添加文件的回调
    filesAdded(file) {
      this.panelShow = true;
      this.computeMD5(file);
    },
    onFileProgress(rootFile, file, chunk) {
      console.log(`上传中 ${file.name}，chunk：${chunk.startByte / CHUNK_SIZE} ~ ${Math.ceil(chunk.endByte / CHUNK_SIZE)}`)
    },
    // 文件上传成功的回调
    onFileSuccess(rootFile, file, response, chunk) {

      let uploadSuccess = (file)=> {
        this.statusRemove(file.id);
        this.$EventBus.$emit('refreshList', "")
        this.$EventBus.$emit('refreshStorage', "")
        this.$message.success(`${file.name} - 上传完毕`)
      }
      let res = JSON.parse(response)


      // 如果服务端返回需要合并
      if (res.needMerge) {
        this.statusSet(file.id, "merging")
        mergeFile({
          filename: file.name,
          chunkSize: chunk.chunkSize,
          folderId: this.filePath().current(),
          identifier: file.uniqueIdentifier
        }).then(data => {
          // 文件合并成功
          console.log(data)
          uploadSuccess(file);
        }).catch(err => {
          console.error(err)
          this.$message.error("系统忙，合并失败")
          this.statusSet(file.id, 'failed');
        });
      } else {
        // 不需要合并
        uploadSuccess(file);
      }
    },
    onFileError(rootFile, file, response, chunk) {

      // 文件状态设为“失败”
      this.statusSet(file.id, 'failed');
      this.$message({
        message: "文件上传失败",
        type: 'error'
      })
    },
    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    computeMD5(file) {
      let fileReader = new FileReader();
      let time = new Date().getTime();
      let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
      let currentChunk = 0;
      let chunks = Math.ceil(file.size / CHUNK_SIZE);
      let spark = new SparkMD5.ArrayBuffer();

      let loadNext = ()=>{
        let start = currentChunk * CHUNK_SIZE;
        let end = ((start + CHUNK_SIZE) >= file.size) ? file.size : start + CHUNK_SIZE;
        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      };

      // 文件状态设为"计算MD5"
      this.statusSet(file.id, 'md5');
      file.pause();
      loadNext();
      fileReader.onload = e => {
        spark.append(e.target.result);
        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();
          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            $(`.myStatus_${file.id}`).text('校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%')
          })
        } else {
          let md5 = spark.end();
          this.computeMD5Success(md5, file);
          console.log(`MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${new Date().getTime() - time} ms`);
        }
      };
      fileReader.onerror = () => {
        this.error(`文件${file.name}读取出错，请检查该文件`)
        file.cancel();
      };
    },
    computeMD5Success(md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      Object.assign(this.uploader.opts, {
        query: {
          ...this.params,
        }
      })
      file.uniqueIdentifier = md5;
      file.resume();
      this.statusRemove(file.id);
    },
    fileListShow() {
      let $list = $('#global-uploader .file-list');
      if ($list.is(':visible')) {
        $list.slideUp();
        this.collapse = true;
      } else {
        $list.slideDown();
        this.collapse = false;
      }
    },
    close() {
      this.uploader.cancel();
      this.panelShow = false;
    },
    /**
     * 新增的自定义的状态: 'md5'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {
      // debugger
      let statusMap = {
        md5: {
          text: '校验MD5',
          bgc: '#fff'
        },
        merging: {
          text: '合并中',
          bgc: '#e2eeff'
        },
        transcoding: {
          text: '转码中',
          bgc: '#e2eeff'
        },
        failed: {
          text: '上传失败',
          bgc: '#e2eeff'
        }
      }
      this.$nextTick(() => {
        $(`<p class="myStatus_${id}"></p>`).appendTo(`.file_${id} .uploader-file-status`).css({
          'position': 'absolute',
          'top': '0',
          'left': '0',
          'right': '0',
          'bottom': '0',
          'zIndex': '1',
          'backgroundColor': statusMap[status].bgc
        }).text(statusMap[status].text);
      })
    },
    statusRemove(id) {
      this.$nextTick(() => {
        $(`.myStatus_${id}`).remove();
      })
    },
    error(msg) {
      this.$notify({
        title: '错误',
        message: msg,
        type: 'error',
        duration: 2000
      })
    }
  },
  watch: {},
  destroyed() {
    this.$off('openUploader');
  },
  components: {}
}
</script>

<style lang="stylus" scoped>
#global-uploader {
  position: fixed;
  z-index: 20;
  right: 15px;
  bottom: 15px;

  .uploader-app {
    width: 520px;
  }

  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, .2);

    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;

      .title-span {
        padding-left: 0;
        margin-bottom: 0;
        font-size: 17px;
        color: #303133;
      }

      .operate {
        flex: 1;
        text-align: right;
      }
    }

    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;

      > li {
        background-color: #fff;
      }
    }

    &.collapse {
      .file-title {
        background-color: #E7ECF2;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  /deep/ .uploader-file-icon {
    &:before {
      content: '' !important;
    }

    &[icon=image] {
      background: url(/assets/images/file/file_pic.png);
    }

    &[icon=video] {
      background: url(/assets/images/file/file_video.png);
    }

    &[icon=document] {
      background: url(/assets/images/file/file_txt.png);
    }
  }

  /deep/ .uploader-file-actions > span {
    margin-right: 6px;
  }
}

/* 隐藏上传按钮 */
#global-uploader-btn {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}
</style>
