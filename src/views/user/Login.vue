<template xmlns="">
  <a-card class="main">
    <h3><span>登录</span></h3>
    <a-form-model
      ref="loginForm"
      :model="form"
      :rules="rules"
    >
      <a-form-model-item ref="username" prop="username">
        <a-input
          size="large"
          v-model="form.username"
          placeholder="用户名或邮箱"
        >
          <a-icon slot="prefix" type="user"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item ref="password" prop="password">
        <a-input
          size="large"
          v-model="form.password"
          type="password"
          placeholder="密码"
        >
          <a-icon slot="prefix" type="lock"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button
          type="primary"
          @click="onSubmit"
          class="login-button"
          :loading="loginBtn"
          :disabled="loginBtn"
          size="large">
          登录
        </a-button>
      </a-form-model-item>
      <span style="float: right;">
        还没有用户? 点击前往
        <router-link
          :to="{ name: 'register' }"
          class="text-link"
        >注册</router-link>
      </span>
    </a-form-model>
  </a-card>
</template>

<script>
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'

export default {
  data () {
    return {
      loginBtn: false,
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
          { max: 30, message: '用户名/邮箱最长为30个字符', trigger: 'blur' },
          { min: 5, message: '用户名/邮箱最短为5个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { max: 30, message: '密码最长为30个字符', trigger: 'blur' },
          { min: 5, message: '密码最短为5个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions(['Login']),
    onSubmit () {
      this.loginBtn = true
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.Login({
            username: this.form.username,
            password: this.form.password
          }).then((res) => this.loginSuccess(res))
            .catch(err => this.requestFailed(err))
            .finally(() => {
              this.loginBtn = false
            })
        } else {
          this.loginBtn = false
          return false
        }
      })
    },
    loginSuccess (resp) {
      this.$router.push({ path: '/' })
      this.$notification.success({
        message: '欢迎',
        description: `${timeFix()}，欢迎回来`
      })
    },
    requestFailed (err) {
      if (err.message === 'VALIDATION_ERROR') {
        this.loginErrorMessage = '您输入的以下信息有误：'
        err.validation.forEach(v => {
          switch (v.field) {
            case 'UsernameOrEmail':
              this.$refs.username.validateMessage = v.translation
              this.$refs.username.validateState = 'error'
              break
            case 'Password':
              this.$refs.password.validateMessage = v.translation
              this.$refs.password.validateState = 'error'
              break
          }
        })
      } else if (err.message === 'INTERNAL_ERROR') {
        this.$error({
          title: '错误',
          content: '服务器内部错误，请稍后再试'
        })
      } else if (err.message === 'WRONG_USERNAME' || err.message === 'WRONG_PASSWORD') {
        this.$error({
          title: '用户名或密码错误',
          content: '用户名或密码错误!'
        })
      } else {
        this.$error({
          title: '错误',
          content: err.message || '请求出现错误，请稍后再试'
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .text-link {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
}
</style>
