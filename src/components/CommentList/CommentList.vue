<template>
  <div>
    <a-comment v-for="item in comments" :key="item.uid">
      <Reply solutionId="1" fatherNode="2" label="回复" />
      <a slot="author">{{ item.userName }}</a>
      <a-avatar
        slot="avatar"
        :src="item.avatar"
        :alt="item.userName"
      />
      <p slot="content">
        {{ item.content }}
        {{ item.uid }}
      </p>
      <CommentList :comments="item.reply" />
    </a-comment>
  </div>
</template>
<script>
import Reply from './Reply'

export default {
  components: {
    Reply
  },
  name: 'CommentList',
  props: {
    comments: {
      type: Array,
      required: true
    }
  },
  data () {},
  methods: {},
  mounted () {
    // this.fatch()
    this.render()
  }
}
</script>
<style>
  .comment {
    display:none;
  }
</style>
