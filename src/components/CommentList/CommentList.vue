<template>
  <div>
    <a-comment v-for="item in comments" :key="item.id">
      <Reply :solutionId="item.solutionId" :fatherNode="item.id" label="回复" />
      <a slot="author">{{ item.speaker }}</a>
      <p slot="content">
        {{ item.description }}
      </p>
      <CommentList :comments="item.kids" />
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
  data () {
    return {}
  },
  methods: {},
  mounted () {
    // this.fatch()
    // this.render()
  }
}
</script>

<style>
  .comment {
    display:none;
  }
</style>
