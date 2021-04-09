<template>
  <div class="loginWrapper" id="loginBackground">
    <div class="formWrapper">
      <h1 class="loginTitle" v-text="loginTitle"></h1>
      <p class="loginSystem" v-text="SYSTEM_NAME"></p>
      <el-form
          :model="ruleForm"
          :rules="rules"
          ref="ruleForm"
          label-width="100px"
          class="demo-ruleForm"
          hide-required-asterisk
      >
        <el-form-item prop="username">
          <el-input
              prefix-icon="el-icon-user"
              v-model="ruleForm.username"
              placeholder="用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              prefix-icon="el-icon-lock"
              v-model="ruleForm.password"
              placeholder="密码"
              show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <drag-verify
              ref="dragVerifyRef"
              text="请按住滑块拖动记住登录状态"
              successText="已记住登录状态"
              handlerIcon="el-icon-d-arrow-right"
              successIcon="el-icon-circle-check"
              :width="375"
              handlerBg="#F5F7FA"
              :isPassing.sync="isPassing"
              @update:isPassing="rememberMe"
          ></drag-verify>
        </el-form-item>
        <el-form-item class="loginButtonWrapper">
          <el-button class="loginButton" type="primary" @click="submitForm('ruleForm')">登录
          </el-button>
        </el-form-item>
        <el-form-item style="text-align:left;">
          其他账号登录：
          <a href="#">
            <img :src="qqIcon" style="width: 30px;"/>
          </a>
          <el-button type="text" @click="forgetPassword" style="float: right">忘记密码?</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import CanvasNest from 'canvas-nest.js'
import DragVerify from '@/components/DragVerify.vue'
import {login, forgetPasswd1, forgetPasswd2} from '@/request/user.js'

// 配置
const config = {
  color: '64, 158, 255', // 线条颜色
  pointColor: '64, 158, 255', // 节点颜色
  opacity: 0.5, // 线条透明度
  count: 99, // 线条数量
  zIndex: -1 // 画面层级
}

export default {
  name: 'Login',
  components: {DragVerify},
  data() {
    return {
      loginTitle: '登录',
      ruleForm: {
        username: '',
        password: '',
        rememberMe: ''
      },
      rules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {
            min: 4,
            max: 16,
            message: '长度在4到16个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {
            min: 7,
            max: 20,
            message: '长度在7到20个字符',
            trigger: 'blur'
          }
        ],
      },
      isPassing: false,
      submitDisabled: true,
      qqIcon: require('@/assets/images/login/qqIcon.png')
    }
  },
  computed: {
    url() {
      let _url = this.$route.query.Rurl //获取路由前置守卫中next函数的参数，即登录后要去的页面
      if (_url) {
        //若登录之前有页面，则登录后仍然进入该页面
        return _url
      } else {
        //若登录之前无页面，则登录后进入首页
        return '/'
      }
    }
  },
  watch: {},
  methods: {
    //  记住我
    rememberMe(isPassing) {
      if (isPassing) {
        this.ruleForm.rememberMe = 'On'
      } else {
        this.ruleForm.rememberMe = ''
      }
    },
    // 忘记密码
    forgetPassword() {
      this.$prompt('请输入用户邮箱', '忘记密码，步骤一', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        inputErrorMessage: '邮箱格式不正确'
      }).then((email) => {
        forgetPasswd1({email: email.value}).then(() => {
          this.$message.success('忘记密码所需令牌已发送至您的邮箱，请查收！');
          this.$prompt("输入令牌", '忘记密码，步骤二', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            inputPattern: /^\S{36}$/,
            inputErrorMessage: '令牌格式不正确'
          }).then((token) => {
            this.$prompt("更改密码", '忘记密码，步骤三', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              inputPattern: /^\S{7,20}$/,
              inputErrorMessage: '密码格式不正确'
            }).then((password) => {
              forgetPasswd2({token: token.value, password: password.value, email: email.value}).then(() => this.$message.success("密码重置成功！"))
                  .catch((err) => {throw new Error(err)})
            })
          }).catch(err => {
            console.error(err)
            this.$message.error("密码重置失败")
          })
        }).catch(err => {
          console.error(err)
          this.$message.error("无法获取令牌")
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '放弃忘记密码'
        });
      });
    },
    //  登录按钮
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //各项校验通过
          let data = {
            username: this.ruleForm.username,
            password: this.ruleForm.password,
            rememberMe: this.ruleForm.rememberMe
          }
          login(data, true).then(() => {
            this.$refs[formName].resetFields();
            this.$notify({
              title: '成功',
              message: '登录成功！',
              type: 'success'
            })
            this.$store.dispatch('getUserInfo').then(() => {
              this.$router.replace({path: this.url})
              location.reload()
            })
          }).catch(err => {
            this.$message.error(err.msg)
            this.isPassing = false
            this.$refs.dragVerifyRef.reset()
          })
        } else {
          this.$message.error('请完善信息！')
          return false
        }
      })
    }
  },
  created() {
    if (this.$store.getters.isLogin) {
      // 用户若已登录，自动跳转到首页
      let username = this.$store.getters.user.username
      this.$message({
        message: username + ' 您已登录！已跳转到首页',
        center: true,
        type: 'success'
      })
      this.$router.replace({name: 'Home'})
    }
    this.$nextTick(() => {
      let element = document.getElementById('loginBackground')
      new CanvasNest(element, config)
    })
  }
}
</script>
<style lang="stylus" scoped>
.loginWrapper
  height 550px !important
  min-height 550px !important
  padding-top 50px

  .formWrapper
    width 375px
    margin 0 auto
    text-align center

    .loginTitle
      margin-bottom 10px
      font-weight 300
      font-size 30px
      color #000

    .loginSystem
      font-weight 300
      color #999

    .demo-ruleForm
      width 100%
      margin-top 20px

      >>> .el-form-item__content
        margin-left 0 !important

      & >>> .el-input__inner
        font-size 16px

      .loginButtonWrapper
        .loginButton
          width 100%

        & >>> .el-button
          padding 10px 90px
          font-size 16px

    .tip
      width 70%
      margin-left 86px
</style>
