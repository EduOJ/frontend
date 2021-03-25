<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card :title="'作业：' + problem_set.name" :loading="loading" class="tool-card">
        <div class="toolbar-row">
          <div class="space"></div>
        </div>
        本次作业起止时间：{{ problem_set.time[0].format("lll") }} ~ {{ problem_set.time[1].format("lll") }}
        <a-list :data-source="problem_set.problems" bordered style="margin-top: 20px">
          <a-list-item slot="renderItem" slot-scope="problem">
            <div class="problem-name">
              {{ problem.name }}
            </div>
            <div class="toolbar-row">
              <div class="space"></div>
              <router-link :to="{name: 'class.problemSet.problem', params: {id, classID: classID, problemID: problem.id}}">
                <a-button type="link">
                  做题
                </a-button>
              </router-link>
              <a-button type="link">
                查看分数（功能开发中）
              </a-button>
            </div>
          </a-list-item>
        </a-list>
        <router-link
          :to="{name: 'class.problemSet.submissions', params: {classID: classID, problemSetID: problem_set.id}}"
        >
          <a-button
            style="margin-top: 10px"
            type="link"
          >
            查看本次作业的提交
          </a-button>
        </router-link>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import Avatar from '@/components/Avatar'
import { mapGetters } from 'vuex'
import { getProblemSet } from '@/api/class'
import moment from 'moment'

export default {
  methods: {
    fetch () {
      getProblemSet(this.classID, this.id).then(data => {
        data.problem_set.time = [moment(data.problem_set.start_time), moment(data.problem_set.end_time)]
        this.problem_set = data.problem_set
        this.loading = false
      }).catch(err => {
        this.$error({
          content: '获取作业详情时发生了错误' + err.message
        })
      })
    }
  },
  components: {
    Avatar
  },
  inject: ['refreshClass'],
  data () {
    return {
      id: this.$route.params.problemSetID,
      classID: this.$route.params.classID,
      loading: true,
      problem_set: {
        name: '',
        description: '',
        time: [moment(), moment()],
        problems: []
      }
    }
  },
  computed: {
    ...mapGetters({
      storeClass: 'class'
    })
  },
  mounted () {
    this.fetch()
  }
}
</script>

<style lang="sass" scoped>
.problem-name
  font-size: 18px
  font-weight: bold
  width: 100%
.ant-list-item-meta
  align-items: center
  width: 100%
.ant-space-horizontal
  width: 100%
  justify-content: center
.ant-list-item
  flex-wrap: wrap
.tool-card
  ::v-deep
    .toolbar-row
      display: flex
      justify-content: center
      width: 100%
      :not(:last-child)
        margin-right: 10px
      .space
        flex: 1
</style>
