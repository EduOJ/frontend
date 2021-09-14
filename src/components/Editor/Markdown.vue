<template>
  <div>
    <a-skeleton :loading="loading">
    </a-skeleton>
    <div class="heti" style="max-width: 100%!important;" v-show="!loading">
      <div ref="render">
      </div>
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
  data () {
    return {
      loading: true
    }
  },
  methods: {
    render () {
      if (this.value) {
        const that = this
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
            that.loading = false
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
