<template>
  <div class="heti" style="max-width: 100%!important;">
    <div ref="render">
    </div>
  </div>
</template>

<script>
import Vditor from 'vditor'
import config from '@/config/config'
import store from '@/store'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { notification } from 'ant-design-vue'
import Heti from 'heti/js/heti-addon.js'

const h = new Heti()
export default {
  name: 'MarkDownEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    configs: {
      type: Object,
      default () {
        return {}
      }
    },
    dealAt: {
      type: Function,
      default: null
    },
    dealHashTag: {
      type: Function,
      default: null
    }
  },
  data () {
    return {
      contentEditor: null,
      loaded: false
    }
  },
  mounted () {
    const that = this
    this.editor = new Vditor(this.$refs.render, {
      height: 360,
      toolbarConfig: {
        pin: true
      },
      classes: 'heti',
      cache: {
        enable: false
      },
      resize: {
        enable: true
      },
      cdn: '/assets/vditor',
      preview: {
        hljs: {
          enable: true,
          style: 'dracula',
          lineNumber: true
        },
        math: {
          inlineDigit: true,
          engine: 'MathJax'
        },
        parse: (elem) => {
          console.log(elem)
          h.spacingElement(elem)
        }
      },
      tab: '    ',
      value: '',
      hint: {
        extend: [
          {
            key: '@',
            hint: (key) => {
              return this.dealAt(key)
            }
          },
          {
            key: '#',
            hint: (key) => {
              return this.dealHashTag(key)
            }
          }]
      },
      after: () => {
        that.loaded = true
        that.editor.setValue(that.value)
      },
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        'link',
        '|',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        '|',
        'upload',
        '|',
        'undo',
        'redo',
        '|',
        'fullscreen',
        'edit-mode',
        {
          name: 'more',
          toolbar: [
            'both',
            'code-theme',
            'content-theme',
            'export',
            'outline',
            'preview',
            'info',
            'help'
          ]
        }
      ],
      input: that.handleInput,
      blur () {
        that.handleBlur(that.editor.getValue())
      },
      upload: {
        multiple: false,
        fieldName: 'file',
        accept: 'image/*',
        url: config.apiUrl + '/api/image',
        setHeaders () {
          return {
            'Authorization': that.$store.state.user.token
          }
        },
        error (message) {
          const resp = JSON.parse(message)
          if (resp.message && (resp.message === 'AUTH_NEED_TOKEN' || resp.message === 'AUTH_SESSION_EXPIRED')) {
            store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))
            store.dispatch('GetInfo').then(data => {
              store.commit('SET_INFO', data)
            })
            notification.error({
              message: '错误',
              description: resp.message === 'AUTH_NEED_TOKEN' ? '本页面需要登录才能访问' : '你的登录状态已经过期'
            })
            that.$router.push({ name: 'login' })
            return false
          }
        },
        format (files, responseText) {
          const resp = JSON.parse(responseText)
          if (resp.message === 'SUCCESS') {
            const ret = {
              'msg': '',
              'code': 0,
              'data': {
                'errFiles': [],
                'succMap': {
                }
              }
            }
            ret.data.succMap[files[0].name] = config.apiUrl + resp.data.filename
            return JSON.stringify(ret)
          }
          const ret = {
            'msg': resp.message,
            'code': 0,
            'data': {
              'errFiles': [],
              'succMap': {
              }
            }
          }
          ret.data.errFiles = [files[0].name]
          return JSON.stringify(ret)
        }
      }
    })
  },
  methods: {
    ignoreNextUpdate () {
      this.ignoreNext = true
    },
    handleInput (val) {
      this.ignoreNext = true
      this.$emit('input', val)
    },
    handleBlur (val) {
      this.ignoreNext = true
      this.$emit('blur', val)
    }
  },
  destroyed () {
    this.editor = null
  },
  watch: {
    value (val) {
      if (this.ignoreNext) {
        this.ignoreNext = false
      } else {
        if (this.loaded) { this.editor.setValue(val) }
      }
    }
  }
}
</script>

<style lang="scss">
@import '~vditor/src/assets/scss/index.scss';
</style>
