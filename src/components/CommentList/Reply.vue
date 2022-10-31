<template>
  <a-form-model
    ref="form"
    :model="form"
    :rules="rules"
  >

    <a-button type="link" @click="handelReply" v-show="!replyVisible">
      {{ label }}
    </a-button>

    <a-form-item ref="reply" prop="reply" v-show="replyVisible">
      <a-textarea v-model="form.reply" :rows="1" />
    </a-form-item>

    <a-form-item v-show="replyVisible">
      <a-space>
        <a-button type="primary" @click="handleSubmit" :loading="submitBtn" :disabled="submitBtn">
          回复
        </a-button>
        <a-button type="default" @click="handleCancel">
          取消
        </a-button>
      </a-space>
    </a-form-item>

  </a-form-model>
</template>

<script>
import { mapState } from 'vuex'
import { createSolutionComments } from '@/api/solution_comments'

export default {
  name: 'Reply',
  props: {
    label: {
      type: String,
      required: true
    },
    solutionId: {
      type: Number,
      required: true
    },
    fatherNode: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      submitBtn: false,
      isRoot: false,
      form: {
        reply: ''
      },
      replyVisible: false,
      rules: {
        reply: [
          { required: true, message: '评论不能为空', trigger: 'blur' },
          { max: 255, message: '评论最长为255个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.user.info
    })
  },
  methods: {
    handelReply () {
      this.replyVisible = !this.replyVisible
    },
    handleSubmit () {
      this.submitBtn = true
      this.$refs.form.validate(valid => {
        if (valid) {
          // console.log(!this.fatherNode)
          if (!this.fatherNode) {
            this.fatherNode = 1
            this.isRoot = true
          } else {
            this.isRoot = false
          }
          createSolutionComments({
            solutionId: this.solutionId,
            fatherNode: this.fatherNode,
            reply: this.form.reply,
            speaker: this.user.nickname,
            isRoot: this.isRoot
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
              },
              onCancel: () => {}
            })
            this.submitBtn = false
          }).catch(err => {
            this.submitBtn = false
            if (err.message === 'VALIDATION_ERROR') {
              err.response.error.forEach(v => {
                switch (v.field) {
                  case 'SolutionId':
                    this.$refs.solutionId.help = v.translation
                    this.$refs.solutionId.validateState = 'error'
                    break
                  case 'FatherNode':
                    this.$refs.fatherNode.help = v.translation
                    this.$refs.fatherNode.validateState = 'error'
                    break
                  case 'Reply':
                    this.$refs.reply.help = v.translation
                    this.$refs.reply.validateState = 'error'
                    break
                  case 'Speaker':
                    this.$refs.speaker.help = v.translation
                    this.$refs.speaker.validateState = 'error'
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
    },
    handleCancel () {
      this.replyVisible = !this.replyVisible
    }
  },
  mounted () {
    // this.render()
  }
}
</script>

<style>

</style>
