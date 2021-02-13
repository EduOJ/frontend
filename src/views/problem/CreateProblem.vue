<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="创建题目">
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
        >
          <a-form-model-item ref="name" prop="name" label="题目名称">
            <a-input
              size="large"
              v-model="form.name"
              placeholder="题目名称"
            >
              <a-icon slot="prefix" type="edit"/>
            </a-input>
          </a-form-model-item>
          <a-form-model-item ref="description" prop="description" label="题目描述">
            <mark-down-editor unique-id="description_markdown" v-model="form.description"/>
          </a-form-model-item>
          <a-form-model-item ref="public" prop="public" label="公开题目">
            <a-switch size="large" v-model="form.public" />
          </a-form-model-item>
          <a-form-model-item ref="privacy" prop="privacy" label="隐私模式（暂不支持）" hidden>
            <a-switch size="large" v-model="form.privacy" disabled />
          </a-form-model-item>
          <a-form-model-item ref="language_allowed" prop="language_allowed" label="允许使用的语言">
            <a-select
              size="large"
              mode="multiple"
              placeholder="允许使用哪些语言？"
              v-model="form.language_allowed"
              style="width: 300px"
            >
              <a-select-option key="cpp" value="cpp">
                C++
              </a-select-option>
              <a-select-option key="c" value="c">
                C
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item ref="memory_limit" prop="memory_limit" label="内存限制">
            <a-input-group compact>
              <a-input size="large" v-model="form.memory_limit" style="width: 200px"/>
              <a-select size="large" v-model="form.memory_limit_unit" style="width: 100px">
                <a-select-option key="KiB" value="KiB">
                  KiB
                </a-select-option>
                <a-select-option key="MiB" value="MiB">
                  MiB
                </a-select-option>
                <a-select-option key="GiB" value="GiB">
                  GiB
                </a-select-option>
              </a-select>
            </a-input-group>
          </a-form-model-item>

          <a-form-model-item ref="time_limit" prop="time_limit" label="时间限制">
            <a-input size="large" v-model="form.time_limit" style="width: 300px" suffix="ms"/>
          </a-form-model-item>

          <a-form-model-item ref="compile_environment" prop="compile_environment" label="编译环境变量">
            <a-input size="large" v-model="form.compile_environment" style="width: 300px" placeholder="一般不需要填写"/>
          </a-form-model-item>

          <a-form-model-item ref="compare_script_name" prop="compare_script_name" label="评测脚本">
            <a-select
              size="large"
              v-model="form.compare_script_name"
              style="width: 300px"
            >
              <a-select-option key="compare_soft_match" value="compare_soft_match">
                忽略行末空格 + 最后回车
              </a-select-option>
              <a-select-option key="compare_float" value="compare_float">
                浮点数匹配 （相差1e-8内认为正确)
              </a-select-option>
              <a-select-option key="compare_exact_match" value="compare_exact_match">
                字符级严格匹配
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item ref="attachment_file" prop="attachment_file" label="题目附件">
            <a-upload :file-list="form.attachment_file" :before-upload="beforeUpload" :remove="_ => {this.form.attachment_file = []}">
              <a-button> <a-icon type="upload" /> 选择附件 </a-button>
            </a-upload>
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
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { createProblem } from '@/api/problem'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'

export default {
  components: {
    MarkDownEditor
  },
  data () {
    return {
      submitBtn: false,
      form: {
        name: '',
        description: '',
        public: true,
        privacy: false,
        memory_limit: 256,
        memory_limit_unit: 'MiB',
        time_limit: 1000,
        language_allowed: ['c', 'cpp'],
        compile_environment: '',
        compare_script_name: 'compare_soft_match',
        attachment_file: []
      },
      rules: {
        name: [
          { required: true, message: '请输入题目名称', trigger: 'blur' },
          { max: 255, message: '题目名称最长为255个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入题目描述', trigger: 'blur' }
        ],
        public: [
          { required: true, message: '请选择是否公开', trigger: 'blur' }
        ],
        privacy: [
          { required: true, message: '请选择隐私模式', trigger: 'blur' }
        ],
        memory_limit: [
          { required: true, message: '请输入内存限制', trigger: 'blur' }
        ],
        language_allowed: [
          { required: true, message: '请选择允许的语言', trigger: 'blur' }
        ],
        time_limit: [
          { required: true, message: '请输入时间限制', trigger: 'blur' }
        ],
        compile_environment: [
          { max: 255, message: '编译环境最长为255个字符', trigger: 'blur' }
        ],
        compare_script_name: [
          { required: true, message: '请选择评测脚本', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    beforeUpload (file) {
      console.log(file)
      this.form.attachment_file = [ file ]
      // this.form.attachment_file = [...this.form.attachment_file, file]
      return false
    },
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          createProblem({
            name: this.form.name,
            description: this.form.description,
            public: this.form.public,
            privacy: this.form.privacy,
            memory_limit: this.form.memory_limit * {
              KiB: 1024,
              MiB: 1024 * 1024,
              GiB: 1024 * 1024 * 1024
            }[this.form.memory_limit_unit],
            time_limit: this.form.time_limit,
            language_allowed: this.form.language_allowed.join(','),
            compile_environment: this.form.compile_environment,
            compare_script_name: this.form.compare_script_name,
            attachment_file: this.form.attachment_file[0]
          }).then(resp => {
            this.$confirm({
              title: '成功',
              content: '创建成功',
              cancelText: '返回',
              okText: '继续编辑',
              icon: () => <a-icon type="check-circle" style="color: #52c41a !important;"/>,
              onOk: () => {
                console.log(resp)
                this.$router.push({
                  'name': 'problem.edit',
                  params: {
                    id: resp.problem.id
                  }
                })
              },
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
                  case 'name':
                    this.$refs.name.help = v.translation
                    this.$refs.name.validateState = 'error'
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
