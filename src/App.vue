<template>
  <div id="app">
    <Header v-if="isHeaderShow" id="headWrapper"></Header>
    <keep-alive>
      <router-view class="mainContent"></router-view>
    </keep-alive>
    <Footer v-if="isFooterShow"></Footer>
    <el-backtop class="backtop" target="#app" title="快点我，带你上天！"></el-backtop>
    <!-- 将上传组件全局注册 -->
    <global-uploader></global-uploader>
    <!-- 查看大图 -->
    <ImgReview></ImgReview>
    <!-- 视频组件 -->
    <VideoPlayer></VideoPlayer>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import globalUploader from '@/components/GlobalUploader.vue'
import ImgReview from '@/components/ImgReview'
import VideoPlayer from "@/components/DdPlayer";

export default {
  name: 'App',
  components: {
    VideoPlayer,
    Header,
    Footer,
    globalUploader,
    ImgReview
  },
  computed: {
    //  头部是否显示
    isHeaderShow() {
      let routerNameList = ['Error_401', 'Error_404', 'Error_500']
      if (routerNameList.includes(this.$route.name)) {
        return false
      } else {
        return true
      }
    },
    //  底部是否显示
    isFooterShow() {
      let routerNameList = [
        'File',
        'Error_401',
        'Error_404',
        'Error_500'
      ]
      if (routerNameList.includes(this.$route.name)) {
        return false
      } else {
        return true
      }
    }
  },
  data() {
    return {}
  }
}
</script>
<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
#app
  height 100%
  overflow-x hidden
  -webkit-text-size-adjust none
  overflow-y auto
  >>> .el-backtop
    background-color $Success
    color #fff
    z-index 3
  .mainContent
    flex 1
    width 90%
    min-height calc(100vh - 70px)
    margin 0 auto
    display flex
</style>
