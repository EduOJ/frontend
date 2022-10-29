<template>
  <div>
    <a-list
      class="comment-list"
      item-layout="vertical"
      :data-source="commentList"
    >
      <a-list-item slot="renderItem" slot-scope="item">
        <a-comment>
          <span slot="actions" key="comment-nested-reply-to">Reply to</span>
          <a slot="author">{{ item.author }}</a>
          <a-avatar
            slot="avatar"
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            alt="New"
          />
          <p slot="content">{{ item.content }}</p>
          <a-comment>
            <span slot="actions" key="comment-nested-reply-to">Reply to</span>
            <a slot="author">author2</a>
            <a-avatar
              slot="avatar"
              src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
              alt="New"
            />
            <p slot="content">author2's content</p>
          </a-comment>
        </a-comment>
      </a-list-item>
    </a-list>
    <!-- <a-button type="link" @click="handelReply" v-show="!replyVisible">
      回复1
    </a-button> -->
    <a-form-item v-show="replyVisible">
      <a-textarea v-model="reply" :rows="1" />
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
// import { getSolutionComments } from '@/api/solution'

export default {
  name: 'CommentArea',
  props: {
    commentList: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      replyVisible: false,
      reply: ''
    }
  },
  methods: {
    // TODO: 通过题解号查询评论
    // fetch () {
    //   getSolutionComments(this.id).then(data => {
    //     this.commentList = data.commentList
    //   }).catch(err => {
    //     this.$error({
    //       content: '遇到错误：' + err.message
    //     })
    //     console.error(err)
    //   })
    // }
    handelReply () {
      this.replyVisible = !this.replyVisible
      console.log(this.replyVisible)
    },
    // TODO
    handleSubmit () {
      console.log(this.reply)
    },
    handleCancel () {
      this.replyVisible = !this.replyVisible
    }
  },
  mounted () {
    // this.fatch()
    this.render()
  }
}
</script>

<style>
  .comment {
    display: none;
  }
</style>
