<template>
  <a-spin :spinning="problem_loading" class="problem_spin">
    <a-row :gutter="[16,16]" style="height: 100%">
      <a-col :xl="{span:14, offset:2}" :lg="{span:16}" style="height: 100%">
        <a-card :title="problem.name" style="height: 100%">
          <a-skeleton active :loading="problem_loading">
            <markdown v-model="problem.description">
            </markdown>
            <test-case :base-url="`/api/class/${classID}/problem_set/${problemSetID}/problem/`" v-for="t in problem.test_cases" :t="t" :key="t.id" :can-read-secret="can_read_secret"/>
          </a-skeleton>
        </a-card>
        <a-card :title="ss" style="height: 100%">
          欢乐评论区在下方↓
        </a-card>
        <ul v-for="comment in this.comments" :key="comment.ID">
          <one-comment
          :depth='0'
          :detail="comment.Detail"
          :comment_id="comment.ID"
          :times="comment.created_at"
          :writer="comment.Writer"
          :jsonStr="jsonTree[comment.ID.toString()]"
          :content="comment.Content" ></one-comment>
        </ul>
        <div >
            <span><avatar size="large" :user="this.$store.state.user.info"></avatar></span>
            <span> 对本题留言</span>
            <div slot="content">
            <a-form-item>
            </a-form-item>
            <mark-down-editor unique-id="description_markdown" v-model="CommentDescription"/>
            <a-form-item>
            <div style="margin-left:20pt; margin-right:20pt">
            <span><a-button html-type="submit" :loading="submitting" type="primary" @click="handleCancel()">
                取消
            </a-button></span>
            <span style="float:right"><a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit()">
                提交
            </a-button></span>
            </div>
            </a-form-item>
            </div>
        </div>
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
import { createComment, getComment } from '@/api/comment'
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
import OneComment from '@/components/CommentBlock/OneComment'

export default {
  name: 'Problem',
  components: {
    Markdown,
    MarkDownEditor,
    TestCase,
    RunStatus,
    OneComment
  },
  data () {
    return {
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
      CommentDescription: '',
      problem_set: {},
      submissions: [],
      comments: [],
      commentsNoneRoot: [],
      jsonTree: {},
      jsonChildren: {},
      commentsMap: {}
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

      getComment({
        query_type: 'problem',
        query_id: this.$route.params.problemID
      }).then(data => {
        this.comments = data.ComsRoot
        this.commentsNoneRoot = data.ComsNoneRoot
        this.parseJson()
        // for (var i = 0; i < this.comments.length; i++) {
        //   alert(this.jsonTree[this.comments[i].ID.toString()])
        // }
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
    },
    randomString (e) {
      e = e || 32
      var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      var a = t.length
      var n = ''
      for (var i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
      return n
    },
    parseRecur (fatherID) {
      var len = this.jsonChildren[fatherID.toString()].length
      if (len === 0) return { 'data': this.commentsMap[fatherID.toString()] }
      var temp = {}
      for (var i = 0; i < len; i++) {
        temp[this.jsonChildren[fatherID.toString()][i]] = this.parseRecur(this.jsonChildren[fatherID.toString()][i])
      }
      temp['data'] = this.commentsMap[fatherID.toString()]
      return temp
    },
    parseJson () {
      var len = this.comments.length
      var len2 = this.commentsNoneRoot.length

      for (var j = 0; j < len; j++) {
        this.jsonChildren[(this.comments[j].ID).toString()] = []
        this.commentsMap[(this.comments[j].ID).toString()] = this.comments[j]
      }
      for (var j2 = 0; j2 < len2; j2++) {
        this.jsonChildren[(this.commentsNoneRoot[j2].ID).toString()] = []
        this.commentsMap[(this.commentsNoneRoot[j2].ID).toString()] = this.commentsNoneRoot[j2]
      }

      for (var i = 0; i < len2; i++) {
        this.jsonChildren[this.commentsNoneRoot[i].FatherID.toString()].push(this.commentsNoneRoot[i].ID)
      }

      for (var k = 0; k < len; k++) {
        this.jsonTree[(this.comments[k].ID).toString()] = this.parseRecur(this.comments[k].ID)
      }
    },
    handleSubmit () {
      if (this.CommentDescription.length < 2) {
        this.$error({
          content: '评论长度过短'
        })
      } else {
        createComment({
        father_id: this.$route.params.problemID,
        first_id: this.$route.params.problemID,
        first_type: 'problem',
        father_type: 'problem',
        content: this.CommentDescription
        }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
      }
    },
    handleCancel () {
      this.CommentDescription = ''
      this.$forceUpdate()
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
