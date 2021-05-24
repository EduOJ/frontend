<template>
  <div class="vue-codemirror" :class="{ merge, 'non-ligature': non_ligature }">
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
        cminstance: null,
        non_ligature: localStorage.getItem('non_ligrature') === 'true'
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
      setNonLigature (nonLigature) {
        this.non_ligature = nonLigature
      },
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

/* BASICS */

.CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: 'JetBrains Mono', serif !important;
  height: auto;
  color: black;
  direction: ltr;
}

/* PADDING */

.CodeMirror-lines {
  padding: 4px 0; /* Vertical padding around content */
}
.CodeMirror pre {
  padding: 0 4px; /* Horizontal padding of content */
}

.CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  background-color: white; /* The little square between H and V scrollbars */
}

/* GUTTER */

.CodeMirror-gutters {
  border-right: 1px solid #ddd;
  background-color: #f7f7f7;
  white-space: nowrap;
}
.CodeMirror-linenumbers {}
.CodeMirror-linenumber {
  padding: 0 3px 0 5px;
  min-width: 20px;
  text-align: right;
  color: #999;
  white-space: nowrap;
}

.CodeMirror-guttermarker { color: black; }
.CodeMirror-guttermarker-subtle { color: #999; }

/* CURSOR */

.CodeMirror-cursor {
  border-left: 1px solid black;
  border-right: none;
  width: 0;
}
/* Shown when moving in bi-directional text */
.CodeMirror div.CodeMirror-secondarycursor {
  border-left: 1px solid silver;
}
.cm-fat-cursor .CodeMirror-cursor {
  width: auto;
  border: 0 !important;
  background: #7e7;
}
.cm-fat-cursor div.CodeMirror-cursors {
  z-index: 1;
}
.cm-fat-cursor-mark {
  background-color: rgba(20, 255, 20, 0.5);
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
}
.cm-animate-fat-cursor {
  width: auto;
  border: 0;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
  background-color: #7e7;
}
@-moz-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@-webkit-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}

/* Can style cursor different in overwrite (non-insert) mode */
.CodeMirror-overwrite .CodeMirror-cursor {}

.cm-tab { display: inline-block; text-decoration: inherit; }

.CodeMirror-rulers {
  position: absolute;
  left: 0; right: 0; top: -50px; bottom: -20px;
  overflow: hidden;
}
.CodeMirror-ruler {
  border-left: 1px solid #ccc;
  top: 0; bottom: 0;
  position: absolute;
}

/* DEFAULT THEME */

