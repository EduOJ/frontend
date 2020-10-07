<template>
  <div class="account-settings-info-view">
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="{span: 3}"
      :wrapper-col="{span: 6}"
    >
      <a-form-model-item ref="old_password" prop="old_password" label="原密码">
        <a-input
          size="large"
          v-model="form.old_password"
          type="password"
        >
          <a-icon slot="prefix" type="lock"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item ref="password" prop="password" label="新密码">
        <a-input
          size="large"
          v-model="form.password"
          type="password"
        >
          <a-icon slot="prefix" type="lock"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item ref="password_verify" prop="password_verify" label="重复密码">
        <a-input
          size="large"
          v-model="form.password_verify"
          type="password"
        >
          <a-icon slot="prefix" type="lock"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item label="">
        <a-button
          type="primary"
          @click="onSubmit"
          class="register-button"
          :loading="submitBtn"
          :disabled="submitBtn"
          size="large">
          提交
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { changePassword } from '@/api/user'
import store from '@/store'

export default {
  components: {
  },
  data () {
    const that = this
    return {
      submitBtn: false,
      form: {
        old_password: '',
        password: '',
        password_verify: ''
      },
      rules: {
        old_password: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { max: 30, message: '密码最长为30个字符', trigger: 'blur' },
          { min: 5, message: '密码最短为5个字符', trigger: 'blur' }
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
    ...mapActions(['GetInfo']),
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          changePassword({
            old_password: this.form.old_password,
            new_password: this.form.password
          }).then(resp => {
            this.$success({
              title: '成功',
              content: '修改成功'
            })
            this.submitBtn = false
            store.dispatch('GetInfo').then(data => {
              store.commit('SET_INFO', data)
            })
          }).catch(err => {
            this.submitBtn = false
            if (err.message === 'VALIDATION_ERROR') {
              err.response.error.forEach(v => {
                switch (v.field) {
                  case 'OldPassword':
                    this.$refs.old_password.validateMessage = v.translation
                    this.$refs.old_password.validateState = 'error'
                    break
                  case 'NewPassword':
                    this.$refs.password.validateMessage = v.translation
                    this.$refs.password.validateState = 'error'
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
              this.$refs.email.validateMessage = '邮箱已经注册'
              this.$refs.email.validateState = 'error'
            } else if (err.message === 'CONFLICT_USERNAME') {
              this.$refs.username.validateMessage = '用户名已被占用'
              this.$refs.username.validateState = 'error'
            } else if (err.message === 'WRONG_PASSWORD') {
              this.$refs.old_password.validateMessage = '密码错误'
              this.$refs.old_password.validateState = 'error'
            } else {
              this.$notification['error']({
                message: '错误',
                description: err.message || '请求出现错误，请稍后再试',
                duration: 4
              })
            }
          })
        } else {
          this.submitBtn = false
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>

.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0,0,0,0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img, .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
