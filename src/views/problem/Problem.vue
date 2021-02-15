<template>
  <a-spin :spinning="loading" style="height: 100%">
    <a-row :gutter="16" style="height: 100%">
      <a-col offset="2" span="14" style="height: 100%">
        <a-card :title="problem.name" style="height: 100%">
          <perfect-scrollbar>
            <a-skeleton active :loading="loading">
              <markdown v-model="problem.description">
              </markdown>
              <test-case v-for="t in problem.test_cases" :t="t" :key="t.id" :can-read-secret="can_read_secret"/>
            </a-skeleton>
          </perfect-scrollbar>
        </a-card>
      </a-col>
      <a-col span="6">
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
                :color="{
                  'c': 'green',
                  'cpp': 'cyan'
                }[language]"
                v-for="language in problem.language_allowed"
                :key="language">
                {{ language }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="编译脚本" :span="3">
              {{ {
                compare_soft_match: "忽略行末空格 + 最后回车",
                compare_float: "浮点数匹配 （相差1e-8内认为正确)",
                compare_exact_match: "字符级严格匹配",
              }[problem.compare_script_name] == null ? problem.compare_script_name : {
                compare_soft_match: "忽略行末空格 + 最后回车",
                compare_float: "浮点数匹配 （相差1e-8内认为正确)",
                compare_exact_match: "字符级严格匹配",
              }[problem.compare_script_name] }}
            </a-descriptions-item>
            <a-descriptions-item label="编译环境" :span="3" v-if="can_read_problem">
              {{ problem.compile_environment == "" ? "无" :problem.compile_environment }}
            </a-descriptions-item>
            <a-descriptions-item label="附件" :span="3">
              {{ problem.attachment_file_name == "" ? "无" : "" }}
              <a-button :loading="downloading" @click="downloadAttachment()" v-if="problem.attachment_file_name != ''">
                <a-icon type="download" />
                {{ download_message }}</a-button>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
import { getProblem } from '@/api/problem'
import Markdown from '@/components/Editor/Markdown'
import TestCase from '@/components/TestCase'
import config from '@/config/config'
import request from '@/utils/request'
import download from 'js-file-download'

export default {
  name: 'Problem',
  components: {
    Markdown,
    TestCase
  },
  data () {
    return {
      config: config,
      id: this.$route.params.id,
      loading: true,
      downloading: false,
      download_message: '',
      can_read_problem: this.$store.getters.can('read_problem', 'problem', this.$route.params.id) || this.$store.getters.can('read_problem'),
      can_read_secret: this.$store.getters.can('read_problem_secret', 'problem', this.$route.params.id) || this.$store.getters.can('read_problem_secret'),
      problem: {
        id: this.$route.params.id,
        name: '',
        description: '',
        language_allowed: [],
        time_limit: 0,
        memory_limit: 0,
        privacy: true,
        public: true,
        compile_environment: '',
        compare_script_name: '',
        attachment_file_name: '',
        test_cases: []
      }
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
      this.loading = true
      getProblem(this.id).then(data => {
        this.loading = false
        data.problem.test_cases.sort((a, b) => {
          if (a.sample === b.sample) { return a.id - b.id }
          return !a.sample ? 1 : -1 // make sample testcase top.
        })
        this.problem = data.problem
        this.download_message = data.problem.attachment_file_name
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
        onDownloadProgress: (progressEvent) => {
          console.log(progressEvent)
          const percentCompleted = Math.floor(progressEvent.loaded / progressEvent.total * 100)
          console.log('completed: ', percentCompleted)
          this.download_message = `已下载 ${percentCompleted} %`
        }
      }).then(resp => {
        this.download_message = this.problem.attachment_file_name
        this.downloading = false
        download(resp.data, this.problem.attachment_file_name)
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

<style scoped>
.ps {
  height: 500px;
}
</style>
