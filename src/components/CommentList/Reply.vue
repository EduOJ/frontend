<template>
  <div>
    <a-button type="link" @click="handelReply" v-show="!replyVisible">
      {{ label }}
    </a-button>
    <a-form-item v-show="replyVisible">
      <a-textarea v-model="form.reply" :rows="1" />
    </a-form-item>
    <a-form-item v-show="replyVisible">
      <a-space>
        <a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit">
          回复
        </a-button>
        <a-button html-type="cancel" :loading="submitting" type="default" @click="handleCancel">
          取消
        </a-button>
      </a-space>
    </a-form-item>
  </div>
</template>

<script>
import { mapState } from 'vuex'

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
      form: {
        reply: ''
      },
      replyVisible: false
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
      console.log(this.replyVisible)
    },
    // TODO
    handleSubmit () {
      console.log(this.form.reply)
    },
    handleCancel () {
      this.replyVisible = !this.replyVisible
    }
  },
  mounted () {
    this.render()
  }
}
</script>

<style>

</style>
