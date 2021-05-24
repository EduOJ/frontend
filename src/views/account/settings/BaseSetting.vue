<template>
  <div class="account-settings-info-view">
    <a-spin :spinning="loading">
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :label-col="{span: 3}"
        :wrapper-col="{span: 6}"
      >
        <a-form-model-item ref="username" prop="username" label="用户名">
          <a-input
            size="large"
            v-model="form.username"
            placeholder="用户名"
            disabled
          >
            <a-icon slot="prefix" type="user"/>
          </a-input>
        </a-form-model-item>
        <a-form-model-item ref="email" prop="email" label="邮箱">
          <a-input
            size="large"
            v-model="form.email"
            placeholder="邮箱"
          >
            <a-icon slot="prefix" type="mail"/>
          </a-input>
        </a-form-model-item>
        <a-form-model-item ref="nickname" prop="nickname" label="昵称">
          <a-input
            size="large"
            v-model="form.nickname"
            placeholder="昵称"
            disabled
          >
            <a-icon slot="prefix" type="idcard"/>
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
    </a-spin>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { updateMe } from '@/api/user'
import store from '@/store'

export default {
  components: {
  },
  data () {
    const info = this.$store.state.user.info
    return {
      loading: true,
      submitBtn: false,
      form: info,
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: `^[a-zA-Z0-9_]+$`, message: '用户名不能包括特殊字符', trigger: 'blur' },
          { max: 30, message: '用户名最长为30个字符', trigger: 'blur' },
          { min: 5, message: '用户名最短为5个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入合法的邮箱', trigger: 'blur' },
          { max: 30, message: '邮箱最长为30个字符', trigger: 'blur' },
          { min: 5, message: '邮箱最短为5个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { max: 30, message: '昵称最长为30个字符', trigger: 'blur' },
          { min: 1, message: '昵称最短为1个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.GetInfo().then(data => {
      store.commit('SET_INFO', data)
      this.form = data
      this.loading = false
    })
  },
  methods: {
    ...mapActions(['GetInfo']),
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          updateMe({
            username: this.form.username,
            nickname: this.form.nickname,
            email: this.form.email
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
                  case 'Username':
                    this.$refs.username.help = v.translation
                    this.$refs.username.validateState = 'error'
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
