<template>
  <a-card class="main user-layout-register">
    <h3><span>注册</span></h3>
    <a-form-model
      ref="registerForm"
      :model="form"
      :rules="rules"
    >
      <a-form-model-item ref="username" prop="username">
        <a-input
          size="large"
          v-model="form.username"
          placeholder="用户名"
        >
          <a-icon slot="prefix" type="user"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item ref="email" prop="email">
        <a-input
          size="large"
          v-model="form.email"
          placeholder="邮箱"
        >
          <a-icon slot="prefix" type="mail"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item ref="nickname" prop="nickname">
        <a-input
          size="large"
          v-model="form.nickname"
          placeholder="昵称"
        >
          <a-icon slot="prefix" type="idcard"/>
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
      <a-form-model-item ref="password_verify" prop="password_verify">
        <a-input
          size="large"
          v-model="form.password_verify"
          type="password"
          placeholder="重复密码"
        >
          <a-icon slot="prefix" type="lock"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button
          type="primary"
          @click="onSubmit"
          class="register-button"
          :loading="registerBtn"
          :disabled="registerBtn"
          size="large">
          提交
        </a-button>
      </a-form-model-item>
      <span style="float: right;">
        已经是用户了? 点击前往
        <router-link
          :to="{ name: 'login' }"
          class="text-link"

        >登录</router-link>
      </span>
    </a-form-model>
  </a-card>
</template>

<script>
  import { getUser } from '@/api/user'
  import { register, emailRegistered } from '@/api/auth'
  import storage from 'store'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

export default {
  name: 'Register',
  components: {
  },
  mixins: [],
  data () {
    const that = this
    return {
      registerBtn: false,
      form: {
        username: '',
        nickname: '',
        email: '',
        password: '',
        password_verify: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: `^[a-zA-Z0-9_]+$`, message: '用户名不能包括特殊字符', trigger: 'blur' },
          { max: 30, message: '用户名最长为30个字符', trigger: 'blur' },
          { min: 5, message: '用户名最短为5个字符', trigger: 'blur' },
          {
            message: '用户名已被占用',
            asyncValidator (rule, value, callback) {
              getUser(value).then(function (data) {
                callback(new Error('用户名已被占用'))
              }, function (error) {
                if (error.message === 'NOT_FOUND') {
                  callback()
                } else {
                  that.$error({
                    title: '发生未知错误',
                    content: error.message
                  })
                }
              })
            },
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入合法的邮箱', trigger: 'blur' },
          { max: 320, message: '邮箱最长为320个字符', trigger: 'blur' },
          { min: 5, message: '邮箱最短为5个字符', trigger: 'blur' },
          {
            message: '邮箱已经注册',
            asyncValidator (rule, value, callback) {
              emailRegistered(value).then(function (data) {
                callback()
              }, function (error) {
                if (error.message === 'EMAIL_REGISTERED') {
                  callback(new Error('邮箱已经注册'))
                } else {
                  that.$error({
                    title: '发生未知错误',
                    content: error.message
                  })
                }
              })
            },
            trigger: 'blur'
          }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { max: 30, message: '昵称最长为30个字符', trigger: 'blur' },
          { min: 1, message: '昵称最短为1个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { max: 30, message: '密码最长为30个字符', trigger: 'blur' },
          { min: 5, message: '密码最短为5个字符', trigger: 'blur' },
          {
            validator (rule, value, callback) {
              if (!/\d/.test(value)) {
                callback(new Error('密码必须包含数字'))
              }
              if (!/[a-zA-Z]/.test(value)) {
                callback(new Error('密码必须包含字母'))
              }
              if (!/[^a-zA-Z0-9]/.test(value)) {
                callback(new Error('密码必须包含特殊字符'))
              }
              callback()
            }
          }
        ],
        password_verify: [
          { required: true, message: '请重复密码', trigger: 'blur' },
          {
            validator (rule, value) {
              return value === that.form.password
            },
            trigger: 'blur',
            message: '密码不一致'
          }
        ]
      }
    }
  },
  methods: {
    onSubmit () {
      this.registerBtn = true
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          register({
            username: this.form.username,
            nickname: this.form.nickname,
            email: this.form.email,
            password: this.form.password
          }).then(resp => {
            this.registerBtn = false
            storage.set(ACCESS_TOKEN, resp.token, 7 * 24 * 60 * 60 * 1000)
            this.$store.commit('SET_TOKEN', resp.token)
            this.$store.commit('SET_INFO', resp.user)
            this.$router.push({ path: '/' })
            this.$notification.success({
              message: '欢迎',
              description: `注册成功`
            })
          }).catch(err => {
            this.registerBtn = false
            if (err.message === 'VALIDATION_ERROR') {
              err.response.error.forEach(v => {
                switch (v.field) {
                  case 'Username':
                    this.$refs.username.help = v.translation
                    this.$refs.username.validateState = 'error'
                    break
                  case 'Password':
                    this.$refs.password.help = v.translation
                    this.$refs.password.validateState = 'error'
                    break
                  case 'Email':
                    this.$refs.email.help = v.translation
                    this.$refs.email.validateState = 'error'
                    break
                  case 'Nickname':
                    this.$refs.nickname.help = v.translation
                    this.$refs.nickname.validateState = 'error'
                    break
                }
              })
            } else if (err.message === 'INTERNAL_ERROR') {
              this.$notification['error']({
                message: '错误',
                description: '服务器内部错误，请稍后再试',
                duration: 4
              })
            } else if (err.message === 'CONFLICT_EMAIL') {
              this.$refs.email.help = '邮箱已经注册'
              this.$refs.email.validateState = 'error'
            } else if (err.message === 'CONFLICT_USERNAME') {
              this.$refs.username.help = '用户名已被占用'
              this.$refs.username.validateState = 'error'
            } else {
              this.$notification['error']({
                message: '错误',
                description: err.message || '请求出现错误，请稍后再试',
                duration: 4
              })
            }
          })
        } else {
          this.registerBtn = false
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .user-layout-register {
    .anticon {
      color: rgba(0,0,0,.25)
    }
    button.register-button {
      padding: 0 15px;
      font-size: 16px;
      height: 40px;
      width: 100%;
    }
    .text-link {
      font-size: 14px;
    }
  }
</style>
