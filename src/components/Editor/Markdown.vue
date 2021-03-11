<template>
  <div class="heti" style="max-width: 100%!important;">
    <div ref="render">
    </div>
  </div>
</template>

<script>
import Vditor from 'vditor'
import Heti from 'heti/js/heti-addon.js'
const h = new Heti()

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
      if (this.value) {
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
          cdn: '/assets/vditor',
          after: () => {
            h.spacingElement(this.$refs.render)
          }
        })
      }
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
