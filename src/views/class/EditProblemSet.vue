<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="编辑作业" :loading="loading">
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
        >
          <a-form-model-item ref="name" prop="name" label="作业名称">
            <a-input
              size="large"
              v-model="form.name"
              placeholder="如：第一周：线性表"
            >
              <a-icon slot="prefix" type="edit"/>
            </a-input>
          </a-form-model-item>
          <a-form-model-item ref="description" prop="description" label="作业描述">
            <mark-down-editor v-model="form.description"/>
          </a-form-model-item>
          <a-form-model-item ref="time" prop="time" label="时间设置">
            <a-range-picker
              :show-time="{ format: 'HH:mm' }"
              format="YYYY-MM-DD HH:mm"
              :placeholder="['开始时间', '结束时间']"
              v-model="form.time"
            />
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
    </a-col>
  </a-row>
</template>

<script>
import { editProblemSet } from '@/api/class'
import { mapGetters } from 'vuex'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'
import moment from 'moment'
export default {
  components: {
    MarkDownEditor
  },
  inject: ['refreshClass'],
  data () {
    return {
      submitBtn: false,
      id: this.$route.params.id,
      loading: true,
      form: {
        name: '',
        description: '',
        time: [moment(), moment().add(1, 'weeks')]
      },
      rules: {
        name: [
          { required: true, message: '请输入作业名称', trigger: 'blur' },
          { max: 255, message: '作业名称最长为255个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入作业描述', trigger: 'blur' }
        ],
        time: [
          { required: true, message: '请输入起止时间', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    storeClass: {
      handler (val) {
        if (val && val.problem_sets) {
          const p = val.problem_sets.map(p => {
            p.time = [moment(p.start_time), moment(p.end_time)]
            return p
          }).filter(p => +p.id === +this.id)[0]
          if (p) {
            this.form = Object.assign({}, this.form, p)
            this.loading = false
          }
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
          editProblemSet({
            id: this.id,
            class_id: this.storeClass.id,
            name: this.form.name,
            description: this.form.description,
            start_time: this.form.time[0].format(),
            end_time: this.form.time[1].format()
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
