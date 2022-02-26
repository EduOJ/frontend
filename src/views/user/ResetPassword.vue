<template>
  <a-card class="main" title="重置密码">
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
    >
      <a-form-model-item
        ref="email"
        prop="email"
        label="">
        <a-input-search placeholder="邮箱或用户名" size="large" v-model="form.email" @search="requestResetPassword">
          <a-icon slot="prefix" type="mail"/>
          <a-button
            slot="enterButton"
            type="primary"
            :loading="requestResetPasswordBtn"
            :disabled="requestResetPasswordBtn"
          >
            {{ requestResetPasswordWord }}
          </a-button>
        </a-input-search>
      </a-form-model-item>
      <a-form-model-item
        ref="token"
        prop="token"
        label="">
        <a-input
          size="large"
          v-model="form.token"
          placeholder="验证码"
        >
          <a-icon slot="prefix" type="lock"/>
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
          @click="doResetPassword"
          :loading="doResetPasswordBtn"
          :disabled="doResetPasswordBtn"
          size="large"
          block
        >
          重置密码
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </a-card>
</template>

<script>
import { doResetPassword, requestResetPassword } from '@/api/user'
import router from '@/router'

export default {
  name: 'ResetPassword',
  data () {
    const that = this
    return {
      loading: true,
      doResetPasswordBtn: false,
      requestResetPasswordBtn: false,
      requestResetPasswordWord: '发送验证码',
      waitTime: 61,
      form: { token: '' },
      rules: {
        token: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { max: 5, message: '验证码为5个字符', trigger: 'blur' },
          { min: 5, message: '验证码为5个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱或用户名', trigger: 'blur' },
          { min: 5, message: '最短为5个字符', trigger: 'blur' }
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
  mounted () {
  },
  methods: {
    requestResetPassword () {
      this.$refs.form.validateField(['email'], invalid => {
        if (!invalid) {
          this.requestResetPasswordBtn = true
          const that = this
          that.waitTime--
          that.requestResetPasswordBtn = true
          this.requestResetPasswordWord = `${this.waitTime}s 后重新获取`
          const timer = setInterval(function () {
            if (that.waitTime > 1) {
              that.waitTime--
              that.requestResetPasswordWord = `${that.waitTime}s 后重新获取`
            } else {
              clearInterval(timer)
              that.requestResetPasswordWord = '重新发送验证码'
              that.requestResetPasswordBtn = false
              that.waitTime = 61
            }
          }, 1000)
          requestResetPassword({
            username: this.form.email
          }).then(resp => {
            this.$success({
              title: '成功',
              content: '已发送验证码'
            })
          }).catch(err => {
            that.requestResetPasswordBtn = false
            that.waitTime = 61
            that.requestResetPasswordWord = '发送验证码'
            clearInterval(timer)
            if (err.message === 'NOT_FOUND') {
              this.$notification['error']({
                message: '错误',
                description: '用户名或邮箱不存在',
                duration: 4
              })
            } else if (err.message === 'EMAIL_NOT_VERIFIED') {
              this.$notification['error']({
                message: '错误',
                description: '邮箱未验证',
                duration: 4
              })
            } else {
              this.$notification['error']({
                message: '错误',
                description: err.message || '请求出现错误，请稍后再试',
                duration: 4
              })
            }
          })
        }
      })
    },
    doResetPassword () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.doResetPasswordBtn = true
          doResetPassword({
            username: this.form.email,
            token: this.form.token,
            password: this.form.password
          }).then(resp => {
            this.$success({
              title: '成功',
              content: '密码重置成功',
              onOk: function () {
                router.push({ name: 'login' })
              }
            })
          }).catch(err => {
            if (err.message === 'NOT_FOUND') {
              this.$notification['error']({
                message: '错误',
                description: '用户名或邮箱不存在',
                duration: 4
              })
            } else if (err.message === 'WRONG_CODE') {
              this.$notification['error']({
                message: '错误',
                description: '验证码错误',
                duration: 4
              })
            } else if (err.message === 'CODE_EXPIRED') {
              this.$notification['error']({
                message: '错误',
                description: '验证码过期',
                duration: 4
              })
            } else if (err.message === 'CODE_USED') {
              this.$notification['error']({
                message: '错误',
                description: '验证码已使用',
                duration: 4
              })
            } else {
              this.$notification['error']({
                message: '错误',
                description: err.message || '请求出现错误，请稍后再试',
                duration: 4
              })
            }
          })
          this.doResetPasswordBtn = false
        }
      })
    }
  }
}
</script>

<style scoped>
.link-btn {
  padding: 0;
}

</style>
