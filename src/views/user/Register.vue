<template>
  <div class="registerWrapper" id="registerBackground">
    <div class="formWrapper">
      <h1 class="registerTitle" v-text="registerTitle"></h1>
      <p class="registerSystem" v-text="SYSTEM_NAME"></p>
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
        <el-form-item prop="email">
          <el-input
              prefix-icon="el-icon-message"
              v-model="ruleForm.email"
              placeholder="邮箱"
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
        <el-form-item style="user-select: none;">
          <drag-verify
              ref="dragVerifyRef"
              text="请按住滑块拖动解锁"
              successText="验证通过"
              handlerIcon="el-icon-d-arrow-right"
              successIcon="el-icon-circle-check"
              :width="375"
              handlerBg="#F5F7FA"
              :isPassing.sync="isPassing"
              @update:isPassing="updateIsPassing"
          ></drag-verify>
        </el-form-item>
        <el-form-item prop="token">
          <el-input v-model="ruleForm.token" placeholder="请输入令牌">
            <el-button slot="append" :disabled="submitDisabled" @click="getRegisterToken" class="el-icon-search"
                       title="获取令牌" style="color: red"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item class="registerButtonWrapper">
          <el-button
              class="registerButton"
              type="primary"
              :disabled="submitDisabled"
              @click="submitForm('ruleForm')"
          >注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import CanvasNest from 'canvas-nest.js'
import DragVerify from '@/components/DragVerify.vue'
import {addUser, fetchRegisterToken} from '@/request/user.js'

// 配置
const config = {
  color: '230, 162, 60', // 线条颜色
  pointColor: '230, 162, 60', // 节点颜色
  opacity: 0.5, // 线条透明度
  count: 99, // 线条数量
  zIndex: -1 // 画面层级
}

export default {
  name: 'Register',
  components: {DragVerify},
  data() {
    return {
      registerTitle: '注册',
      ruleForm: {
        email: '',
        username: '',
        password: '',
        token: ''
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
        email: [
          {required: true, message: '请输入邮箱地址', trigger: 'blur'},
          {type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']}
        ],
        token: [
          {required: true, message: '请输入令牌', trigger: 'blur'},
          {
            required: true,
            pattern: /^\S{6}$/,
            message: '非6位令牌',
            trigger: 'blur'
          }
        ]
      },
      isPassing: false,
      submitDisabled: true,
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
  watch: {
    //  已验证通过时，若重新输入邮箱、用户名或密码，滑动解锁恢复原样
    'ruleForm.email'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
    'ruleForm.userName'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
    'ruleForm.password'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    }
  },
  created() {
    this.$nextTick(() => {
      let element = document.getElementById('registerBackground')
      new CanvasNest(element, config)
    })
  },
  methods: {
    //  滑动解锁完成
    updateIsPassing(isPassing) {
      if (isPassing) {
        //  校验邮箱
        this.$refs.ruleForm.validateField('email', emailError => {
          if (emailError) {
            this.submitDisabled = true
          } else {
            this.submitDisabled = false
          }
        })
      } else {
        this.submitDisabled = true
      }
    },
    // 获取令牌
    getRegisterToken() {
      fetchRegisterToken({email: this.ruleForm.email}).then(() => {
        this.$message.success("令牌已发送至您的邮箱，请注意查收！")
      }).catch(err => {
        console.error(err)
        this.$message.error(err.msg)
      })
    },
    //  注册按钮
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          //  各项校验通过
          let info = {
            email: this.ruleForm.email,
            username: this.ruleForm.username,
            password: this.ruleForm.password,
            token: this.ruleForm.token
          }
          addUser(info).then(() => {
            //	这里的返回字段需要和后台重新商议
            this.$notify({
              title: '成功',
              message: '注册成功！已跳转到登录页面',
              type: 'success'
            })
            this.$refs[formName].resetFields();
            this.$router.replace({path: '/login'})
          }).catch(err => {
            console.error(err)
            this.$message.error("用户注册失败")
          })
        } else {
          this.$message.error('请完善信息！')
          return false
        }
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
.registerWrapper
  height: 500px !important
  min-height: 500px !important
  width: 100% !important
  padding-top: 50px

  .formWrapper
    width: 375px
    margin: 0 auto
    text-align: center

    .registerTitle
      margin-bottom: 10px
      font-weight: 300
      font-size: 30px
      color: #000

    .registerSystem
      font-weight: 300
      color: #999

    .demo-ruleForm
      width: 100%
      margin-top: 20px

      >>> .el-form-item__content
        margin-left: 0 !important

      & >>> .el-input__inner
        font-size: 16px

      .registerButtonWrapper
        .registerButton
          width: 100%

        & >>> .el-button
          padding: 10px 90px
          font-size: 16px

    .tip
      width: 70%
      margin-left: 86px
</style>
