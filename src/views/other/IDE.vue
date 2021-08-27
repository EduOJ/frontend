<template>
  <a-spin :spinning="loading" class="problem_spin">
    <a-row :gutter="[8,8]" type="flex" justify="space-between">
      <a-col :span="2">
        代码
      </a-col>
      <a-col :span="2" :offset="20">
        <a-dropdown>
          <a-menu slot="overlay" @click="handleLangSelect">
            <a-menu-item key="c">C</a-menu-item>
            <a-menu-item key="cpp">C++</a-menu-item>
          </a-menu>
          <a-button>语言选择<a-icon type="down" /></a-button>
        </a-dropdown>
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="center">
      <a-col :span="24">
        <codemirror
          v-model="code"
          id="ide-codemirror-code"
          :options="{
            lineNumbers: true,
            mode: 'text/x-c++src',
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
    const language = 'cpp'
    return {
      code: code,
      input: input,
      output: output,
      language: language,
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
    handleLangSelect (item) {
      console.log('click', item)
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