.cm-s-default .cm-header {color: blue;}
.cm-s-default .cm-quote {color: #090;}
.cm-negative {color: #d44;}
.cm-positive {color: #292;}
.cm-header, .cm-strong {font-weight: bold;}
.cm-em {font-style: italic;}
.cm-link {text-decoration: underline;}
.cm-strikethrough {text-decoration: line-through;}

.cm-s-default .cm-keyword {color: #708;}
.cm-s-default .cm-atom {color: #219;}
.cm-s-default .cm-number {color: #164;}
.cm-s-default .cm-def {color: #00f;}
.cm-s-default .cm-variable,
.cm-s-default .cm-punctuation,
.cm-s-default .cm-property,
.cm-s-default .cm-operator {}
.cm-s-default .cm-variable-2 {color: #05a;}
.cm-s-default .cm-variable-3, .cm-s-default .cm-type {color: #085;}
.cm-s-default .cm-comment {color: #a50;}
.cm-s-default .cm-string {color: #a11;}
.cm-s-default .cm-string-2 {color: #f50;}
.cm-s-default .cm-meta {color: #555;}
.cm-s-default .cm-qualifier {color: #555;}
.cm-s-default .cm-builtin {color: #30a;}
.cm-s-default .cm-bracket {color: #997;}
.cm-s-default .cm-tag {color: #170;}
.cm-s-default .cm-attribute {color: #00c;}
.cm-s-default .cm-hr {color: #999;}
.cm-s-default .cm-link {color: #00c;}

.cm-s-default .cm-error {color: #f00;}
.cm-invalidchar {color: #f00;}

.CodeMirror-composing { border-bottom: 2px solid; }

/* Default styles for common addons */

div.CodeMirror span.CodeMirror-matchingbracket {color: #0b0;}
div.CodeMirror span.CodeMirror-nonmatchingbracket {color: #a22;}
.CodeMirror-matchingtag { background: rgba(255, 150, 0, .3); }
.CodeMirror-activeline-background {background: #e8f2ff;}

/* STOP */

/* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

.CodeMirror {
  position: relative;
  overflow: hidden;
  background: white;
}

.CodeMirror-scroll {
  overflow: scroll !important; /* Things will break if this is overridden */
  /* 30px is the magic margin used to hide the element's real scrollbars */
  /* See overflow: hidden in .CodeMirror */
  margin-bottom: -30px; margin-right: -30px;
  padding-bottom: 30px;
  height: 100%;
  outline: none; /* Prevent dragging from highlighting the element */
  position: relative;
}
.CodeMirror-sizer {
  position: relative;
  border-right: 30px solid transparent;
}

/* The fake, visible scrollbars. Used to force redraw during scrolling
   before actual scrolling happens, thus preventing shaking and
   flickering artifacts. */
.CodeMirror-vscrollbar, .CodeMirror-hscrollbar, .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
}
.CodeMirror-vscrollbar {
  right: 0; top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
}
.CodeMirror-hscrollbar {
  bottom: 0; left: 0;
  overflow-y: hidden;
  overflow-x: scroll;
}
.CodeMirror-scrollbar-filler {
  right: 0; bottom: 0;
}
.CodeMirror-gutter-filler {
  left: 0; bottom: 0;
}

.CodeMirror-gutters {
  position: absolute; left: 0; top: 0;
  min-height: 100%;
  z-index: 3;
}
.CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  margin-bottom: -30px;
}
.CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  background: none !important;
  border: none !important;
}
.CodeMirror-gutter-background {
  position: absolute;
  top: 0; bottom: 0;
  z-index: 4;
}
.CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4;
}
.CodeMirror-gutter-wrapper ::selection { background-color: transparent }
.CodeMirror-gutter-wrapper ::-moz-selection { background-color: transparent }

.CodeMirror-lines {
  cursor: text;
  min-height: 1px; /* prevents collapsing before first draw */
}
.CodeMirror pre {
  /* Reset some styles that the rest of the page might have set */
  -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
  font-variant-ligatures: contextual;
}

.non-ligature pre {
  font-variant-ligatures: none;
}

.CodeMirror-wrap pre {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
}

.CodeMirror-linebackground {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
}

.CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  padding: 0.1px; /* Force widget margins to stay inside of the container */
}

.CodeMirror-widget {}

.CodeMirror-rtl pre { direction: rtl; }

.CodeMirror-code {
  outline: none;
}

/* Force content-box sizing for the elements where we expect it */
.CodeMirror-scroll,
.CodeMirror-sizer,
.CodeMirror-gutter,
.CodeMirror-gutters,
.CodeMirror-linenumber {
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

.CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}

.CodeMirror-cursor {
  position: absolute;
  pointer-events: none;
}
.CodeMirror-measure pre { position: static; }

div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3;
}
div.CodeMirror-dragcursors {
  visibility: visible;
}

.CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible;
}

.CodeMirror-selected { background: #d9d9d9; }
.CodeMirror-focused .CodeMirror-selected { background: #d7d4f0; }
.CodeMirror-crosshair { cursor: crosshair; }
.CodeMirror-line::selection, .CodeMirror-line > span::selection, .CodeMirror-line > span > span::selection { background: #d7d4f0; }
.CodeMirror-line::-moz-selection, .CodeMirror-line > span::-moz-selection, .CodeMirror-line > span > span::-moz-selection { background: #d7d4f0; }

.cm-searching {
  background-color: #ffa;
  background-color: rgba(255, 255, 0, .4);
}

/* Used to force a border model for a node */
.cm-force-border { padding-right: .1px; }

@media print {
  /* Hide the cursor when printing */
  .CodeMirror div.CodeMirror-cursors {
    visibility: hidden;
  }
}

/* See issue #2901 */
.cm-tab-wrap-hack:after { content: ''; }

/* Help users use markselection to safely style text background */
span.CodeMirror-selectedtext { background: none; }

@font-face{
  font-family: 'JetBrains Mono';
  src: url('./JetBrainsMono-Regular.woff2') format('woff2'),
  url('./JetBrainsMono-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
</style>
