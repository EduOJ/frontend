<template>
  <a-card class="main" title="修改邮箱">
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
    >
      <a-form-model-item
        ref="email"
        prop="email"
        label="">
        <a-input
          size="large"
          v-model="form.email"
          placeholder="邮箱"
        >
          <a-icon slot="prefix" type="mail"/>
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button
          type="primary"
          @click="updateEmail"
          :loading="updateEmailBtn"
          :disabled="updateEmailBtn"
          size="large"
        >
          更新邮箱
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </a-card>
</template>

<script>
import store from '@/store'
import { mapActions } from 'vuex'
import { updateEmail } from '@/api/user'
import router from '@/router'

export default {
  name: 'UpdateEmail',
  data () {
    const info = this.$store.state.user.info
    return {
      loading: true,
      updateEmailBtn: false,
      currentEmail: info.email,
      form: { email: info.email },
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入合法的邮箱', trigger: 'blur' },
          { max: 30, message: '邮箱最长为30个字符', trigger: 'blur' },
          { min: 5, message: '邮箱最短为5个字符', trigger: 'blur' }
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
    updateEmail () {
      this.$refs.form.validate(valid => {
        if (valid) {
          updateEmail({
            email: this.form.email
          }).then(resp => {
            store.dispatch('GetInfo').then(data => {
              store.commit('SET_INFO', data)
            })
            this.$success({
              title: '成功',
              content: '修改邮箱成功',
              onOk: function () {
                router.push({ name: 'verify_email' })
              }
            })
          }).catch(err => {
            if (err.message === 'CONFLICT_EMAIL') {
              this.$notification['error']({
                message: '错误',
                description: '邮箱已被注册',
                duration: 4
              })
            } else if (err.message === 'EMAIL_VERIFIED') {
              this.$notification['error']({
                message: '错误',
                description: '邮箱已被验证过',
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
    }
  }
}
</script>

<style scoped>

</style>
