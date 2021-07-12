<template>
  <a-spin :spinning="loading" class="problem_spin">
    <a-row :gutter="[16,16]" style="height: 100%">
      <a-col :xl="{span:14, offset:5}" :lg="{span:16}">
        <a-card :title="problem.name" style="height: 100%">
          <a-space direction="vertical">
            <p>
              语言选择：
              <a-select v-model="mLanguage" default-value="cpp" style="width: 120px" @change="languageChange">
                <a-select-option :key="l" v-for="l in problem.language_allowed">
                  {{ languageConf[l].displayName }}
                </a-select-option>
              </a-select>
            </p>
            <a-card title="输入代码" class="submission_card" size="small" v-if="!multiFile">
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
            <MultiFileEditor
              :zip-u-r-l="zipURL"
              :language="language"
              v-if="multiFile"
              ref="mEditor">
            </MultiFileEditor>
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
import MultiFileEditor from '@/components/Editor/MultiFileEditor'
import { Base64 } from 'js-base64'

export default {
  name: 'Problem',
  components: {
    Markdown,
    TestCase,
    RunStatus,
    codemirror,
    MultiFileEditor
  },
  data () {
    let language = localStorage.getItem(`problem:${this.$route.params.id}:language`)
    let code = ''
    let multiFile = false
    if (language) {
      if (localStorage.getItem(`problem:${this.$route.params.id}:code`)) {
        code = localStorage.getItem(`problem:${this.$route.params.id}:code`)
        localStorage.removeItem(`problem:${this.$route.params.id}:code`)
        localStorage.setItem(`problem:${this.$route.params.id}:code:${language}`, code)
      } else {
        code = localStorage.getItem(`problem:${this.$route.params.id}:code:${language}`) || ''
      }
      multiFile = languageConf[language].multiFile
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
      multiFile: multiFile,
      zipURL: ''
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
    async languageChange (val) {
      if (!languageConf[this.language].multiFile) {
        localStorage.setItem(`problem:${this.$route.params.id}:code:${this.language}`, this.code)
        this.language = this.mLanguage
        this.multiFile = languageConf[this.language].multiFile
        localStorage.setItem(`problem:${this.$route.params.id}:language`, this.language)
        if (!this.multiFile) {
          this.code = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || ''
        } else {
          this.zipURL = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || ''
        }
      } else {
        const fileReader = new FileReader()
        this.$refs.mEditor.saveCurrentFile()
        this.$refs.mEditor.zip.generateAsync({ type: 'blob' }).then(async (content) => {
          fileReader.onload = (evt) => {
            const lastZipURL = Base64.decode(localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || '')
            if (lastZipURL) {
              URL.revokeObjectURL(lastZipURL) // todo: revoked?
            }
            const zip = Base64.encode(evt.target.result)
            localStorage.setItem(`problem:${this.$route.params.id}:code:${this.language}`, zip)
            this.language = this.mLanguage
            this.multiFile = languageConf[this.language].multiFile
            localStorage.setItem(`problem:${this.$route.params.id}:language`, this.language)
            if (!this.multiFile) {
              this.code = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || ''
            } else {
              this.zipURL = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || ''
            }
          }
          fileReader.readAsDataURL(content)
        })
      }
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
          this.multiFile = languageConf[this.language].multiFile
          this.code = localStorage.getItem(`problem:${this.$route.params.id}:code:${this.language}`) || ''
        }
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
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
