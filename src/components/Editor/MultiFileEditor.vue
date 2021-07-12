<template>
  <div>
    <a-space>
      <a-button type="primary" @click="createFile" size="small">
        <a-icon type="file-add" />
      </a-button>
      <a-modal
        title="新建文件"
        :visible="createFileDialog"
        :confirm-loading="confirmLoading"
        @ok="handleCreate"
        @cancel="handleCancel"
      >
        <a-input placeholder="请输入文件名称" v-model="inputName"/> <!-- todo: validation -->
      </a-modal>
      <a-button type="primary" @click="createFolder" size="small">
        <a-icon type="folder-add" />
      </a-button>
      <a-modal
        title="新建文件夹"
        :visible="createFolderDialog"
        :confirm-loading="confirmLoading"
        @ok="handleCreate"
        @cancel="handleCancel"
      >
        <a-input placeholder="请输入文件夹名称" v-model="inputName"/> <!-- todo: validation -->
      </a-modal>
      <a-button type="danger" @click="deleteFiles" size="small">
        <a-icon type="delete" />
      </a-button>
      <a-modal
        title="删除"
        :visible="deleteDialog"
        :confirm-loading="confirmLoading"
        @ok="handleDelete"
        @cancel="handleCancel"
      >
        <p>确认删除</p>
      </a-modal>
      <a-button @click="downloadFile" size="small">
        <a-icon type="download" />
      </a-button>
    </a-space>
    <a-directory-tree
      @select="onNodeSelect"
      :selectedKeys="selectedKeys"
      :replace-fields="replaceFields"
      :tree-data="treeData">
    </a-directory-tree>
    <a-card :title="title" class="submission_card" size="small">
      <codemirror
        v-model="code"
        :options="{
          lineNumbers: true,
          theme: 'darcula',
          mode: languageConf[language] && languageConf[language].mimeType || 'text/html',
          line: true,
          viewportMargin: Infinity,
          extraKeys: extraKeys
        }"/>
    </a-card>
  </div>
</template>

<script>
import codemirror from '@/components/codemirror/codemirror'
import languageConf from '@/config/languageConf'
import JSZip from 'jszip'
import { Base64 } from 'js-base64'

