<template>
  <a-card title="IDE" style="height: auto;">
    <a-row :gutter="[8,8]" type="flex" style="align-items: center;">
      <a-col :span="2">
        代码
      </a-col>
    </a-row>
    <a-row :gutter="[8,8]" type="flex" justify="center">
      <a-col :span="24" flex="auto">
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
    <a-row :gutter="[8,8]">
      <a-col :lg="12" :md="24">
        <div class="toolbar-row">
          <span>输入</span>
        </div>
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
      <a-col :lg="12" :md="24">
        <div class="toolbar-row">
          <span>输出</span>
          <div class="space"></div>
          <a-button @click="runCode()" type="primary" :loading="running">
            运行
          </a-button>
        </div>
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
// const dbName = 'wasm-cache'
// const storeName = 'wasm-cache'
// const dbVersion = '1'
// function openDatabase () {
//   return new Promise((resolve, reject) => {
//     var request = indexedDB.open(dbName, dbVersion)
//     request.onerror = reject.bind(null, 'Error opening wasm cache database')
//     request.onsuccess = () => {
//       resolve(request.result)
//     }
//     request.onupgradeneeded = event => {
//       var db = request.result
//       if (db.objectStoreNames.contains(storeName)) {
//         console.log(`Clearing out version ${event.oldVersion} wasm cache`)
//         db.deleteObjectStore(storeName)
//       }
//       console.log(`Creating version ${event.newVersion} wasm cache`)
//       db.createObjectStore(storeName)
//     }
//   })
// }
//
// function lookupInDatabase (db, url) {
//   return new Promise((resolve, reject) => {
//     var store = db.transaction([storeName]).objectStore(storeName)
//     var request = store.get(url)
//     request.onerror = reject.bind(null, `Error getting wasm module ${url}`)
//     request.onsuccess = event => {
//       if (request.result) {
//         resolve(request.result)
//       } else {
//         // eslint-disable-next-line prefer-promise-reject-errors
//         reject(`Module ${url} was not found in wasm cache`)
//       }
//     }
//   })
// }
//
// function storeInDatabase (db, module, url) {
//   var store = db.transaction([storeName], 'readwrite').objectStore(storeName)
//   var request = store.put(module, url)
//   request.onerror = err => {
//     console.log(`Failed to store in wasm cache: ${err}`)
//   }
//   request.onsuccess = resp => {
//     console.log(`Successfully stored ${url} in wasm cache`)
//   }
// }

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
    window.addEventListener('resize', (e) => {
      fitAddon.fit()
    })
    this.term = term
  },
  data () {
    const code = localStorage.getItem(`ide:code`) || ''
    const input = ''
    const output = ''
    return {
      code: code,
      input: input,
      output: output,
      running: false,
      compiled: {}
    }
  },
  methods: {
    runCode () {
      const compiled = this.compiled
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
          if (!compiled.hasOwnProperty(filename)) {
            const response = await fetch(filename)
            compiled[filename] = WebAssembly.compile(await response.arrayBuffer())
          }
          return compiled[filename]
        },
        cdnUrl: '/assets/bin/',
        hostWrite (s) {
          vm.term.write(s)
        }
      }
      const x = new API(options)
      localStorage.setItem(`ide:code`, vm.code)
      x.setStdinStr(this.input)
      x.compileLinkRun(this.code, {}).then(_ => {
        this.running = false
      }).catch(err => {
        if (err.code !== 1) {
          this.$error({
            title: '运行程序时发生了错误',
            content: err.message
          })
        }
        this.running = false
      })
    }
  }
}
</script>

<style>
#ide-codemirror-code.vue-codemirror .CodeMirror {
  height: 100%;
}

#ide-codemirror-input.vue-codemirror .CodeMirror {
  height: 200px;
}
</style>
<style lang='sass' scoped>
.toolbar-row
  display: flex
  width: 100%
  height: 40px
  align-items: center
  :not(:last-child)
    margin-right: 5px
  .space
    flex: 1
</style>
