<template>
  <a-spin :spinning="loading" class="problem_spin">
    <a-row :gutter="[16,16]" style="height: 100%">
      <a-col :xl="{span:14, offset:5}" :lg="{span:16}">
        <a-card :title="problem.name" style="height: 100%">
          <a-space direction="vertical">
            <a-space>
              <p>
                语言选择：
                <a-select v-model="mLanguage" default-value="cpp" style="width: 120px" @change="languageChange">
                  <a-select-option :key="l" v-for="l in problem.language_allowed">
                    {{ languageConf[l].displayName }}
                  </a-select-option>
                </a-select>
              </p>
              <p>
                上传文件
                <a-upload
                  accept="application/x-zip-compressed"
                  :multiple="false"
                  :file-list="fileList"
                  :customRequest="uploadZipFile">
                  <a-button> <a-icon type="upload" /> Upload </a-button>
                </a-upload>
              </p>
            </a-space>
            <a-directory-tree
              @select="onNodeSelect"
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
            <a-space>
              <a-button type="primary" @click="submit()" :loading="submitLoading">
                提交
              </a-button>
              <a-button type="secondary" @click="$router.go(-1)">
                返回
              </a-button>
            </a-space>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
import { getProblem, createSubmission } from '@/api/problem'
import Markdown from '@/components/Editor/Markdown'
import RunStatus from '@/components/RunStatus'
import TestCase from '@/components/TestCase'
import config from '@/config/config'
import codemirror from '@/components/codemirror/codemirror'
import languageConf from '@/config/languageConf'
import JSZip from 'jszip'
import { Base64 } from 'js-base64'
// import fs from 'fs'

