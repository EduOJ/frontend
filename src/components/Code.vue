<template>
  <a-spin :spinning="load" @mouseover="show_actions = true" @mouseout="show_actions = false">
    <perfect-scrollbar>
      <highlightjs :autodetect="language === ''" :language="language === '' ? undefined : language" :code="content" class="eduoj-code"/>
    </perfect-scrollbar>
    <div class="action" v-show="show_actions">
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
    }
  },
  data () {
    if (this.text !== '') {
      return {
        load: false,
        content: this.text,
        show_actions: false,
        copy_tooltip: false
      }
    }
    return {
      load: true,
      content: '',
      show_actions: false,
      copy_tooltip: false
    }
  },
  mounted () {
    request({
      url: this.url,
      method: 'get'
    }).then(resp => {
      this.load = false
      this.content = resp
    }).catch(err => {
      console.log(err)
      this.content = '发生了错误'
      this.load = false
    })
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
    }
  }
}
</script>

<style scoped lang="sass">
.ps
  max-height: 100px

.action
  position: absolute
  right: 10px
  top: 10px

</style>

<style lang="sass">
.eduoj-code
  min-height: 100px
  margin: 0
  border-radius: 5px
  code
    min-height: 100px
</style>
