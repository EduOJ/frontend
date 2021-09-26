<template>
  <a-spin :spinning="loading" class="problem_spin">
    <a-row :gutter="[16,16]" style="height: 100%">
      <a-col :lg="{span: 20, offset: 2}" ref="container">
        <a-card>
          <template slot="title">
            提交详情
          </template>
          <a-skeleton active :loading="loading">
            <a-space direction="vertical">
              <a-descriptions
                :title="`提交 #${submission.id}`"
                :column="{ xxl: 8, xl: 8, lg: 8, md: 5, sm: 3, xs: 2 }"
                layout="vertical"
                size="small"
                bordered
              >
                <a-descriptions-item label="ID">
                  {{ submission.id }}
                </a-descriptions-item>
                <a-descriptions-item label="题目名称">
                  <router-link :to="{name: 'problem', params: {id: submission.problem_id}}">
                    {{ `#${submission.problem_id} ${submission.problem_name}` }}
                  </router-link>
                </a-descriptions-item>
                <a-descriptions-item label="提交者">
                  <user-name :user="submission.user"/>
                </a-descriptions-item>
                <a-descriptions-item label="结果">
                  <run-status :status="submission.status" :score="submission.score"></run-status>
                </a-descriptions-item>
                <a-descriptions-item label="语言">
                  <language :language="submission.language"></language>
                </a-descriptions-item>
                <a-descriptions-item label="提交时间">
                  {{ format(submission.created_at) }}
                </a-descriptions-item>
                <a-descriptions-item label="评测时间">
                  {{ format(submission.updated_at) }}
                </a-descriptions-item>
              </a-descriptions>
              <a-card title="详细信息">
                <a-collapse>
                  <a-collapse-panel :disabled="!run.judged" v-for="run in submission.runs" :key="run.id">
                    <template slot="header">
                      <a-spin
                        tip="评测中"
                        :spinning="!run.judged"
                      >
                        <a-row>
                          <a-col :md="6" :sm="24">
                            Test #{{ run.test_case_id }}:
                          </a-col>
                          <a-col :md="6" :sm="24">
                            Status: <run-status :status="run.status"></run-status>
                          </a-col>
                          <a-col :md="6" :sm="24">
                            Time Used: {{ run.time_used }}ms
                          </a-col>
                          <a-col :md="6" :sm="24">
                            Memory Used: <memory :memory="run.memory_used"></memory>
                          </a-col>
                        </a-row>
                      </a-spin>
                    </template>
                    <h3> 编译器输出 </h3>
                    <Code :url="config.apiUrl + `/api/submission/${submission.id}/run/${run.id}/compiler_output`"></Code>
                    <a-space direction="vertical" v-if="can_read_secret || run.sample">
                      <h3> 输入： </h3>
                      <Code language="text" height="200px" :url="config.apiUrl + `/api/submission/${submission.id}/run/${run.id}/input`"></Code>
                      <h3> 输出： </h3>
                      <Code language="text" height="200px" :url="config.apiUrl + `/api/submission/${submission.id}/run/${run.id}/output`"></Code>
                      <h3> 程序输出与标准答案的区别： </h3>
                      <Diff language="text" height="200px" :url="config.apiUrl + `/api/submission/${submission.id}/run/${run.id}/comparer_output`"></Diff>
                    </a-space>
                  </a-collapse-panel>
                </a-collapse>
              </a-card>
              <a-card title="源代码" :loading="code_loading">
                文件名： {{ submission.file_name }}
                <codemirror
                  v-model="code"
                  :options="{
                    lineNumbers: true,
                    theme: 'darcula',
                    mode: languageConf[submission.language] && languageConf[submission.language].mimeType || 'text/html',
                    line: true,
                    viewportMargin: Infinity,
                    readOnly: true,
                  }"/>
              </a-card>
            </a-space>
          </a-skeleton>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
import { getSubmission } from '@/api/submission'
import Markdown from '@/components/Editor/Markdown'
import RunStatus from '@/components/RunStatus'
import TestCase from '@/components/TestCase'
import UserName from '@/components/UserName'
import Language from '@/components/Language'
import Code from '@/components/Code'
import Diff from '@/components/Diff'
import Memory from '@/components/Memory'
import config from '@/config/config'
import moment from 'moment'
import languageConf from '@/config/languageConf'
import request from '@/utils/request'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import codemirror from '@/components/codemirror/codemirror'

export default {
  name: 'Submission',
  components: {
    codemirror,
    Markdown,
    TestCase,
    RunStatus,
    UserName,
    Language,
    Code,
    Memory,
    Diff
  },
  data () {
    return {
      languageConf,
      config: config,
      id: this.$route.params.id,
      loading: true,
      can_read_problem: false, // this.$store.getters.can('read_problem', 'problem', this.$route.params.id) || this.$store.getters.can('read_problem'),
      can_read_secret: false, // this.$store.getters.can('read_problem_secrets', 'problem', this.$route.params.id) || this.$store.getters.can('read_problem_secrets'),
      submission: {
        id: null,
        problem_id: null,
        problem_name: null,
        language: 'java',
        score: 0,
        status: '',
        file_name: '',
        created_at: null,
        updated_at: null,
        runs: []
      },
      code_loading: true,
      code: ''
    }
  },
  mounted () {
    this.fetch()
    request({
      url: this.config.apiUrl + `/api/submission/${this.$route.params.id}/code`,
      method: 'get',
      responseType: 'text',
      headers: {
        Authorization: storage.get(ACCESS_TOKEN) || ''
      },
      transformResponse: [
        data => data
      ]
    }).then(resp => {
      this.code_loading = false
      this.code = resp
      if (this.content === '') {
        this.content = '内容为空'
      }
    }).catch(err => {
      console.log(err)
      this.code = '发生了错误'
      this.code_loading = false
    })
  },
  methods: {
    format (time) {
      return moment(time).format('lll')
    },
    getContainer () {
      return this.$refs.container.$el
    },
    fetch (poll) {
      this.loading = !poll
      getSubmission(this.id, poll, poll ? this.submission.updated_at : null).then(data => {
        this.loading = false
        data.submission.runs.sort((a, b) => {
          if (a.sample === b.sample) { return a.test_case_id - b.test_case_id }
          return !a.sample ? 1 : -1 // make sample testcase top.
        })
        this.submission = data.submission
        this.can_read_problem = this.$store.getters.can('read_problem', 'problem', data.submission.problem_id) || this.$store.getters.can('read_problem')
        this.can_read_secret = this.$store.getters.can('read_problem_secrets', 'problem', data.submission.problem_id) || this.$store.getters.can('read_problem_secrets')
        if (!data.submission.judged) {
          this.fetch(true)
        } else {
          if (data.submission.status === 'ACCEPTED' && !localStorage.getItem('letter:read:1')) {
            this.$confirm({
              icon: h => (
                <a-icon type="info-circle"/>
              ),
              title: '来自EduOJ开发组的一封信',
              width: 800,
              cancelText: '暂时关闭，下次再看',
              okText: '看完了',
              class: 'ant-modal-confirm-info',
              onOk: () => {
                localStorage.setItem('letter:read:1', 'true')
              },
              keyboard: false,
              content: (h) => {
                return config.message_on_first_accepted(h)
              }
            })
          }
        }
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message + err.error
        })
        console.error(err)
      })
    }
  }
}
</script>
<style scoped lang="sass">
.ant-space
  width: 100%
.ant-list-item
  width: 100%
.ant-spin-nested-loading
  width: 100%
.ant-row
  width: 100%
</style>
<style lang="sass">

</style>
