<template>
  <a-card class="main" title="验证邮箱">
    <span>已向 {{ currentEmail }} 发送验证码邮件，请查收。</span>
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
    >
      <a-form-model-item
        ref="token"
        prop="token"
        label="">
        <a-input
          size="large"
          v-model="form.token"
          placeholder="验证码"
          style="margin-top: 20px;"
        >
          <a-icon slot="prefix" type="lock"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button
          type="primary"
          @click="verifyEmail"
          :loading="verifyEmailBtnLoading"
          size="large"
        >
          验证邮箱
        </a-button>
      </a-form-model-item>
      <span style="float: right;">
        没收到验证邮件？
        <a-button
          type="link"
          @click="resendEmail"
          :loading="resendEmailBtn"
          class="link-btn">
          {{ resendEmailBtnWord }}
        </a-button>
        或
        <router-link
          :to="{ name: 'update_email'}"
          class="text-link"
        >更改邮箱</router-link>
      </span>
    </a-form-model>
  </a-card>
</template>

<script>
import { mapActions } from 'vuex'
import { verifyEmail, resendEmail } from '@/api/user'
import router from '@/router'

export default {
  name: 'EmailVerify',
  data () {
    const info = this.$store.state.user.info
    return {
      loading: true,
      verifyEmailBtnLoading: false,
      resendEmailBtn: false,
      resendEmailBtnWord: '重新发送验证码',
      waitTime: 61,
      currentEmail: info.email,
      form: { token: '' },
      rules: {
        token: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { max: 5, message: '验证码为5个字符', trigger: 'blur' },
          { min: 5, message: '验证码为5个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions(['GetInfo']),
    resendEmail () {
      this.waitTime--
      this.resendEmailBtn = true
      this.resendEmailBtnWord = `${this.waitTime}s 后重新获取`
      const timer = setInterval(() => {
        if (this.waitTime > 1) {
          this.waitTime--
          this.resendEmailBtnWord = `${this.waitTime}s 后重新获取`
        } else {
          clearInterval(timer)
          this.resendEmailBtnWord = '重新发送验证码'
          this.resendEmailBtn = false
          this.waitTime = 61
        }
      }, 1000)
      resendEmail({}).then(resp => {
        this.$success({
          title: '成功',
          content: '重新发送验证码成功'
        })
      }).catch(err => {
        if (err.message === 'EMAIL_VERIFIED') {
          this.$notification['error']({
            message: '错误',
            description: '邮箱已经验证',
            duration: 4
          })
        }
      })
    },
    verifyEmail () {
      this.verifyEmailBtnLoading = true
      this.$refs.form.validate(valid => {
        if (valid) {
          verifyEmail({
            token: this.form.token
          }).then(resp => {
            this.verifyEmailBtnLoading = false
            this.$success({
              title: '成功',
              content: '邮箱已验证',
              onOk: () => {
                router.push({ name: 'settings' })
              }
            })
          }).catch(err => {
            this.verifyEmailBtnLoading = false
            if (err.message === 'WRONG_CODE') {
              this.$notification['error']({
                message: '错误',
                description: '验证码错误',
                duration: 4
              })
            } else if (err.message === 'EMAIL_VERIFIED') {
              this.$notification['error']({
                message: '错误',
                description: '邮箱已被验证过',
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
        } else {
          this.verifyEmailBtnLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.text-link {
  font-size: 14px;
}

.link-btn {
  padding: 0;
}
</style>
