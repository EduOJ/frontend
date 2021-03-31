<template>
  <div class="vue-codemirror" :class="{ merge }">
    <div ref="mergeview" v-if="merge"></div>
    <textarea ref="textarea" :name="name" :placeholder="placeholder" v-else></textarea>
  </div>
</template>

<script>
  // lib
  import _CodeMirror from 'codemirror/lib/codemirror.js'
  import 'codemirror/mode/clike/clike'
  import 'codemirror/mode/python/python'
  const CodeMirror = window.CodeMirror || _CodeMirror

  // pollfill
  if (typeof Object.assign !== 'function') {
    Object.defineProperty(Object, 'assign', {
      value (target, varArgs) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object')
        }
        const to = Object(target)
        for (let index = 1; index < arguments.length; index++) {
          const nextSource = arguments[index]
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey]
              }
            }
          }
        }
        return to
      },
      writable: true,
      configurable: true
    })
  }

  // export
  export default {
    name: 'Codemirror',
    data () {
      return {
        content: '',
        codemirror: null,
        cminstance: null
      }
    },
    props: {
      code: {
        type: String,
        default: ''
      },
      value: {
        type: String,
        default: ''
      },
      marker: {
        type: Function,
        default: undefined
      },
      unseenLines: {
        type: Array,
        default: undefined
      },
      name: {
        type: String,
        default: 'codemirror'
      },
      placeholder: {
        type: String,
        default: ''
      },
      merge: {
        type: Boolean,
        default: false
      },
      options: {
        type: Object,
        default: () => ({})
      },
      events: {
        type: Array,
        default: () => ([])
      },
      globalOptions: {
        type: Object,
        default: () => ({})
      },
      globalEvents: {
        type: Array,
        default: () => ([])
      }
    },
    watch: {
      options: {
        deep: true,
        handler (options) {
          for (const key in options) {
            this.cminstance.setOption(key, options[key])
          }
        }
      },
      merge () {
        this.$nextTick(this.switchMerge)
      },
      code (newVal) {
        this.handerCodeChange(newVal)
      },
      value (newVal) {
        this.handerCodeChange(newVal)
      }
    },
    methods: {
      initialize () {
        const cmOptions = Object.assign({}, this.globalOptions, this.options)
        if (this.merge) {
          this.codemirror = CodeMirror.MergeView(this.$refs.mergeview, cmOptions)
          this.cminstance = this.codemirror.edit
        } else {
          this.codemirror = CodeMirror.fromTextArea(this.$refs.textarea, cmOptions)
          this.cminstance = this.codemirror
          this.cminstance.setValue(this.code || this.value || this.content)
        }
        this.cminstance.on('change', cm => {
          this.content = cm.getValue()
          if (this.$emit) {
            this.$emit('input', this.content)
          }
        })

        // 所有有效事件（驼峰命名）+ 去重
        const tmpEvents = {}
        // eslint-disable-next-line no-unused-vars
        const allEvents = [
          'scroll',
          'changes',
          'beforeChange',
          'cursorActivity',
          'keyHandled',
          'inputRead',
          'electricInput',
          'beforeSelectionChange',
          'viewportChange',
          'swapDoc',
          'gutterClick',
          'gutterContextMenu',
          'focus',
          'blur',
          'refresh',
          'optionChange',
          'scrollCursorIntoView',
          'update'
        ]
        allEvents.concat(this.events)
        .concat(this.globalEvents)
        .filter(e => (!tmpEvents[e] && (tmpEvents[e] = true)))
        .forEach(event => {
          // 循环事件，并兼容 run-time 事件命名
          this.cminstance.on(event, (...args) => {
            // console.log('当有事件触发了', event, args)
            this.$emit(event, ...args)
            const lowerCaseEvent = event.replace(/([A-Z])/g, '-$1').toLowerCase()
            if (lowerCaseEvent !== event) {
              this.$emit(lowerCaseEvent, ...args)
            }
          })
        })

        this.$emit('ready', this.codemirror)
        this.unseenLineMarkers()

        // prevents funky dynamic rendering
        this.refresh()
      },
      refresh () {
        this.$nextTick(() => {
          this.cminstance.refresh()
        })
      },
      destroy () {
        // garbage cleanup
        const element = this.cminstance.doc.cm.getWrapperElement()
        element && element.remove && element.remove()
      },
      handerCodeChange (newVal) {
        // eslint-disable-next-line camelcase
        const cm_value = this.cminstance.getValue()
        // eslint-disable-next-line camelcase
        if (newVal !== cm_value) {
          const scrollInfo = this.cminstance.getScrollInfo()
          this.cminstance.setValue(newVal)
          this.content = newVal
          this.cminstance.scrollTo(scrollInfo.left, scrollInfo.top)
        }
        this.unseenLineMarkers()
      },
      unseenLineMarkers () {
        if (this.unseenLines !== undefined && this.marker !== undefined) {
          this.unseenLines.forEach(line => {
            const info = this.cminstance.lineInfo(line)
            this.cminstance.setGutterMarker(line, 'breakpoints', info.gutterMarkers ? null : this.marker())
          })
        }
      },
      switchMerge () {
        // Save current values
        const history = this.cminstance.doc.history
        const cleanGeneration = this.cminstance.doc.cleanGeneration
        this.options.value = this.cminstance.getValue()

        this.destroy()
        this.initialize()

        // Restore values
        this.cminstance.doc.history = history
        this.cminstance.doc.cleanGeneration = cleanGeneration
      }
    },
    mounted () {
      this.initialize()
    },
    beforeDestroy () {
      this.destroy()
    }
  }
