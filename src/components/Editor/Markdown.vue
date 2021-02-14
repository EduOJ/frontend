<template>
  <div ref="render">

  </div>
</template>

<script>
import Vditor from 'vditor'

export default {
  name: 'Markdown',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  mounted () {
    this.render()
  },
  methods: {
    render () {
      Vditor.preview(this.$refs.render, this.value, {
        hljs: {
          enable: true,
          style: 'dracula',
          lineNumber: true
        },
        math: {
          inlineDigit: true,
          engine: 'MathJax'
        },
        cdn: '/assets/vditor'
      })
    }
  },
  watch: {
    value () {
      this.render()
    }
  }
}
</script>

<style lang="scss">
@import '~vditor/src/assets/scss/index.scss';
</style>
