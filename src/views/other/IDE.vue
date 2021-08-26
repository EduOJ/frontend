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
          :options="{
            lineNumbers: true,
            mode: 'c',
            line: true,
            viewportMargin: Infinity
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
          v-model="input"
          :options="{
            lineNumbers: true,
            mode: 'text/plain',
            line: true,
            viewportMargin: Infinity
          }" />
      </a-col>
      <a-col :span="12">
        输出
        <br>
        <codemirror
          v-model="output"
          :options="{
            lineNumbers: true,
            mode: 'text/plain',
            line: true,
            viewportMargin: Infinity
          }" />
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>

import codemirror from '@/components/codemirror/codemirror'
import { API } from '@eduoj/wasm-clang/src/shared.mjs'
import fetch from 'node-fetch'

export default {
  name: 'IDE',
  components: {
    codemirror
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
          vm.output += s.toString()
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

<style scoped>

</style>
