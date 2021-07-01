<template>
  <a-card>
    <a-button type="primary" @click="createFile">
      新建文件
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
    <a-button type="primary" @click="createFolder">
      新建文件夹
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
    <a-button type="primary" @click="deleteFiles">
      删除
    </a-button>
    <a-modal
      title="删除"
      :visible="deleteDialog"
      :confirm-loading="confirmLoading"
      @ok="handleDelete"
      @cancel="handleCancel"
    >
      <p>确认删除</p> <!-- todo: validation -->
    </a-modal>
    <a-directory-tree
      @select="onNodeSelect"
      :selectedKeys="selectedKeys"
      :load-data="onLoadData"
      :replace-fields="replaceFields"
      :tree-data="treeData">
    </a-directory-tree>
    <a-card title="输入代码" class="submission_card" size="small">
      <codemirror
        v-model="code"
        :options="{
          lineNumbers: true,
          theme: 'darcula',
          mode: languageConf[language] && languageConf[language].mimeType || 'text/html',
          line: true,
          viewportMargin: Infinity
        }"/>
    </a-card>
  </a-card>
</template>

<script>
import codemirror from '@/components/codemirror/codemirror'
import languageConf from '@/config/languageConf'

export default {
  name: 'MultiFileEditor',
  components: {
    codemirror
  },
  props: {
    language: String('')
  },
  data () {
    return {
      languageConf,
      data: '',
      treeData: [],
      replaceFields: {
        title: 'name',
        key: 'path'
      },
      selectedNode: Object(),
      createFileDialog: false,
      createFolderDialog: false,
      deleteDialog: false,
      inputName: '',
      confirmLoading: false,
      selectedKeys: [],
      currentFile: '' // path
    }
  },
  methods: {
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
    onNodeSelect (keys, event) {
      // todo:目前只能处理选中一个文件/文件夹
      if (this.selectedNode === event.node) {
        this.selectedNode = Object()
        this.selectedKeys = []
      } else {
        this.selectedNode = event.node
        this.selectedKeys = []
        this.selectedKeys.push(event.node.dataRef.path)
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
        if (!this.selectedNode.dataRef) {
          this.treeData.push({
            name: this.inputName,
            path: this.createFileDialog ? this.inputName : '/' + this.inputName + '/',
            isLeaf: Boolean(this.createFileDialog),
            fa: Object(),
            children: []
          })
        } else if (!this.selectedNode.dataRef.isLeaf) {
          this.selectedNode.dataRef.children.push({
            name: this.inputName,
            path: this.selectedNode.dataRef.path + this.inputName + (this.createFolderDialog ? '/' : ''),
            isLeaf: Boolean(this.createFileDialog),
            fa: this.selectedNode,
            children: []
          })
        } else if (!this.selectedNode.dataRef.fa.dataRef) {
          this.treeData.push({
            name: this.inputName,
            path: this.createFileDialog ? this.inputName : '/' + this.inputName + '/',
            isLeaf: Boolean(this.createFileDialog),
            fa: Object(),
            children: []
          })
        } else {
          this.selectedNode.dataRef.fa.dataRef.children.push({
            name: this.inputName,
            path: this.selectedNode.dataRef.fa.dataRef.path + this.inputName + (this.createFolderDialog ? '/' : ''),
            isLeaf: Boolean(this.createFileDialog),
            fa: this.selectedNode.dataRef.fa,
            children: []
          })
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
        if (!this.selectedNode.dataRef.fa.dataRef) {
          for (let i = 0; i < this.treeData.length; i++) {
            if (this.treeData[i] === this.selectedNode.dataRef) {
              console.log('!!!')
              this.treeData.splice(i, 1)
              break
            }
          }
        } else {
          for (let i = 0; i < this.selectedNode.dataRef.fa.dataRef.children.length; i++) {
            if (this.selectedNode.dataRef.fa.dataRef.children[i] === this.selectedNode.dataRef) {
              this.selectedNode.dataRef.fa.dataRef.children.splice(i, 1)
              break
            }
          }
        }
        this.selectedNode = Object()
        this.selectedKeys = []
        this.deleteDialog = false
        this.confirmLoading = false
      }, 100)
    }
  }
}
</script>

<style scoped>

</style>
