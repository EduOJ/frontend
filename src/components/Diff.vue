<template>

  <a-spin :spinning="loading">
    <div v-html="prettyHtml"></div>
  </a-spin>
</template>

<script>
import * as Diff2Html from 'diff2html'
import request from '@/utils/request'

export default {
  name: 'Diff',
  props: {
    text: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  data () {
    if (this.text !== '') {
      return {
        loading: false,
        content: this.text
      }
    }
    return {
      loading: true,
      content: ''
    }
  },
  methods: {
    load () {
      request({
        url: this.url,
        method: 'get'
      }).then(resp => {
        this.loading = false
        if (resp === '') {
          this.content = ''
          return
        }
        const content = resp.split('\n')
        const header = content.slice(0, 3).join('\n')
        let inner = content.slice(3).join('\n')
        for (let i = 0; i < 0x20; i += 1) {
          inner = inner.replaceAll(String.fromCharCode(i), String.fromCharCode(i + 0x2400) + String.fromCharCode(i))
        }
        console.log(header + '\n' + inner)
        this.content = header + '\n' + inner
      }).catch(err => {
        console.log(err)
        this.content = '发生了错误'
        this.loading = false
      })
    }
  },
  mounted () {
    if (this.url !== '') {
      this.load()
    }
  },
  computed: {
    prettyHtml () {
      if (this.content === '') {
        return '程序输出与标准答案完全一致或程序执行失败'
      }
      if (!this.content) {
        return ''
      }
      if (this.content.startsWith('### ')) {
        return this.content.replace('### ', '')
      }
      return Diff2Html.html(Diff2Html.parse(this.content), {
        matching: 'none',
        outputFormat: 'side-by-side'
      })
    }
  }
}
</script>

<style>
.d2h-d-none{display:none}.d2h-wrapper{text-align:left}.d2h-file-header{height:35px;padding:5px 10px;border-bottom:1px solid #d8d8d8;background-color:#f7f7f7;font-family:Source Sans Pro,Helvetica Neue,Helvetica,Arial,sans-serif}.d2h-file-header,.d2h-file-stats{display:-webkit-box;display:-ms-flexbox;display:flex}.d2h-file-stats{margin-left:auto;font-size:14px}.d2h-lines-added{text-align:right;border:1px solid #b4e2b4;border-radius:5px 0 0 5px;color:#399839;padding:2px;vertical-align:middle}.d2h-lines-deleted{text-align:left;border:1px solid #e9aeae;border-radius:0 5px 5px 0;color:#c33;padding:2px;vertical-align:middle;margin-left:1px}.d2h-file-name-wrapper{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;width:100%;font-size:15px}.d2h-file-name{white-space:nowrap;text-overflow:ellipsis;overflow-x:hidden}.d2h-file-wrapper{margin-bottom:1em}.d2h-file-collapse,.d2h-file-wrapper{border:1px solid #ddd;border-radius:3px}.d2h-file-collapse{-webkit-box-pack:end;-ms-flex-pack:end;justify-content:flex-end;display:-webkit-box;display:-ms-flexbox;display:flex;cursor:pointer;font-size:12px;-webkit-box-align:center;-ms-flex-align:center;align-items:center;padding:4px 8px}.d2h-file-collapse.d2h-selected{background-color:#c8e1ff}.d2h-file-collapse-input{margin:0 4px 0 0}.d2h-diff-table{width:100%;border-collapse:collapse;font-family:Menlo,Consolas,monospace;font-size:13px}.d2h-files-diff{display:block;width:100%;height:100%}.d2h-file-diff{overflow-y:hidden}.d2h-file-side-diff{display:inline-block;overflow-x:scroll;overflow-y:hidden;width:50%;margin-right:-4px;margin-bottom:-8px}.d2h-code-line{padding:0 8em}.d2h-code-line,.d2h-code-side-line{display:inline-block;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;width:100%}.d2h-code-side-line{padding:0 4.5em}.d2h-code-line-ctn{display:inline-block;background:none;padding:0;word-wrap:normal;white-space:pre;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;width:100%;vertical-align:middle}.d2h-code-line del,.d2h-code-side-line del{background-color:#ffb6ba}.d2h-code-line del,.d2h-code-line ins,.d2h-code-side-line del,.d2h-code-side-line ins{display:inline-block;margin-top:-1px;text-decoration:none;border-radius:.2em;vertical-align:middle}.d2h-code-line ins,.d2h-code-side-line ins{background-color:#97f295;text-align:left}.d2h-code-line-prefix{display:inline;background:none;padding:0;word-wrap:normal;white-space:pre}.line-num1{float:left}.line-num1,.line-num2{-webkit-box-sizing:border-box;box-sizing:border-box;width:3.5em;overflow:hidden;text-overflow:ellipsis;padding:0 .5em}.line-num2{float:right}.d2h-code-linenumber{-webkit-box-sizing:border-box;box-sizing:border-box;width:7.5em;position:absolute;display:inline-block;background-color:#fff;color:rgba(0,0,0,.3);text-align:right;border:solid #eee;border-width:0 1px;cursor:pointer}.d2h-code-linenumber:after{content:"\200b"}.d2h-code-side-linenumber{position:absolute;display:inline-block;-webkit-box-sizing:border-box;box-sizing:border-box;width:4em;background-color:#fff;color:rgba(0,0,0,.3);text-align:right;border:solid #eee;border-width:0 1px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;padding:0 .5em}.d2h-code-side-linenumber:after{content:"\200b"}.d2h-code-side-emptyplaceholder,.d2h-emptyplaceholder{background-color:#f1f1f1;border-color:#e1e1e1}.d2h-code-line-prefix,.d2h-code-linenumber,.d2h-code-side-linenumber,.d2h-emptyplaceholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.d2h-code-linenumber,.d2h-code-side-linenumber{direction:rtl}.d2h-del{background-color:#fee8e9;border-color:#e9aeae}.d2h-ins{background-color:#dfd;border-color:#b4e2b4}.d2h-info{background-color:#f8fafd;color:rgba(0,0,0,.3);border-color:#d5e4f2}.d2h-file-diff .d2h-del.d2h-change{background-color:#fdf2d0}.d2h-file-diff .d2h-ins.d2h-change{background-color:#ded}.d2h-file-list-wrapper{margin-bottom:10px}.d2h-file-list-wrapper a{text-decoration:none;color:#3572b0}.d2h-file-list-wrapper a:visited{color:#3572b0}.d2h-file-list-header{text-align:left}.d2h-file-list-title{font-weight:700}.d2h-file-list-line{display:-webkit-box;display:-ms-flexbox;display:flex;text-align:left}.d2h-file-list{display:block;list-style:none;padding:0;margin:0}.d2h-file-list>li{border-bottom:1px solid #ddd;padding:5px 10px;margin:0}.d2h-file-list>li:last-child{border-bottom:none}.d2h-file-switch{display:none;font-size:10px;cursor:pointer}.d2h-icon{vertical-align:middle;margin-right:10px;fill:currentColor}.d2h-deleted{color:#c33}.d2h-added{color:#399839}.d2h-changed{color:#d0b44c}.d2h-moved{color:#3572b0}.d2h-tag{display:-webkit-box;display:-ms-flexbox;display:flex;font-size:10px;margin-left:5px;padding:0 2px;background-color:#fff}.d2h-deleted-tag{border:1px solid #c33}.d2h-added-tag{border:1px solid #399839}.d2h-changed-tag{border:1px solid #d0b44c}.d2h-moved-tag{border:1px solid #3572b0}
</style>
