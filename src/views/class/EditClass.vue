<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-skeleton :loading="loading">
        <a-card title="编辑班级" v-if="!loading">
          <a-form-model
            ref="form"
            :model="form"
            :rules="rules"
          >
            <a-form-model-item ref="name" prop="name" label="班级名称">
              <a-input
                size="large"
                v-model="form.name"
                placeholder="如：周三3-4节班"
              >
                <a-icon slot="prefix" type="edit"/>
              </a-input>
            </a-form-model-item>
            <a-form-model-item ref="course_name" prop="course_name" label="课程名称">
              <a-input
                size="large"
                v-model="form.course_name"
                placeholder="如：数据结构与算法"
              >
                <a-icon slot="prefix" type="edit"/>
              </a-input>
            </a-form-model-item>
            <a-form-model-item ref="description" prop="description" label="班级描述">
              <mark-down-editor v-model="form.description"/>
            </a-form-model-item>

            <a-space>
              <a-button
                type="primary"
                @click="onSubmit"
                class="register-button"
                :loading="submitBtn"
                :disabled="submitBtn"
                size="large">
                保存
              </a-button>
              <a-button
                type="secondary"
                @click="$router.go(-1)"
                size="large">
                返回
              </a-button>
            </a-space>
          </a-form-model>
        </a-card>
      </a-skeleton>
    </a-col>
  </a-row>
</template>

<script>
import { updateClass } from '@/api/class'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'
import languageConf from '@/config/languageConf'
import { mapGetters } from 'vuex'
export default {
  components: {
    MarkDownEditor
  },
  inject: ['refreshClass'],
  data () {
    console.log(JSON.stringify(this.storeClass))
    return {
      languageConf,
      submitBtn: false,
      form: this.storeClass,
      loading: true,
      rules: {
        name: [
          { required: true, message: '请输入班级名称', trigger: 'blur' },
          { max: 255, message: '题目名称最长为255个字符', trigger: 'blur' }
        ],
        course_name: [
          { required: true, message: '请输入题目名称', trigger: 'blur' },
          { max: 255, message: '题目名称最长为255个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入题目描述', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    storeClass: {
      handler (val) {
        if (val) {
          this.loading = false
          this.form = val
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters({
      storeClass: 'class'
    })
  },
  mounted () {
  },
  methods: {
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          updateClass({
            id: this.form.id,
            name: this.form.name,
            course_name: this.form.course_name,
            description: this.form.description
          }).then(resp => {
            this.refreshClass()
            this.$success({
              title: '成功',
              content: '编辑成功',
              okText: '返回',
              icon: () => <a-icon type="check-circle" style="color: #52c41a !important;"/>,
              onOk: () => {
                this.$router.go(-1)
              }
            })
            this.submitBtn = false
          }).catch(err => {
            this.submitBtn = false
            if (err.message === 'VALIDATION_ERROR') {
              err.response.error.forEach(v => {
                this.$error({
                  content: v.translation
                })
              })
            } else if (err.message === 'INTERNAL_ERROR') {
              this.$notification['error']({
                message: '错误',
                description: '服务器内部错误，请稍后再试',
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
          this.submitBtn = false
          return false
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.ant-space-horizontal
  width: 100%
  justify-content: center
</style>
