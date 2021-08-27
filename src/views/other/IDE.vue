<template>
  <a-spin :spinning="loading" class="problem_spin">
    <a-row :gutter="[8,8]" type="flex" justify="space-between">
      <a-col :span="2">
        代码
      </a-col>
      <a-col :span="2" :offset="20">
        语言选择：
        <a-select v-model="mLanguage" default-value="cpp" style="width: 120px" @change="languageChange">
          <a-select-option :key="l" v-for="l in ['c89','c98', 'c11', 'cpp11', 'cpp14', 'cpp17']">
            {{ ideAvailableLanguages[l].displayName }}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="center">
      <a-col :span="24">
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
    <a-row :gutter="[8,8]" type="flex" justify="end">
      <a-col :span="2">
        <a-space>
          <a-button @click="runCode()" type="primary">
            Submit
          </a-button>
          <a-button @click="resetCode()">
            Reset
          </a-button>
        </a-space>
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="center">
      <a-col :span="12">
        输入
        <br>
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
        输出
        <br>
        <div id="terminal"></div>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>

import { codemirror } from '@/components/codemirror'
import { API } from '@eduoj/wasm-clang/src/shared.mjs'
import { Terminal } from 'xterm'
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
    term.open(document.getElementById('terminal'))
    this.term = term
  },
  data () {
    const code = ''
    const input = ''
    const output = ''
    const language = null
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
      mLanguage: language,
      loading: false
    }
  },
  methods: {
    runCode () {
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
        }
      }
      const x = new API(options)
      x.setStdinStr(this.input)
      x.compileLinkRun(this.code)
    },
    resetCode () {
      this.code = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`
    },
    languageChange (val) {
      this.language = this.mLanguage
    }
  }
}
</script>

<style>
#ide-codemirror-code.vue-codemirror .CodeMirror {
  height: 700px;
}
#ide-codemirror-input.vue-codemirror .CodeMirror {
  height: 300px;
}
</style>
