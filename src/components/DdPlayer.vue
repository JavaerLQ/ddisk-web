<template>
  <div
      class="img-review-wrapper"
      v-show="visible"
      @click.self="minVideoReview"
  >
    <!-- 顶部信息栏 & 工具栏 -->
    <div class="tip-wrapper">
      <div class="name" :title="filename" v-text="filename"></div>
      <div class="tool-wrapper">
        <i class="item el-icon-refresh-right el-icon-circle-close" title="关闭视频" @click="closeVideoReview()"></i>
        <a
            class="item download-link"
            target="_blank"
            :href="url"
            :download="filename"
        >
          <i class="el-icon-download" title="保存到本地"></i>
        </a>
        <el-tooltip effect="dark" placement="bottom">
          <div slot="content">
            操作提示：<br/>
            点击视频以外的区域最小化视频；<br/>
            按Esc键可关闭播放器；<br/>
          </div>
          <div class="item text-wrapper">
            <span class="text">操作提示</span>
            <i class="el-icon-question"></i>
          </div>
        </el-tooltip>
      </div>
    </div>
    <!-- 视频查看 -->
    <video-player class="my-player"
                  ref="videoPlayer"
                  :playsinline="true"
                  @playing="onPlayerPlaying($event)"
                  @ended="onPlayerEnded($event)"
                  :options="playerOptions">
    </video-player>
  </div>
</template>

<script>
import {videoPlayer} from 'vue-video-player'
import 'video.js/dist/video-js.css'

export default {
  name: 'VideoPlayer',
  data() {
    return {
      playerOptions: {
        playbackRates: [0.5, 1.0, 1.5, 2.0, 2.5], // 可选的播放速度
        autoplay: true, // 如果为true,浏览器准备好时开始回放。
        muted: false, // 默认情况下将会消除任何音频。
        loop: false, // 是否视频一结束就重新开始。
        preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        // aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: "video/mp4", // 类型
          src: '' // url地址
        }],
        poster: '', // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: true, // 是否显示剩余时间功能
          fullscreenToggle: true // 是否显示全屏按钮
        }
      }
    }
  },
  components: {
    videoPlayer
  },
  computed: {
    visible() {
      return this.$store.state.player.videoPlayer.visible
    },
    filename() {
      return this.$store.state.player.videoPlayer.filename
    },
    url() {
      return this.$store.state.player.videoPlayer.url
    }
  },
  watch: {
    // 监听 图片查看组件 显隐状态变化
    visible(val) {
      let body = document.querySelector('body')
      if (val) {
        // 挂在body下，防止组件元素有样式transform而使position: fixed失效
        body.appendChild(this.$el)
        body.style.overflow = 'hidden'
        // 添加键盘Esc事件
        this.$nextTick(() => {
          document.addEventListener('keyup', (e) => {
            if (e.keyCode === 27) {
              this.closeVideoReview()
            }
          })
        })
      } else {
        body.style.overflow = 'auto'
        document.removeEventListener('keyup', (e) => {
          if (e.keyCode === 27) {
            this.closeVideoReview()
          }
        })
      }
    },
    url() {
      this.playerOptions.sources = [{src: this.url, type: 'video/webm'}]
    }
  },
  methods: {
    //  最小化
    minVideoReview() {
      this.$message.success(this.filename + "正在后台播放")
      this.$store.commit('setVideoPlayMin')
    },
    closeVideoReview() {
      this.$message.success("视频播放器已关闭")
      this.$store.commit("setPlaying", false)
      this.$store.commit('closeVideoPlay')
    },
    // 已开始播放回调
    onPlayerPlaying() {
      this.$store.commit("setPlaying", true)
    },
    // 视频播完回调
    onPlayerEnded() {
      this.$store.commit("setPlaying", false)
    },
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'

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

  .tip-wrapper
    position fixed
    top 0
    left 0
    z-index 2011
    background rgba(0, 0, 0, 0.5)
    padding 0 48px
    width 100%
    height 48px
    line-height 48px
    color #fff
    font-size 16px
    display flex
    justify-content space-between

    .name
      flex 1
      padding-right 16px
      text-align left
      overflow hidden
      text-overflow ellipsis
      white-space nowrap

    .tool-wrapper
      flex 1
      display flex
      justify-content flex-end

      .item
        margin-left 16px
        cursor pointer

        &:hover
          opacity 0.7

      .el-icon-refresh-right
        line-height 48px
        font-size 18px

      .download-link
        color inherit
        font-size 18px

      .text-wrapper
        margin-left 32px

        .text
          margin-right 8px


  .my-player
    width 70%
    height 70%
    display flex
    align-items center
    margin 0 auto
</style>
