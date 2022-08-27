<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="创建题解">
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
        >
          <a-form-model-item ref="name" prop="name" label="题解标题">
            <a-input
              size="large"
              v-model="form.name"
              placeholder="给题解起一个好听的名字叭"
            >
              <a-icon slot="prefix" type="edit"/>
            </a-input>
          </a-form-model-item>
          <a-form-model-item ref="description" prop="description" label="题解内容">
            <mark-down-editor unique-id="description_markdown" v-model="form.description"/>
          </a-form-model-item>
          <a-form-model-item ref="public" prop="public" label="是否公开">
            <a-switch size="large" v-model="form.public" />
          </a-form-model-item>

          <a-form-model-item ref="attachment_file" prop="attachment_file" label="题解附件">
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
import { createSolution } from '@/api/solution'
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
        attachment_file: []
      },
      rules: {
        name: [
          { required: true, message: '请输入题解名称', trigger: 'blur' },
          { max: 255, message: '题解名称最长为255个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入题解描述', trigger: 'blur' }
        ],
        public: [
          { required: true, message: '请选择是否公开', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    beforeUpload (file) {
      this.form.attachment_file = [ file ]
      console.log(this.form.attachment_file)
      return false
    },
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          createSolution({
            name: this.form.name,
            description: this.form.description,
            public: this.form.public,
            attachment_file: this.form.attachment_file[0]
          }).then(resp => {
            this.$store.dispatch('GetInfo').then(data => {
              this.$store.commit('SET_INFO', data)
            })
            this.$confirm({
              title: '成功',
              content: '创建成功',
              cancelText: '返回',
              okText: '前往查看',
              icon: () => <a-icon type="check-circle" style="color: #52c41a !important;"/>,
              onOk: () => {
                console.log(resp)
                /** TODO */
                this.$router.push({
                  'name': 'problem',
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
                console.log(err)
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
