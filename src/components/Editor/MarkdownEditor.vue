<template>
  <div class="simplemde">
    <textarea
      :name="uniqueId"
      :id="uniqueId"
      ref="textarea"
      @input="handleInput($event.target.value)">
    </textarea>
  </div>
</template>

<script>
import SimpleMDE from 'simplemde'
import CodeMirror4 from '@ragg/inline-attachment/dist/codemirror-4'
import config from '@/config/config'
import store from '@/store'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { notification } from 'ant-design-vue'
// const CodeMirror4 = require()
export default {
  name: 'MarkDownEditor',
  props: {
    uniqueId: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
    configs: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      isValueUpdateFromInner: false
    }
  },
  mounted () {
    this.simplemde = new SimpleMDE({
      element: this.$el.firstElementChild,
      initialValue: this.value,
      renderingConfig: {},
      spellChecker: false
    })
    this.simplemde.codemirror.on('change', (instance, changeObj) => {
      if (changeObj.origin === 'setValue') {
        return
      }
      const val = this.simplemde.value()
      this.handleInput(val)
    })
    this.simplemde.codemirror.on('blur', () => {
      const val = this.simplemde.value()
      this.handleBlur(val)
    })
    const that = this
    this.codemirror = new CodeMirror4(this.simplemde.codemirror, {
      uploadUrl: config.apiUrl + '/api/image',
      extraHeaders: {
        'Authorization': this.$store.state.user.token
      },
      urlText: '![CHANGE THIS]({filename})',
      onFileUploadResponse (xhr) {
        const result = JSON.parse(xhr.responseText)
        const filename = config.apiUrl + result['data']['filename']
        if (result && filename) {
          let newValue
          if (typeof this.settings.urlText === 'function') {
            newValue = this.settings.urlText.call(this, filename, result)
          } else {
            newValue = this.settings.urlText.replace(this.filenameTag, filename)
          }
          const text = this.editor.getValue().replace(this.lastValue, newValue)
          this.editor.setValue(text)
          this.settings.onFileUploaded.call(this, filename)
          console.log(this.editor.instance.doc.getCursor(), newValue, newValue.search('CHANGE THIS'), newValue.search('CHANGE THIS') + 11)
          this.editor.instance.doc.setSelection({
            line: this.editor.instance.doc.getCursor().line,
            ch: this.editor.instance.doc.getCursor().ch - 20
          }, {
            line: this.editor.instance.doc.getCursor().line,
            ch: this.editor.instance.doc.getCursor().ch - 9
          })
        }
        return false
      },
      onFileUploadError (xhr) {
        const resp = JSON.parse(xhr.response)
        if (resp.message && (resp.message === 'AUTH_NEED_TOKEN' || resp.message === 'AUTH_SESSION_EXPIRED')) {
          store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))
          store.dispatch('GetInfo').then(data => {
            store.commit('SET_INFO', data)
          })
          notification.error({
            message: '错误',
            description: resp.message === 'AUTH_NEED_TOKEN' ? '本页面需要登录才能访问' : '你的登录状态已经过期'
          })
          that.$router.push('/user/login')
          return false
        }
      }
    })
    this.$nextTick(() => {
      this.$emit('initialized', this.simplemde)
    })
  },
  deactivated () {
    const editor = this.simplemde
    if (!editor) return
    const isFullScreen = editor.codemirror.getOption('fullScreen')
    if (isFullScreen) editor.toggleFullScreen()
  },
  methods: {
    handleInput (val) {
      this.isValueUpdateFromInner = true
      this.$emit('input', val)
    },
    handleBlur (val) {
      this.isValueUpdateFromInner = true
      this.$emit('blur', val)
    }
  },
  destroyed () {
    this.simplemde = null
  },
  watch: {
    value (val) {
      if (this.isValueUpdateFromInner) {
        this.isValueUpdateFromInner = false
      } else {
        this.simplemde.value(val)
      }
    }
  }
}
</script>

<style scoped>
@import '~simplemde/dist/simplemde.min.css';
</style>