export default {
  name: 'Problem',
  components: {
    Markdown,
    TestCase,
    RunStatus,
    codemirror
  },
  data () {
    let language = localStorage.getItem(`problem:${this.$route.params.id}:language`)
    let code = ''
    if (language) {
      if (localStorage.getItem(`problem:${this.$route.params.id}:code`)) {
        code = localStorage.getItem(`problem:${this.$route.params.id}:code`)
        localStorage.removeItem(`problem:${this.$route.params.id}:code`)
        localStorage.setItem(`problem:${this.$route.params.id}:code:${language}`, code)
      } else {
        code = localStorage.getItem(`problem:${this.$route.params.id}:code:${language}`) || ''
      }
    } else {
      language = null
      code = ''
    }
    return {
      languageConf,
      config: config,
      id: this.$route.params.id,
      loading: true,
      submitLoading: false,
      problem: {
        id: this.$route.params.id,
        name: '',
        description: '',
        language_allowed: [],
        time_limit: 0,
        memory_limit: 0,
        privacy: true,
        public: true,
        build_arg: '',
        compare_script_name: '',
        attachment_file_name: '',
        test_cases: []
      },
      code: code,
      language: language,
      mLanguage: language,
      fileList: [],
      treeData: [],
      replaceFields: {
        children: 'child',
        title: 'label',
        key: 'path'
      },
      newZipFiles: {},
      currentFile: '',
      codeInStorage: ''
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    submit () {
      if (this.language === 'java') {
        const match = this.code.match(/public[ \t]*class[ \t]*(.*)\n/)
        if (match.length <= 1 || match[1] !== 'Main') {
          this.$confirm({
            content: '请确认 Java 语言主类名是否是 Main ！',
            okText: '确认',
            onOk: this.doSubmit
          })
        } else {
          this.doSubmit()
        }
      } else {
        this.doSubmit()
      }
    },
    languageChange (val) {
      const fileReader = new FileReader()
      var zipCode
      // const that = this
      this.newZipFiles.generateAsync({ type: 'blob' }).then((content) => {
        fileReader.onload = (evt) => {
          zipCode = evt.target.result
          zipCode = Base64.encode(zipCode)
          console.log(zipCode)
          // console.log(Base64.decode(zipCode))
          localStorage.setItem(`problem:${this.$route.params.id}:code:${this.language}`, zipCode)
          this.language = this.mLanguage
          localStorage.setItem(`problem:${this.$route.params.id}:language`, this.language)
          this.code = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`)
          this.code = Base64.decode(this.code)
          console.log(this.code)
        }
        fileReader.readAsDataURL(content)
      })
    },
    doSubmit () {
      this.submitLoading = true
      localStorage.setItem(`problem:${this.$route.params.id}:code:${this.language}`, this.code)
      localStorage.setItem(`problem:${this.$route.params.id}:language`, this.language)
      var c = new Blob([this.code])
      createSubmission({
        problem_id: this.problem.id,
        language: this.language,
        code: c
      }).then(data => {
        let oked = 0
        this.submitLoading = false
        const modal = this.$success({
          content: '提交成功！',
          okText: '立即查看（2s）',
          onOk: () => {
            oked = 1
            this.$router.push({
              name: 'submission',
              params: {
                id: data.submission.id
              }
            })
          }
        })

        const f = (time) => {
          return () => {
            if (oked) {
              return
            }
            if (time === 0) {
              modal.destroy()
              this.$router.push({
                name: 'submission',
                params: {
                  id: data.submission.id
                }
              })
            } else {
              modal.update({
                okText: `立即查看（${time}s）`
              })
              setTimeout(f(time - 1), 1000)
            }
          }
        }
        setTimeout(f(1), 1000)
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        this.submitLoading = false
        console.error(err)
      })
    },
    fetch () {
      this.loading = true
      getProblem(this.id).then(data => {
        this.loading = false
        data.problem.test_cases.sort((a, b) => {
          if (a.sample === b.sample) { return a.id - b.id }
          return !a.sample ? 1 : -1 // make sample testcase top.
        })
        this.problem = data.problem
        if (!this.mLanguage) {
          this.mLanguage = data.problem.language_allowed[0]
          this.language = data.problem.language_allowed[0]
          this.code = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || ''
        }
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
    },
    uploadZipFile (data) {
      // todo: 检查zip中文件类型
      // const zipName = data.file.name.slice(0, -4)
      this.treeData = []
      JSZip.loadAsync(data.file).then(this.findRoot).catch(() => {
        throw Error('Could not load the zip project')
      })
    },
    onNodeSelect (keys, event) {
      // todo:目前只能处理选中一个文件/文件夹
      this.saveCurrentFile()
      if (!event.node.dataRef.isFolder) {
        this.newZipFiles.file(keys[0]).async('string').then(content => {
          this.code = content
        })
        this.currentFile = event.node.dataRef
      }
    },
    saveCurrentFile () {
      this.newZipFiles.file(this.currentFile.path, this.code)
    },
    onLoadData (treeNode) {
      return new Promise(resolve => {
        if (treeNode.dataRef.child || !treeNode.dataRef.isFolder) {
          resolve()
          return
        }
        setTimeout(() => {
          const dirsKeys = Object.keys(this.newZipFiles.files)
          const needKeys = dirsKeys.filter(function (dir) {
            if (!RegExp(treeNode.dataRef.path).test(dir)) {
              return false
            }
            const prefix = treeNode.dataRef.path + '/'
            dir = dir.replace(prefix, '')
            if (dir === '') {
              return false
            }
            dir = dir.split('/')
            if (dir.length === 1 || dir[1] === '/') {
              return true
            }
            return false
          })
          needKeys.map((key, index) => {
            const dirKeys = key.split('/')
            const suffix = key.charAt(key.length - 1)
            const children = {
              isFolder: suffix === '/',
              isLeaf: suffix !== '/',
              path: key,
              label: dirKeys[dirKeys.length - 1]
            }
            treeNode.dataRef.hasOwnProperty('child') ? treeNode.dataRef.child.push(children) : treeNode.dataRef.child = [children]
            this.treeData = [...this.treeData]
          })
          resolve()
        }, 1000)
      })
    },
    findRoot (zip) {
      this.newZipFiles = zip
      const that = this
      const dirKeys = Object.keys(zip.files)
      const zipFileKeys = dirKeys.sort((a, b) => a.split('/').length - b.split('/').length)
      if (dirKeys.length < 1) {
        return
      }
      zipFileKeys.map((key, index) => {
        const dirKeys = key.split('/')
        if (dirKeys.length < 2 || dirKeys[1] === '') {
          // const prevPath = dirKeys[0] + '/' + dirKeys[1]
          // const isExistDir = that.treeData[0].child.filter(v => v.label === dirKeys[1])
          const children = {
            isFolder: dirKeys.length >= 2,
            isLeaf: dirKeys.length < 2,
            label: dirKeys[0],
            path: dirKeys[0]
          }
          that.treeData.push(children)
        }
      })
      // 过滤出二级目录中可以展示的文件
      const defaultData = this.treeData.filter(v => !v.isFolder)[0]
      if (defaultData) {
        this.currentFile = this.treeData[0]
        this.defaultExpandedKeys = [this.treeData[0].label, defaultData.label]
        // 获取默认展示的文件内容
        this.currentFile = defaultData
        if (!defaultData.isFolder) {
          // path:当前zip文件的绝对路径
          this.newZipFiles.file(defaultData.path).async('string').then(content => {
            that.code = content
          })
        }
      }
    }
  }
}
</script>
<style scoped lang="sass">
.ps
  height: 300px
.ant-space
  width: 100%
  justify-content: center
.submission_card
  .ant-card-body
    padding: 0
  .ant-list
    border: 0
</style>
