<template xmlns="">
  <a-card class="main">
    <a-form
      id="formLogin"
      class="user-layout-login"
      ref="formLogin"
      :form="form"
      @submit="handleSubmit"
    >
      <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px;" :message="loginErrorMessage" />
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="用户名或邮箱"
          v-decorator="[
            'username',
            {rules: [{ required: true, message: '请输入帐户名或邮箱地址' }, { validator: handleUsernameOrEmail }], validateTrigger: 'change'}
          ]"
        >
          <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          type="password"
          autocomplete="false"
          placeholder="密码"
          v-decorator="[
            'password',
            {rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur'}
          ]"
        >
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }"/>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-checkbox v-decorator="['remember_me', { valuePropName: 'checked' }]">记住我</a-checkbox>
        <router-link
          :to="{ name: 'recover' }"
          class="text-link"
          style="float: right;"
        >忘记密码</router-link>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="loadingState.loginBtn"
          :disabled="loadingState.loginBtn"
        >确定</a-button>
      </a-form-item>
      <span style="float: right;">
        没有用户? 点击前往
        <router-link
          :to="{ name: 'register' }"
          class="text-link"

        >注册</router-link>
      </span>
    </a-form>
  </a-card>
</template>

<script>
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'

export default {
  components: {
    TwoStepCaptcha
  },
  data () {
    return {
      loginErrorMessage: '',
      loginBtn: true,
      // auth type: 0 email, 1 username, 2 telephone
      loginType: 0,
      isLoginError: false,
      requiredTwoStepCaptcha: true,
      form: this.$form.createForm(this),
      loadingState: {
        time: 60,
        loginBtn: false,
        loginType: 0,
        smsSendBtn: false
      }
    }
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    // handler
    handleUsernameOrEmail (rule, value, callback) {
      const { loadingState } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        loadingState.loginType = 0
      } else {
        loadingState.loginType = 1
      }
      callback()
    },
    handleTabClick (key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit (e) {
      e.preventDefault()
      const {
        form: { validateFields },
        loadingState,
        Login
      } = this

      loadingState.loginBtn = true

      const validateFieldsKey = ['username', 'password', 'remember_me']

      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          console.log('auth form', values)
          const loginParams = { ...values }
          Login(loginParams)
            .then((res) => this.loginSuccess(res))
            .catch(err => this.requestFailed(err))
            .finally(() => {
              loadingState.loginBtn = false
            })
        } else {
          setTimeout(() => {
            loadingState.loginBtn = false
          }, 600)
        }
      })
    },
    loginSuccess (res) {
      this.isLoginError = false
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
          if (v.field === 'UsernameOrEmail') {
            this.loginErrorMessage += ' 用户名'
          }
          if (v.field === 'Password') {
            this.loginErrorMessage += ' 密码'
          }
        })
        this.isLoginError = true
      } else if (err.message === 'INTERNAL_ERROR') {
        this.$notification['error']({
          message: '错误',
          description: '服务器内部错误，请稍后再试',
          duration: 4
        })
      } else if (err.message === 'WRONG_USERNAME' || err.message === 'WRONG_PASSWORD') {
        this.loginErrorMessage = '错误的用户名或密码'
        this.isLoginError = true
      } else {
        this.$notification['error']({
          message: '错误',
          description: err.message || '请求出现错误，请稍后再试',
          duration: 4
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
