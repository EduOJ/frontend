<template xmlns="">
  <div class="main">
    <a-form
      id="formLogin"
      class="user-layout-login"
      ref="formLogin"
      :form="form"
      @submit="handleSubmit"
    >
      <!--      <a-tabs-->
      <!--        :activeKey="customActiveKey"-->
      <!--        :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"-->
      <!--        @change="handleTabClick"-->
      <!--      >-->
      <!--        <a-tab-pane key="tab1" tab="账号密码登录">-->
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
      <!--        </a-tab-pane>-->
      <!--        <a-tab-pane key="tab2" tab="手机号登录">-->
      <!--          <a-form-item>-->
      <!--            <a-input size="large" type="text" placeholder="手机号" v-decorator="['mobile', {rules: [{ required: true, pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号' }], validateTrigger: 'change'}]">-->
      <!--              <a-icon slot="prefix" type="mobile" :style="{ color: 'rgba(0,0,0,.25)' }"/>-->
      <!--            </a-input>-->
      <!--          </a-form-item>-->

      <!--          <a-row :gutter="16">-->
      <!--            <a-col class="gutter-row" :span="16">-->
      <!--              <a-form-item>-->
      <!--                <a-input size="large" type="text" placeholder="验证码" v-decorator="['captcha', {rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur'}]">-->
      <!--                  <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }"/>-->
      <!--                </a-input>-->
      <!--              </a-form-item>-->
      <!--            </a-col>-->
      <!--            <a-col class="gutter-row" :span="8">-->
      <!--              <a-button-->
      <!--                class="getCaptcha"-->
      <!--                tabindex="-1"-->
      <!--                :disabled="loadingState.smsSendBtn"-->
      <!--                @click.stop.prevent="getCaptcha"-->
      <!--                v-text="!loadingState.smsSendBtn && '获取验证码' || (loadingState.time+' s')"-->
      <!--              ></a-button>-->
      <!--            </a-col>-->
      <!--          </a-row>-->
      <!--        </a-tab-pane>-->
      <!--      </a-tabs>-->
      <a-form-item>
        <a-checkbox v-decorator="['remember_me', { valuePropName: 'checked' }]">自动登录</a-checkbox>
        <router-link
          :to="{ name: 'recover', params: { user: 'aaa'} }"
          class="forge-password"
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
    <!--      <div class="user-login-other">-->
    <!--        <span>其他登录方式</span>-->
    <!--        <a>-->
    <!--          <a-icon class="item-icon" type="alipay-circle"></a-icon>-->
    <!--        </a>-->
    <!--        <a>-->
    <!--          <a-icon class="item-icon" type="taobao-circle"></a-icon>-->
    <!--        </a>-->
    <!--        <a>-->
    <!--          <a-icon class="item-icon" type="weibo-circle"></a-icon>-->
    <!--        </a>-->
    <!--        <router-link class="register" :to="{ name: 'register' }">注册账户</router-link>-->
    <!--      </div>-->
    </a-form>
  </div>
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
      // login type: 0 email, 1 username, 2 telephone
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
          console.log('login form', values)
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
      console.log(res)
      this.isLoginError = false
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`
        })
      }, 1000)
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
        this.$notification['error']({
          message: '错误',
          description: err.message || '请求出现错误，请稍后再试',
          duration: 4
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

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
