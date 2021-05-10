<template>
  <div class="aside-menu-wrapper" :class="{ expand: !isFold }">
    <!-- 展开 & 收缩分类栏 -->
    <el-tooltip effect="dark" :content="isFold ? '展开分类栏' : '收起分类栏'" placement="right">
      <div class="aside-title" @click="$store.commit('switchFold')">
        <div class="top"></div>
        <i class="el-icon-caret-right" v-show="isFold"></i>
        <i class="el-icon-caret-left" v-show="!isFold"></i>
        <div class="bottom"></div>
      </div>
    </el-tooltip>
    <!-- 分类栏 -->
    <el-menu
        class="aside-menu"
        :default-openeds="[0]"
        :default-active="activeIndex"
        background-color="#909399"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleSelect"
    >
      <el-menu-item :index="FILE_TYPE.ALL">
        <i class="el-icon-menu" title="全部"></i>
        <span slot="title" v-show="!isFold">全部</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.IMAGE" title="图片">
        <i class="el-icon-picture"></i>
        <span slot="title" v-show="!isFold">图片</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.DOC" title="文档">
        <i class="el-icon-document"></i>
        <span slot="title" v-show="!isFold">文档</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.VIDEO" title="视频">
        <i class="el-icon-video-camera-solid"></i>
        <span slot="title" v-show="!isFold">视频</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.MUSIC" title="音乐">
        <i class="el-icon-headset"></i>
        <span slot="title" v-show="!isFold">音乐</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.APP" title="应用">
        <i class="el-icon-s-platform"></i>
        <span slot="title" v-show="!isFold">应用</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.OTHER" title="其他">
        <i class="el-icon-takeaway-box"></i>
        <span slot="title" v-show="!isFold">其他</span>
      </el-menu-item>
      <el-menu-item :index="FILE_TYPE.RECYCLE" title="回收站">
        <i class="el-icon-box"></i>
        <span slot="title" v-show="!isFold">回收站</span>
      </el-menu-item>
    </el-menu>
    <div class="store-wrapper" v-show="!isFold">
      <el-progress :percentage="storagePercentage" :color="storageColor" :show-text="false"></el-progress>
      <div class="text">
        <span>存储</span>
        <span>{{ storageUsedValue | storageTrans }} / {{ storageMaxValue | storageTrans(true) }}</span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'AsideMenu',
  data() {
    return {
      fileListByFiletype: [],
      storageColor: [
        {color: '#67C23A', percentage: 50},
        {color: '#E6A23C', percentage: 80},
        {color: '#F56C6C', percentage: 100}
      ]
    }
  },
  computed: {
    //  当前活跃菜单项index，也是当前被选中的文件类型
    activeIndex() {
      return this.$route.query.fileType
    },
    //  判断当前用户设置的左侧栏是否折叠
    isFold() {
      return this.$store.getters.isFold
    },
    // 存储容量
    storageUsedValue() {
      return this.$store.state.sideMenu.storageUsedValue
    },
    // 最大存储容量
    storageMaxValue() {
      return this.$store.state.sideMenu.storageMaxValue
    },
    // 存储百分比
    storagePercentage() {
      let v = (this.storageUsedValue / this.storageMaxValue) * 100
      if (v<0 || isNaN(v)){
        v = 0;
      }else if(v>100){
        v = 100;
      }
      return Math.ceil(v)
    }
  },
  created(){
    this.$store.dispatch('showStorage')
  },
  methods: {
    //  导航菜单项点击事件
    handleSelect(index) {
      this.$router.push({
        path: '/file',
        query: {pid: this.ROOT_PATH, fileType: index}
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
@import '~@/assets/styles/mixins.styl'

.aside-menu-wrapper
  position relative
  width 76px
  height 100%
  transition width 0.5s
  -webkit-transition width 0.5s

  .aside-title
    position absolute
    top 50%
    left 65px
    z-index 2
    background $Info
    color $BorderLight
    width 12px
    height 100px
    line-height 100px
    cursor pointer
    z-index 3
    // transition left 0.5s
    // -webkit-transition left 0.5s

    &:hover
      opacity 0.7

    i {
      font-size 12px
    }

    .top
      position absolute
      top calc(50% - 50px)
      right 0px
      width: 0;
      height: 0;
      border-bottom: 12px solid transparent;
      border-right: 12px solid #fff;

    .bottom
      position absolute
      top calc(50% + 38px)
      right 0px
      width: 0;
      height: 0;
      border-top: 12px solid transparent;
      border-right: 12px solid #fff;

  >>> .el-menu
    border none
    border-right solid 1px $BorderLight
    width 64px
    height: calc(100vh - 60px);
    overflow: auto;
    setScrollbar(4px, #909399, #EBEEF5)

    .el-menu-item
      i
        color inherit

    .el-menu-item.is-active
      background #545c64 !important

  .store-wrapper
    position absolute
    bottom 0
    left 0
    background $RegularText
    padding: 16px;
    width 220px
    z-index: 2;
    color #fff
    opacity 0.8

    .text {
      margin-top 8px
      display flex
      justify-content space-between
    }

.expand
  width 232px

  .aside-title
    left 221px

  >>> .el-menu
    width 220px
    height: calc(100% - 60px);

    .el-menu-item
      padding-left 40px !important
</style>
