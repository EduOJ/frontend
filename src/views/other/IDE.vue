<template>
  <a-card :title="IDE" style="height: auto; margin-bottom: 0px">
    <a-row :gutter="[8,8]" type="flex" justify="space-between">
      <a-col :span="2">
        代码
      </a-col>
      <a-col :span="4" :offset="18">
        <div style="float: right;">
          语言选择：
          <a-select v-model="language" default-value="cpp" style="width: 120px" @change="languageChange">
            <a-select-option :key="l" v-for="l in ['c89','c98', 'c11', 'cpp11', 'cpp14', 'cpp17']">
              {{ ideAvailableLanguages[l].displayName }}
            </a-select-option>
          </a-select>
        </div>
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="center">
      <a-col :span="24" flex="auto">
        <codemirror
          v-model="code"
          id="ide-codemirror-code"
          :options="{
            lineNumbers: true,
            mode: ideAvailableLanguages[language] && ideAvailableLanguages[language].mimeType || 'text/html',
            theme: 'darcula',
            line: true
          }" />
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="space-between" align="bottom">
      <a-col :span="2">
        输入
      </a-col>
      <a-col :span="2" :offset="8">
        输出
      </a-col>
      <a-col :span="2" :offset="6">
        <a-button @click="runCode()" type="primary" style="float: right;" block>
          运行
        </a-button>
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="center">
      <a-col :span="12">
        <codemirror
          id="ide-codemirror-input"
          v-model="input"
          :options="{
            lineNumbers: true,
            mode: 'text/plain',
            theme: 'darcula',
            line: true,
          }" />
      </a-col>
      <a-col :span="12">
        <a-spin :spinning="running">
          <div id="terminal" style="max-height: 200px"></div>
        </a-spin>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>

import { codemirror } from '@/components/codemirror'
import { API } from '@eduoj/wasm-clang/src/shared.mjs'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

export default {
  name: 'IDE',
  components: {
    codemirror
  },
  mounted () {
    const term = new Terminal({
      fontSize: 16,
      cursorBlink: true,
      screenKeys: true,
      convertEol: true,
      disableStdin: true
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(document.getElementById('terminal'))
    fitAddon.fit()
    this.term = term
  },
  data () {
    let language = localStorage.getItem(`ide:language`)
    let code = ''
    if (language) {
      if (localStorage.getItem(`ide:code`)) {
        code = localStorage.getItem(`ide:code`)
        localStorage.removeItem(`ide:code`)
        localStorage.setItem(`ide:code:${language}`, code)
      } else {
        code = localStorage.getItem(`ide:code:${language}`) || ''
      }
    } else {
      language = null
      code = ''
    }
    const input = ''
    const output = ''
    const ideAvailableLanguages = {
        c89: {
          displayName: 'C 89',
          mimeType: 'text/x-csrc'
        },
        c98: {
          displayName: 'C 98',
          mimeType: 'text/x-csrc'
        },
        c11: {
          displayName: 'C 11',
          mimeType: 'text/x-csrc'
        },
        cpp11: {
          displayName: 'C++ 11',
          mimeType: 'text/x-c++src'
        },
        cpp14: {
          displayName: 'C++ 14',
          mimeType: 'text/x-c++src'
        },
        cpp17: {
          displayName: 'C++ 17',
          mimeType: 'text/x-c++src'
        }
    }
    return {
      ideAvailableLanguages,
      code: code,
      input: input,
      output: output,
      language: language,
      running: false
    }
  },
  methods: {
    runCode () {
      this.running = true
      this.output = ''
      this.term.reset()
      const vm = this
      const options = {
        async readBuffer (filename) {
          const response = await fetch(filename)
          return response.arrayBuffer()
        },

        async compileStreaming (filename) {
            const response = await fetch(filename)
            return WebAssembly.compile(await response.arrayBuffer())
        },
        hostWrite (s) {
          vm.term.write(s)
          vm.running = false
        }
      }
      const x = new API(options)
      localStorage.setItem(`ide:code:${vm.language}`, vm.code)
      x.setStdinStr(this.input)
      x.compileLinkRun(this.code)
    },
    languageChange () {
      localStorage.setItem(`ide:code:${this.language}`, this.code)
      localStorage.setItem(`ide:language`, this.language)
    }
  }
}
</script>

<style>
#ide-codemirror-code.vue-codemirror .CodeMirror {
  height: 100%;
  flex-grow: 1;
}
#ide-codemirror-input.vue-codemirror .CodeMirror {
  height: 200px;
}
a-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
