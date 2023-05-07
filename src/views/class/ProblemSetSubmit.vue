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
            <a-card title="输入代码" class="submission_card" size="small">
              <codemirror
                v-model="code"
                :options="{
                  lineNumbers: true,
                  theme: 'darcula',
                  mode: languageConf[language].mimeType,
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
import { getProblemSetProblem, createSubmission } from '@/api/problem_set'
import Markdown from '@/components/Editor/Markdown'
import RunStatus from '@/components/RunStatus'
import TestCase from '@/components/TestCase'
import config from '@/config/config'
import { codemirror } from '@/components/codemirror'
import languageConf from '@/config/languageConf'

export default {
  name: 'Problem',
  components: {
    Markdown,
    TestCase,
    RunStatus,
    codemirror
  },
  data () {
    let language = localStorage.getItem(`problem:${this.$route.params.problemID}:language`)
    let code = ''
    if (language) {
      if (localStorage.getItem(`problem:${this.$route.params.problemID}:code`)) {
        code = localStorage.getItem(`problem:${this.$route.params.problemID}:code`)
        localStorage.removeItem(`problem:${this.$route.params.problemID}:code`)
        localStorage.setItem(`problem:${this.$route.params.problemID}:code:${language}`, code)
      } else {
        code = localStorage.getItem(`problem:${this.$route.params.problemID}:code:${language}`) || ''
      }
    } else {
      language = null
      code = ''
    }
    return {
      config: config,
      languageConf,
      problemSetID: this.$route.params.problemSetID,
      classID: this.$route.params.classID,
      id: this.$route.params.problemID,
      loading: true,
      submitLoading: false,
      problem: {
        id: this.$route.params.problemID,
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
      mLanguage: language
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
      localStorage.setItem(`problem:${this.$route.params.problemID}:code:${this.language}`, this.code)
      this.language = this.mLanguage
      localStorage.setItem(`problem:${this.$route.params.problemID}:language}`, this.language)
      this.code = localStorage.getItem(`problem:${this.$route.params.problemID}:code:${this.language}`) || ''
    },
    doSubmit () {
      this.submitLoading = true
      localStorage.setItem(`problem:${this.$route.params.problemID}:code:${this.language}`, this.code)
      localStorage.setItem(`problem:${this.$route.params.problemID}:language`, this.language)
      var c = new Blob([this.code])
      createSubmission({
        problem_id: this.problem.id,
        language: this.language,
        code: c,
        classID: this.classID,
        problemSetID: this.problemSetID
      }).then(data => {
        let oked = 0
        this.submitLoading = false
        const modal = this.$success({
          content: '提交成功！',
          okText: '立即查看',
          onOk: () => {
            oked = 1
            this.$router.push({
              name: 'class.problemSet.submission',
              params: {
                submissionID: data.submission.id,
                classID: this.classID,
                problemSetID: this.problemSetID
              }
            })
          }
        })
        setTimeout(_ => {
          if (!oked) {
            modal.destroy()
            this.$router.push({
              name: 'class.problemSet.submission',
              params: {
                submissionID: data.submission.id,
                classID: this.classID,
                problemSetID: this.problemSetID
              }
            })
          }
        }, 2000)
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
        this.submitLoading = false
      })
    },
    fetch () {
      this.loading = true
      getProblemSetProblem(this.classID, this.problemSetID, this.id).then(data => {
        this.loading = false
        data.problem.test_cases.sort((a, b) => {
          if (a.sample === b.sample) { return a.id - b.id }
          return !a.sample ? 1 : -1 // make sample testcase top.
        })
        if (data.problem.language_allowed.includes('any')) {
          data.problem.language_allowed = Object.keys(this.languageConf)
        }
        this.problem = data.problem
        if (!this.mLanguage) {
          this.mLanguage = data.problem.language_allowed[0]
          this.language = data.problem.language_allowed[0]
          this.code = localStorage.getItem(`problem:${this.$route.params.problemID}:code:${this.language}`) || ''
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
<style lang="sass">
.CodeMirror-code
  font-family: 'JetBrains Mono', serif !important
.CodeMirror
  height: auto
</style>
