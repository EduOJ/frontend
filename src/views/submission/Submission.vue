<template>
  <a-spin :spinning="loading" class="problem_spin">
    <a-row :gutter="[16,16]" style="height: 100%">
      <a-col span="18" offset="3">
        <a-card>
          <template slot="title">
            提交详情
          </template>

        </a-card>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
import { getSubmission } from '@/api/submission'
import { format } from 'timeago.js'
import Markdown from '@/components/Editor/Markdown'
import RunStatus from '@/components/RunStatus'
import TestCase from '@/components/TestCase'
import config from '@/config/config'

export default {
  name: 'Submission',
  components: {
    Markdown,
    TestCase,
    RunStatus
  },
  data () {
    return {
      config: config,
      id: this.$route.params.id,
      loading: true,
      submission_loading: true,
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
        build_arg: '',
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
    format (time) {
      return format(time, 'zh_CN')
    },
    fetch () {
      this.loading = true
      getSubmission(this.id).then(data => {
        this.loading = false
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
.ps
  height: 300px
</style>
<style lang="sass">
.problem_spin
  height: 100%
  .ant-spin-container
    height: 100%
</style>
