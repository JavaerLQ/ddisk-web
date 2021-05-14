<template>
  <div class="footer-wrapper">
    <ScpDivider></ScpDivider>
    <div class="footer-top">
      <div class="info">
        <img class="logo" :src="logoUrl" />
        <div class="link-wrapper" align="middle">
          <div class="info-website">Author: Richard</div>
          <div class="info-email">Email：<a href="mailto: 974102233@qq.com">974102233@qq.com</a></div>
          <div class="info-welcome"><b>
            <p>体验账号:superman 密码:1234567</p>
            <p><font color="red">温馨提示：使用体验账号很可能会被挤下线，如需更好的体验，请自行注册账号！</font></p>
          </b>
          </div>
        </div>
      </div>
      <div class="code-2-img-wrapper">
        <div class="code-info">
          <img class="code-2-img" :src="wechatImg" />
          <p class="code-2-text">个人微信</p>
        </div>
      </div>
    </div>
    <div class="copy-right-wrapper">
      <div class="tip-website">为获得最佳浏览体验，建议使用IE11、FireFox50.5、Chrome51.0及以上版本的浏览器</div>
    </div>
  </div>
</template>

<script>
import ScpDivider from '@/components/ScpDivider'

export default {
  name: 'Footer',
  components: {
    ScpDivider
  },
  data() {
    return {
      logoUrl: require('@/assets/images/common/logo.png'),
      wechatImg: require('@/assets/images/footer/wechatImg.png')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
.footer-wrapper
  background $Info
  margin-top 20px
  >>> .divider
    height 3px
    margin 0
  .footer-top
    width 90%
    margin 0 auto
    padding 40px 0
    display flex
    justify-content space-between
    .info
      display flex
      width 75%
      .logo
        height 126px
      .link-wrapper
        color $BorderLight
        flex 1
        padding 20px 10px 10px 40px
        line-height 40px
        .info-website
          .phone
            .phone-number
              font-size 28px
              padding-bottom 4px
            .phone-text
              text-align center
    .code-2-img-wrapper
      width 25%
      padding-top 20px
      display flex
      justify-content space-around
      .code-info
        width 36%
        text-align center
        .code-2-img
          width 90%
          height auto
          margin-bottom 10px
        .code-2-text
          width 90%
          text-align center
          color $BorderLight
          margin 0 auto
  .footer-contact
    color $BorderLight
    a
      color #a5aaa9
    .contact-top
      padding-top 20px
      line-height 30px
    .contact-bottom
      line-height 35px
  .copy-right-wrapper
    color $BorderLight
    background $Primary
    text-align center
    padding 20px 0
    font-size 14px
    color $BorderLight
</style>