</script>

<style>
.cm-s-darcula span.cm-meta { color: #BBB529; }
.cm-s-darcula span.cm-number { color: #6897BB; }
.cm-s-darcula span.cm-keyword { line-height: 1em; font-weight: bold; color: #CC7832; }
.cm-s-darcula span.cm-def { color: #FFC66D; }
.cm-s-darcula span.cm-variable { color: #A9B7C6; }
.cm-s-darcula span.cm-variable-2 { color: #A9B7C6; }
.cm-s-darcula span.cm-variable-3 { color: #A9B7C6; }
.cm-s-darcula span.cm-property { color: #A9B7C6; }
.cm-s-darcula span.cm-operator { color: #A9B7C6; }
.cm-s-darcula span.cm-string { color: #6A8759; }
.cm-s-darcula span.cm-string-2 { color: #6A8759; }
.cm-s-darcula span.cm-comment { color: #808080; }
.cm-s-darcula span.cm-link { color: #287BDE; }
.cm-s-darcula span.cm-atom, .cm-s-darcula span.cm-type { font-weight: bold; color: #CC7832; }
.cm-s-darcula span.cm-error { color: #BC3F3C; }
.cm-s-darcula span.cm-tag { color: #CC7832; }
.cm-s-darcula span.cm-attribute { color: #6A8759; }
.cm-s-darcula span.cm-qualifier { color: #6A8759; }
.cm-s-darcula span.cm-bracket { color: #A9B7C6; }
.cm-s-darcula.CodeMirror { background: #2B2B2B; color: #A9B7C6; }

.cm-s-darcula .CodeMirror-cursor { border-left: 1px solid #dddddd; }
.cm-s-darcula .CodeMirror-activeline-background { background: #3A3A3A; }
.cm-s-darcula div.CodeMirror-selected { background: #085a9c; }
.cm-s-darcula .CodeMirror-gutters { background: rgb(72, 72, 72); border-right: 1px solid grey; color: #606366 }

.cm-s-darcula span.cm-builtin { color: #A9B7C6; }
.cm-s-darcula  { font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;}
.cm-s-darcula .CodeMirror-matchingbracket { background-color: #3b514d; color: yellow !important; }

.CodeMirror-hints.darcula {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  color: #9c9e9e;
  background-color: #3b3e3f !important;
}

.CodeMirror-hints.darcula .CodeMirror-hint-active {
  background-color: #494d4e !important;
  color: #9c9e9e !important;
}

</style>

<style>
@font-face{
  font-family: 'JetBrains Mono';
  src: url('./JetBrainsMono-Regular.woff2') format('woff2'),
  url('./JetBrainsMono-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
</style>
