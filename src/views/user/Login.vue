<template xmlns="">
  <a-card class="main">
    <h3><span>登录</span></h3>
    <a-tabs :default-active-key="useWebauthn ? '2' : '1'">
      <a-tab-pane key="1" tab="密码登录">
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
            <a-checkbox value="1" name="type" v-model="form.remember_me">
              记住我
            </a-checkbox>
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
      </a-tab-pane>
      <a-tab-pane key="2" tab="免密码登录">
        <a-space
          direction="vertical">
          <a-input
            size="large"
            v-model="form.username"
            placeholder="用户名或邮箱"
            style="width: 100%"
          >
            <a-icon slot="prefix" type="user"/>
          </a-input>
          <a-button @click="begin">开始</a-button>
        </a-space>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { beginLogin, finishLogin } from '@/api/webauthn'
import base64url from 'base64-url'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export default {
  data () {
    return {
      loginBtn: false,
      useWebauthn: storage.get('useWebauthn') || false,
      form: {
        username: storage.get('username'),
        password: '',
        remember_me: true
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
    begin () {
      storage.set('useWebauthn', true, 7 * 24 * 60 * 60 * 1000)
      beginLogin({
        username: this.form.username
      }).then(resp => {
        console.log(resp)
        resp.publicKey.challenge = Buffer.from(unescape(base64url.unescape(resp.publicKey.challenge)), 'base64')
        if (resp.publicKey.allowCredentials) {
          resp.publicKey.allowCredentials = resp.publicKey.allowCredentials.map(data => {
            data.id = Buffer.from(unescape(base64url.unescape(data.id)), 'base64')
            return data
          })
        }
        navigator.credentials.get(resp).then(data => {
          console.log(data)
          const p = {
            id: data.id,
            rawId: base64url.encode(data.rawId),
            type: data.type,
            response: {
              clientDataJSON: base64url.encode(data.response.clientDataJSON),
              authenticatorData: base64url.encode(data.response.authenticatorData),
              signature: base64url.encode(data.response.signature)
            }
          }
          finishLogin(this.form.username, p).then(resp => {
            storage.set(ACCESS_TOKEN, resp.token, 7 * 24 * 60 * 60 * 1000)
            this.$store.commit('SET_TOKEN', resp.token)
            this.$store.commit('SET_INFO', resp.user)
            this.loginSuccess()
          }).catch(err => {
            if (err.message === 'INTERNAL_ERROR') {
              this.$error({
                content: '内部错误' + err.response.error
              })
            }
          })
        })
      }).catch(err => {
        console.log(err)
        if (err.message === 'NOT_FOUND') {
          this.$error({
            content: '用户不存在'
          })
        } else if (err.message === 'INVALID_REQUEST') {
          this.$error({
            content: '此用户没有绑定安全秘钥'
          })
        }
      })
    },
    onSubmit () {
      this.loginBtn = true
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.Login({
            username: this.form.username,
            password: this.form.password,
            remember_me: this.form.remember_me
          }).then((res) => this.loginSuccess())
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
    loginSuccess () {
      storage.set('username', this.form.username, 7 * 24 * 60 * 60 * 1000)
      if (this.$route.query.redirect) {
        this.$router.push({ path: this.$route.query.redirect })
      } else {
        this.$router.push({ path: '/' })
      }
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
              this.$refs.username.help = v.translation
              this.$refs.username.validateState = 'error'
              break
            case 'Password':
              this.$refs.password.help = v.translation
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
.ant-space-vertical {
  width: 100%
}
</style>
