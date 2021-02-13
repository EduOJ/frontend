<template>
  <a-row>
    <a-col span="12" offset="6">
      <a-card title="编辑用户">
        <a-spin :spinning="loading">
          <a-form-model
            ref="form"
            :model="form"
            :rules="rules"
            :label-col="{span: 6}"
            :wrapper-col="{span: 18}"
          >
            <a-form-model-item ref="username" prop="username" label="用户名">
              <a-input
                size="large"
                v-model="form.username"
                placeholder="用户名"
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
              >
                <a-icon slot="prefix" type="idcard"/>
              </a-input>
            </a-form-model-item>
            <a-form-model-item ref="password" prop="password" label="密码">
              <a-input
                size="large"
                v-model="form.password"
                type="password"
                placeholder="密码, 留空既不修改."
              >
                <a-icon slot="prefix" type="key"/>
              </a-input>
            </a-form-model-item>
            <a-form-model-item :wrapper-col="{ span: 18, offset: 6 }">
              <a-space>
                <a-button
                  type="primary"
                  @click="onSubmit"
                  class="register-button"
                  :loading="submitBtn"
                  :disabled="submitBtn"
                  size="large">
                  提交
                </a-button>
                <a-button
                  type="secondary"
                  @click="$router.go(-1)"
                  size="large">
                  返回
                </a-button>
              </a-space>
            </a-form-model-item>
          </a-form-model>
        </a-spin>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { getUser, updateUser } from '@/api/admin_manage_user'

export default {
  components: {
  },
  data () {
    return {
      loading: true,
      submitBtn: false,
      form: {},
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
        ],
        password: [
          { min: 5, message: '密码最短为5个字符', trigger: 'blur' },
          { max: 30, message: '密码最长为30个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    console.log(getUser(this.$route.params.id).then(data => {
      this.form = data.user
      this.loading = false
    }).catch(err => {
      console.log(err)
      this.$error({
        'title': '获取用户失败',
        'content': {
          'NOT_FOUND': '用户不存在'
        }[err]
      })
    }))
  },
  methods: {
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          updateUser(this.$route.params.id, {
            username: this.form.username,
            nickname: this.form.nickname,
            email: this.form.email,
            password: this.form.password
          }).then(resp => {
            this.$confirm({
              title: '成功',
              content: '编辑成功',
              cancelText: '返回',
              okText: '继续编辑',
              icon: () => <a-icon type="check-circle" style="color: #52c41a !important;"/>,
              onCancel: () => {
                this.$router.go(-1)
              }
            })
            this.submitBtn = false
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
                  case 'Password':
                    this.$refs.password.help = v.translation
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

</style>
