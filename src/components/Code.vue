<template>
  <a-spin :spinning="(!lazyLoad) && loading" @mouseover="show_actions = true" @mouseout="show_actions = false">
    <perfect-scrollbar :style="{'max-height': height}">
      <highlightjs :autodetect="language === ''" :language="language === '' ? undefined : language" :code="content" class="eduoj-code"/>
    </perfect-scrollbar>
    <div class="load" v-if="lazyLoad">
      <a-button size="small" @click="load()" ghost>点击加载</a-button>
    </div>
    <div class="action" v-show="show_actions" v-else>
      <a-space>
        <a-button
          size="small"
          v-clipboard:copy="content"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyError"
          ghost
        >
          <a-icon type="copy" />
          {{ copy_tooltip ? '复制成功！':'复制' }}
        </a-button>
        <a-button size="small" @click="handleSave()" v-if="filename !== ''" ghost>
          <a-icon type="download" />
          下载
        </a-button>
      </a-space>
    </div>
  </a-spin>
</template>

<script>
import hljs from 'highlight.js'
import Vue from 'vue'
import request from '@/utils/request'
import download from 'js-file-download'

Vue.use(hljs.vuePlugin)
export default {
  name: 'Code',
  props: {
    url: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: ''
    },
    lazyLoad: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: ''
    }
  },
  data () {
    if (this.text !== '') {
      return {
        loading: false,
        content: this.text,
        show_actions: false,
        copy_tooltip: false
      }
    }
    return {
      loading: true,
      content: '',
      show_actions: false,
      copy_tooltip: false
    }
  },
  mounted () {
    if (!this.lazyLoad) {
      this.load()
    }
  },
  methods: {
    copySuccess () {
      this.copy_tooltip = true
      setTimeout(_ => {
        this.copy_tooltip = false
      }, 2000)
    },
    copyError () {
      this.$message.error('复制失败')
    },
    handleSave () {
      download(this.content, this.filename)
    },
    load () {
      this.lazyLoad = false
      request({
        url: this.url,
        method: 'get'
      }).then(resp => {
        this.loading = false
        this.content = String(resp)
        if (this.content === '') {
          this.content = '内容为空'
        }
      }).catch(err => {
        console.log(err)
        this.content = '发生了错误'
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="sass">
.action
  position: absolute
  right: 10px
  top: 10px
.load
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  display: flex
  align-items: center
  height: 100px
  justify-content: center
  i
    font-size: 40px
  font-size: 20px
</style>

<style lang="sass">
.ps
  border-radius: 5px
.eduoj-code
  min-height: 100px
  margin: 0
  code
    min-height: 100px
</style>

<style lang="scss">
@import '~highlight.js/scss/darcula.scss';
</style>
