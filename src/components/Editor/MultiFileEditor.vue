<template>
  <a-row :gutter="24">
    <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
      <vue-custom-scrollbar>
        <a-space v-if="isEditor">
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
            <a-input placeholder="请输入文件名称" v-model="inputName" /> <!-- todo: validation -->
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
            <a-input placeholder="请输入文件夹名称" v-model="inputName" /> <!-- todo: validation -->
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
          <a-upload
            name="file"
            :multiple="false"
            accept=".zip"
            :fileList="fileList"
            @change="handleUploadChange"
          >
            <a-button size="small">
              <a-icon type="upload" />
            </a-button>
          </a-upload>
        </a-space>
        <a-directory-tree
          @select="onNodeSelect"
          :selectedKeys="selectedKeys"
          :replace-fields="replaceFields"
          :tree-data="treeData">
        </a-directory-tree>
      </vue-custom-scrollbar>
    </a-col>
    <a-col :xl="16" :lg="24" :md="24" :sm="24" :xs="24">
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
          }" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import codemirror from '@/components/codemirror/codemirror'
import languageConf from '@/config/languageConf'
import vueCustomScrollbar from 'vue-custom-scrollbar'
import 'vue-custom-scrollbar/dist/vueScrollbar.css'
import JSZip from 'jszip'
import { Base64 } from 'js-base64'

export default {
  name: 'MultiFileEditor',
  components: {
    codemirror,
    vueCustomScrollbar
  },
  props: {
    language: String(),
    zipURL: String(),
    isEditor: Boolean(),
    zipBlob: Blob
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
      title: '请选择文件',
      selectedNode: Object(),
      createFileDialog: false,
      createFolderDialog: false,
      deleteDialog: false,
      inputName: '',
      confirmLoading: false,
      selectedKeys: [],
      currentFile: Object(), // path,
      zip: new JSZip(),
      fileList: [],
      reBuildTree: false
    }
  },
  mounted () {
    if (this.isEditor) {
      if (this.zipURL) {
        this.reBuildTree = true
        const decodedURL = Base64.decode(this.zipURL)
        // console.log(decodedURL)
        fetch(decodedURL).then(async r => {
          JSZip.loadAsync(await r.blob()).then((zipContent) => {
            this.zip = zipContent
            this.buildTreeFromZip()
          })
        })
      }
    } else if (!this.isEditor) {
      this.reBuildTree = true
      JSZip.loadAsync(this.zipBlob).then((zipContent) => {
        this.zip = zipContent
        this.buildTreeFromZip()
      })
    }
  },
  methods: {
    handleZipChanged () {
      if (this.isEditor && this.reBuildTree) {
        console.log('editor!!!')
        const decodedURL = Base64.decode(this.zipURL)
        // console.log(decodedURL)
        fetch(decodedURL).then(async r => {
          JSZip.loadAsync(await r.blob()).then((zipContent) => {
            this.zip = zipContent
            this.buildTreeFromZip()
          })
        })
      } else if (this.reBuildTree) {
        console.log(this.zipBlob)
        console.log('not editor')
        JSZip.loadAsync(this.zipBlob).then((zipContent) => {
          this.zip = zipContent
          this.buildTreeFromZip()
        })
      }
    },
    handleUploadChange (info) {
      JSZip.loadAsync(info.file.originFileObj).then((zipContent) => {
        this.zip = zipContent
        this.buildTreeFromZip()
      })
    },
    buildTreeFromZip () {
      this.treeData = []
      const reg = new RegExp('[\\/]')
      let dirKeys = Object.keys(this.zip.files)
      dirKeys = dirKeys.sort((a, b) => (a.charAt(a.length - 1) === '/' || a.charAt(a.length - 1) === '\\' ? a.split(reg).length - 1 : a.split(reg).length) -
        (b.charAt(b.length - 1) === '/' || a.charAt(a.length - 1) === '\\' ? b.split(reg).length - 1 : b.split(reg).length))
      for (const idx in dirKeys) {
        const pathArray = dirKeys[idx].split(reg)
        if (dirKeys[idx].charAt(dirKeys[idx].length - 1) === '/' || dirKeys[idx].charAt(dirKeys[idx].length - 1) === '\\') {
          pathArray.pop()
        }
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
          preNode = preNode.children
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

      // 如果文件树为空，自动创建空文件
      if (this.treeData.length === 0) {
        this.treeData.push({
          name: languageConf[this.language].defaultFileName,
          path: languageConf[this.language].defaultFileName,
          isLeaf: true,
          fa: Object()
        })
        this.zip.file(languageConf[this.language].defaultFileName, '')
        this.currentFile = this.treeData[0]
        this.title = this.currentFile.path
        this.selectedNode = this.treeData[0]
        this.selectedKeys = []
        this.selectedKeys.push(this.treeData[0].path)
      }
    },
    createFile () {
      this.createFileDialog = true
    },
    createFolder () {
      this.createFolderDialog = true
    },
    deleteFiles () {
      if (this.selectedNode) {
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
      if (this.selectedNode === event.node.dataRef) {
        // 重复点击
        this.selectedNode = Object()
        this.selectedKeys = []
      } else {
        this.selectedNode = event.node.dataRef
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
          if (!this.selectedNode.name) {
            filePath = this.inputName
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: Object()
            })
          } else if (!this.selectedNode.isLeaf) {
            filePath = this.selectedNode.path + this.inputName
            this.selectedNode.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: this.selectedNode
            })
          } else if (!this.selectedNode.fa.name) {
            filePath = this.inputName
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: Object()
            })
          } else {
            filePath = this.selectedNode.fa.path + this.inputName
            this.selectedNode.fa.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: true,
              fa: this.selectedNode.fa
            })
          }
          // add file to zip
          this.zip.file(filePath, '')
        } else {
          // add to tree
          if (!this.selectedNode.name) {
            filePath = this.inputName + '/'
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: Object(),
              children: []
            })
          } else if (!this.selectedNode.isLeaf) {
            filePath = this.selectedNode.path + this.inputName + '/'
            this.selectedNode.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: this.selectedNode,
              children: []
            })
          } else if (!this.selectedNode.fa.name) {
            filePath = this.inputName + '/'
            this.treeData.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: Object(),
              children: []
            })
          } else {
            filePath = this.selectedNode.fa.path + this.inputName + '/'
            this.selectedNode.fa.children.push({
              name: this.inputName,
              path: filePath,
              isLeaf: false,
              fa: this.selectedNode.fa,
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
        if (this.selectedNode.isLeaf) {
          this.code = ''
          this.currentFile = Object()
          this.title = '请选择文件'
        } else if (this.currentFile.name) {
          let tempNode = this.currentFile.fa
          while (tempNode.name) {
            if (tempNode === this.selectedNode) {
              this.code = ''
              this.currentFile = Object()
              this.title = '请选择文件'
              break
            }
            tempNode = tempNode.fa
          }
        }
        if (!this.selectedNode.fa || !this.selectedNode.fa.children) {
          for (let i = 0; i < this.treeData.length; i++) {
            if (this.treeData[i] === this.selectedNode) {
              this.zip.remove(this.treeData[i].path)
              this.treeData.splice(i, 1)
              break
            }
          }
        } else {
          for (let i = 0; i < this.selectedNode.fa.children.length; i++) {
            if (this.selectedNode.fa.children[i] === this.selectedNode) {
              this.zip.remove(this.selectedNode.path)
              this.selectedNode.fa.children.splice(i, 1)
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
