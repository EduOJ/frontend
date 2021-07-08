<template>
  <a-spin :spinning="problem_loading" class="problem_spin">
    <a-row :gutter="[16,0]" style="height: 100%">
      <a-col :xl="{span:14, offset:2}" :lg="{span:16}" style="height: 100%">
        <a-card :title="problem.name" style="height: 100%">
          <a-skeleton active :loading="problem_loading">
            <markdown v-model="problem.description">
            </markdown>
            <test-case :base-url="`/api/class/${classID}/problem_set/${problemSetID}/problem/`" v-for="t in problem.test_cases" :t="t" :key="t.id" :can-read-secret="can_read_secret"/>
          </a-skeleton>
        </a-card>
        <comment-blocks :targetID="this.$route.params.problemID" :targetType="this.hashType" ></comment-blocks>
      </a-col>
      <a-col :xl="{span:6}" :lg="{span:8}" >
        <a-space direction="vertical">
          <a-card>
            <a-descriptions title="题目信息" :column="3">
              <a-descriptions-item label="时间限制">
                {{ problem.time_limit }} ms
              </a-descriptions-item>
              <a-descriptions-item label="内存限制">
                {{ problem.memory_limit > 1024 * 1024 ? problem.memory_limit / (1024 * 1024) + " MiB" : problem.memory_limit / 1024 + (" Kib") }}
              </a-descriptions-item>
              <a-descriptions-item label="是否公开" v-if="can_read_problem">
                {{ problem.public ? "是" : "否" }}
              </a-descriptions-item>
              <a-descriptions-item v-else>

              </a-descriptions-item>
              <a-descriptions-item label="允许的语言" :span="3">
                <a-tag
                  :color="languageConf[language].color"
                  v-for="language in problem.language_allowed"
                  :key="language">
                  {{ language }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="答案比较方式" :span="3">
                {{ comparerConf[problem.compare_script_name].name == null ? problem.compare_script_name : comparerConf[problem.compare_script_name].name }}
              </a-descriptions-item>
              <a-descriptions-item label="编译选项" :span="3" v-if="can_read_problem">
                {{ problem.build_arg == "" ? "无" :problem.build_arg }}
              </a-descriptions-item>
              <a-descriptions-item label="附件" :span="3">
                {{ problem.attachment_file_name == "" ? "无" : "" }}
                <a-button :loading="downloading" @click="downloadAttachment()" v-if="problem.attachment_file_name != ''">
                  <a-icon type="download" />
                  {{ download_message }}</a-button>
              </a-descriptions-item>
            </a-descriptions>
            <router-link :to="{name:'class.problemSet.submit', params: {id: problem.id, classID: classID, pid: problem.id}}">
              <a-button type="primary">
                提交
              </a-button>
            </router-link>
          </a-card>
          <a-card class="submission_card">
            <template slot="title">最近提交</template>
            <a-list size="small" bordered :data-source="submissions">
              <a-list-item slot="renderItem" slot-scope="s">
                <router-link :to="{name:'class.problemSet.submission', params: {submissionID: s.id, classID: classID, problemSetID}}" style="color: black;width: 100%;">
                  <a-row>
                    <a-col :span="4">
                      {{ s.id }}
                    </a-col>
                    <a-col :span="12">
                      <run-status :status="s.status" :score="s.score"/>
                    </a-col>
                    <a-col :span="8">
                      {{ format(s.created_at) }}
                    </a-col>
                  </a-row>
                </router-link>
              </a-list-item>
            </a-list>
          </a-card>
        </a-space>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
import { getProblemSetProblem, getSubmissions } from '@/api/problem_set'
import { getProblemSet } from '@/api/class'
import Markdown from '@/components/Editor/Markdown'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'
import RunStatus from '@/components/RunStatus'
import TestCase from '@/components/TestCase'
import config from '@/config/config'
import request from '@/utils/request'
import download from 'js-file-download'
import moment from 'moment'
import languageConf from '@/config/languageConf'
import comparerConf from '@/config/comparerConf'
import CommentBlocks from '@/components/CommentBlock/CommentBlocks'

export default {
  name: 'Problem',
  components: {
    Markdown,
    MarkDownEditor,
    TestCase,
    RunStatus,
    CommentBlocks
  },
  data () {
    return {
      hashType: 'problem',
      comparerConf,
      languageConf,
      config,
      problemSetID: this.$route.params.problemSetID,
      classID: this.$route.params.classID,
      id: this.$route.params.problemID,
      problem_loading: true,
      submission_loading: true,
      downloading: false,
      download_message: '',
      can_read_problem: this.$store.getters.can('manage_problem_sets', 'class', this.$route.params.classID) || this.$store.getters.can('manage_problem_sets'),
      can_read_secret: this.$store.getters.can('read_answers', 'class', this.$route.params.classID) || this.$store.getters.can('read_answers'),
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
      pagination: {
        current: 1,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [
          '20',
          '50',
          '100'
        ],
        pageSize: 50,
        showTotal: (total, range) => `共 ${total} 条数据, 正在显示 ${range[0]} - ${range[1]} 条`
      },
      problem_set: {},
      submissions: []
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    format (time) {
      return moment(time).fromNow()
    },
    fetch () {
      this.problem_loading = true
      getProblemSet(this.classID, this.problemSetID).then(data => {
        this.problem_set = data.problem_set
        if (moment(data.problem_set.end_time).isBefore(moment())) {
          this.$info({
            content: '本次作业已经截止，还可以继续提交做题，但是不会更新作业成绩！'
          })
        }
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
      getProblemSetProblem(this.classID, this.problemSetID, this.id).then(data => {
        this.problem_loading = false
        data.problem.test_cases.sort((a, b) => {
          if (a.sample === b.sample) { return a.id - b.id }
          return !a.sample ? 1 : -1 // make sample testcase top.
        })
        this.problem = data.problem
        this.download_message = data.problem.attachment_file_name
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
      getSubmissions(this.classID, this.problemSetID, {
        problem_id: this.id,
        user_id: this.$store.state.user.info.id,
        limit: 5
      }).then(data => {
        this.submission_loading = false
        this.submissions = data.submissions
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
    },

    downloadAttachment () {
      const url = config.apiUrl + '/api/problem/' + this.problem.id + '/attachment_file'
      this.downloading = true
      this.download_message = '下载中'
      request({
        timeout: 0,
        url: url,
        method: 'get',
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          console.log(progressEvent)
          const percentCompleted = Math.floor(progressEvent.loaded / progressEvent.total * 100)
          console.log('completed: ', percentCompleted)
          this.download_message = `已下载 ${percentCompleted} %`
        }
      }).then(resp => {
        this.download_message = this.problem.attachment_file_name
        this.downloading = false
        console.log(resp)
        download(resp, this.problem.attachment_file_name)
      }).catch(err => {
        this.download_message = this.problem.attachment_file_name
        this.downloading = false
        console.log(err)
        this.$error({
          content: '下载失败！' + err.message
        })
      })
    }
  }
}
</script>
<style scoped lang="sass">
.ps
  height: 300px
</style>
<style lang="sass">
.submission_card
  .ant-card-body
    padding: 0
  .ant-list
    border: 0
.problem_spin
  height: 100%
  .ant-spin-container
    height: 100%
</style>