export default {
  name: 'MultiFileEditor',
  components: {
    codemirror
  },
  props: {
    language: String(),
    zipURL: String()
  },
  data () {
    return {
      languageConf,
      extraKeys: {
        'Ctrl-S': (v) => {
          this.saveCurrentFile()
          this.$message.success('已保存', 1)
        }
      },
      code: '',
      data: '',
      treeData: [],
      replaceFields: {
        title: 'name',
        key: 'path'
      },
      title: '输入代码',
      selectedNode: Object(),
      createFileDialog: false,
      createFolderDialog: false,
      deleteDialog: false,
      inputName: '',
      confirmLoading: false,
      selectedKeys: [],
      currentFile: Object(), // path,
      zip: new JSZip()
    }
  },
  mounted () {
    if (this.zipURL) {
      const decodedURL = Base64.decode(this.zipURL)
      console.log(decodedURL)
      fetch(decodedURL).then(async r => {
        JSZip.loadAsync(await r.blob()).then((zipContent) => {
          this.zip = zipContent
          this.buildTreeFromZip()
        })
      })
    }
  },
  methods: {
    buildTreeFromZip () {
      this.treeData = []
      let dirKeys = Object.keys(this.zip.files)
      dirKeys = dirKeys.sort((a, b) => (a.charAt(a.length - 1) === '/' ? a.split('/').length - 1 : a.split('/').length) -
        (b.charAt(b.length - 1) === '/' ? b.split('/').length - 1 : b.split('/').length))
      console.log(dirKeys)
      for (const idx in dirKeys) {
        console.log(dirKeys[idx])
        const pathArray = dirKeys[idx].split('/')
        if (dirKeys[idx].charAt(dirKeys[idx].length - 1) === '/') {
          pathArray.pop()
        }
        console.log(pathArray)
        let preNode = this.treeData
        const len = pathArray.length - 1
        for (let i = 0; i < len; i++) {
          if (i > 0) {
            for (const nodeIdx in preNode.children) {
              if (preNode.children[nodeIdx].name === pathArray[i]) {
                preNode = preNode.children[nodeIdx]
                break
              }
            }
          } else {
            for (const nodeIdx in preNode) {
              if (preNode[nodeIdx].name === pathArray[i]) {
                preNode = preNode[nodeIdx]
                break
              }
            }
          }
        }
        // preNode exists && is Folder
        let fa
        if (Object.prototype.toString.call(preNode) !== '[object Array]') {
          fa = preNode
          console.log(fa)
          preNode = preNode.children
          console.log(fa)
        } else {
          fa = Object()
        }
        if (this.zip.files[dirKeys[idx]].dir) {
          preNode.push({
            name: pathArray[pathArray.length - 1],
            path: dirKeys[idx],
            isLeaf: false,
            fa: fa,
            children: []
          })
        } else {
          preNode.push({
            name: pathArray[pathArray.length - 1],
            path: dirKeys[idx],
            isLeaf: true,
            fa: fa
          })
        }
      }
    },
    createFile () {
      this.createFileDialog = true
    },
    createFolder () {
      this.createFolderDialog = true
    },
    deleteFiles () {
      if (this.selectedNode.dataRef) {
        this.deleteDialog = true
      }
    },
    saveCurrentFile () {
      if (this.currentFile.path) {
        this.zip.file(this.currentFile.path, this.code)
      }
    },
    onNodeSelect (keys, event) {
      // todo:目前只能处理选中一个文件/文件夹
      if (this.selectedNode === event.node) {
        this.selectedNode = Object()
        this.selectedKeys = []
      } else {
        this.selectedNode = event.node
        this.selectedKeys = []
        this.selectedKeys.push(event.node.dataRef.path)
        if (event.node.dataRef.isLeaf) {
          this.saveCurrentFile()
          this.zip.file(event.node.dataRef.path).async('string').then((data) => {
            this.code = data
          })
          this.currentFile = event.node.dataRef
          this.title = this.currentFile.path
        }
      }
    },
    handleCancel () {
      this.createFileDialog = false
      this.createFolderDialog = false
      this.deleteDialog = false
    },
    handleCreate () {
      this.confirmLoading = true
      setTimeout(() => {
        let filePath
        if (this.createFileDialog) {
          // add to tree
          if (!this.selectedNode.dataRef) {
            filePath = this.inputName
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: Object()
            })
          } else if (!this.selectedNode.dataRef.isLeaf) {
            filePath = this.selectedNode.dataRef.path + this.inputName
            this.selectedNode.dataRef.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: this.selectedNode.dataRef
            })
          } else if (!this.selectedNode.dataRef.fa.dataRef) {
            filePath = this.inputName
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: Object()
            })
          } else {
            filePath = this.selectedNode.dataRef.fa.dataRef.path + this.inputName
            this.selectedNode.dataRef.fa.dataRef.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: this.selectedNode.dataRef.fa
            })
          }
          // add file to zip
          this.zip.file(filePath, '')
        } else {
          // add to tree
          if (!this.selectedNode.dataRef) {
            filePath = this.inputName + '/'
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: Object(),
              children: []
            })
          } else if (!this.selectedNode.dataRef.isLeaf) {
            filePath = this.selectedNode.dataRef.path + this.inputName + '/'
            this.selectedNode.dataRef.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: this.selectedNode.dataRef,
              children: []
            })
          } else if (!this.selectedNode.dataRef.fa.dataRef) {
            filePath = this.inputName + '/'
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: Object(),
              children: []
            })
          } else {
            filePath = this.selectedNode.dataRef.fa.dataRef.path + this.inputName + '/'
            this.selectedNode.dataRef.fa.dataRef.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: this.selectedNode.dataRef.fa,
              children: []
            })
          }
          // add folder to zip
          this.zip.folder(filePath)
        }
        this.inputName = ''
        this.createFileDialog = false
        this.createFolderDialog = false
        this.confirmLoading = false
      }, 100)
    },
    handleDelete () {
      this.confirmLoading = true
      setTimeout(() => {
        if (this.selectedNode.dataRef.isLeaf) {
          this.code = ''
          this.currentFile = Object()
          this.title = '输入代码'
        } else if (this.currentFile.name) {
          let tempNode = this.currentFile.fa
          while (tempNode.name) {
            if (tempNode.name === this.selectedNode.name) {
              this.code = ''
              this.currentFile = Object()
              this.title = '输入代码'
              break
            }
            tempNode = tempNode.fa
          }
        }
        if (!this.selectedNode.dataRef.fa.name) {
          for (let i = 0; i < this.treeData.length; i++) {
            if (this.treeData[i] === this.selectedNode.dataRef) {
              this.zip.remove(this.treeData[i].path)
              this.treeData.splice(i, 1)
              break
            }
          }
        } else {
          for (let i = 0; i < this.selectedNode.dataRef.fa.children.length; i++) {
            if (this.selectedNode.dataRef.fa.children[i] === this.selectedNode.dataRef) {
              this.zip.remove(this.selectedNode.dataRef.path)
              this.selectedNode.dataRef.fa.children.splice(i, 1)
              break
            }
          }
        }
        this.selectedNode = Object()
        this.selectedKeys = []
        this.deleteDialog = false
        this.confirmLoading = false
      }, 100)
    },
    downloadFile () {
      this.zip.generateAsync({ type: 'blob' }).then((content) => {
        const downloadA = document.createElement('a')
        downloadA.href = window.URL.createObjectURL(content)
        downloadA.download = 'src'
        downloadA.click()
        window.URL.revokeObjectURL(downloadA.href)
      })
    }
  }
}
</script>

<style scoped>

</style>
