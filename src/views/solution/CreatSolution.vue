<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="创建题解">
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
        >
          <a-form-model-item ref="problemID" prop="problemID" label="题目编号">
            <a-input size="large" v-model="form.problemID" disabled />
          </a-form-model-item>

          <a-form-model-item ref="author" prop="author" label="作者">
            <a-input size="large" v-model="form.author" disabled />
          </a-form-model-item>

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
        // TODO
        problemID: 1,
        name: '',
        author: 'horizon',
        description: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入题解名称', trigger: 'blur' },
          { max: 255, message: '题解名称最长为255个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入题解描述', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
  },
  methods: {
    onSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          createSolution({
            problemID: this.form.problemID,
            name: this.form.name,
            author: this.form.author,
            description: this.form.description
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
