<template>
  <span :class="[status, 'status']">
    <span class="score" v-if="score !== -1">
      {{ score }}
    </span>
    {{ localized }}
  </span>
</template>

<script>
export default {
  name: 'RunStatus',
  props: {
    status: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: -1
    }
  },
  computed: {
    localized () {
      return {
        PENDING: '等待评测',
        JUDGING: '评测中',
        JUDGEMENT_FAILED: '评测错误',
        ACCEPTED: '通过',
        WRONG_ANSWER: '答案错误',
        PRESENTATION_ERROR: '输出格式错误',
        COMPILE_ERROR: '编译错误',
        RUNTIME_ERROR: '运行时错误',
        DANGEROUS_SYSTEM_CALLS: '非法程序',
        MEMORY_LIMIT_EXCEEDED: '内存超过限制',
        TIME_LIMIT_EXCEEDED: '时间超过限制'
      }[this.status]
    }
  }
}
</script>

<style scoped lang="sass">
.score
  font-weight: bold
  width: 40px
  display: inline-block
  text-align: center
.status
  font-weight: bold
.PRESENTATION_ERROR
  color: #8b080b
.PENDING
  color: lightslategrey
.JUDGEMENT_FAILED
  color: rebeccapurple
.ACCEPTED
  color: #179f17
.WRONG_ANSWER
  color: red
.TIME_LIMIT_EXCEEDED
  color: blue
.MEMORY_LIMIT_EXCEEDED
  color: #8f3f71
.RUNTIME_ERROR
  color: saddlebrown
.DANGEROUS_SYSTEM_CALLS
  color: black
.COMPILE_ERROR
  color: #6f1c00
</style>
