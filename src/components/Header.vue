<template>
  <div class="headerWrapper">
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" router>
      <el-menu-item class="headerLogo" disabled>
        <img class="logo" :src="logoUrl"/>
      </el-menu-item>
      <el-menu-item class="headerItem" index="1" :route="{ name: 'File', query: { fileType: FILE_TYPE.ALL } }">丢丢网盘
      </el-menu-item>
      <el-menu-item class="headerItem userDisplay right-menu-item" v-show="isLogin">
        <el-avatar :size="34" :src="user.imgUrl" fit="cover">
          <img :src="userImgDefault"/>
        </el-avatar>
        <span class="username-header" v-text="user.username"></span>
      </el-menu-item>
      <el-menu-item class="headerItem exit right-menu-item" v-show="isLogin"  @click="exitButton()">退出
      </el-menu-item>
      <el-menu-item class="headerItem login right-menu-item" v-show="!isLogin" index="4" :route="{ name: 'Login' }"
      >登录
      </el-menu-item
      >
      <!-- 开发环境 -->
      <el-menu-item
          class="headerItem register right-menu-item"
          v-show="!isLogin"
          index="5"
          :route="{ name: 'Register' }"
      >注册
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>

import {logout} from "@/request/user.js";
import {mapGetters} from 'vuex'

export default {
  name: 'Header',
  data() {
    return {
      logoUrl: require('@/assets/images/common/logo.png'),
      userImgDefault: require('@/assets/images/settings/userImg.png')
    }
  },
  computed: {
    ...mapGetters(['isLogin', 'user', 'isPlaying']),
    activeIndex: {
      get() {
        let routerName = this.$route.name
        const ROUTERMAP = {
          File: '1',
          Login: '4',
          Register: '5'
        }
        return ROUTERMAP[routerName]
      },
      set() {
        return '1'
      }
    }
  },
  methods: {
    //  退出登录
    exitButton() {
      logout().then(() => {
        this.$message.success('退出登录成功！')
        this.$store.dispatch('getUserInfo').then(() => {
          this.$router.push({path: '/login'})
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
.headerWrapper
  width 100%
  padding 0 20px
  box-shadow $tabBoxShadow

  >>> .el-menu--horizontal
    .el-menu-item:not(.is-disabled):hover
      border-bottom-color $Primary !important
      background $tabBackColor

  .el-menu-demo
    display flex
    position relative

    .headerLogo
      color $Primary
      font-size 60px
      opacity 1
      cursor default

      a
        display block

      .logo
        height 40px
        vertical-align baseline

    .right-menu-item
      position absolute

    .userDisplay
      right 70px
      width 180px

      .username-header
        margin-left 6px
        min-width 60px
        display inline-block
        text-align center

    .exit
      right 0

    .login
      right 70px

    .register
      right 0px
</style>
