<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="作业" :loading="loading" class="tool-card">
        <div class="toolbar-row">
          <router-link :to="{name: 'class.addProblemSet', param: {classID: this.klass.id}}">
            <a-button type="primary">
              <a-icon type="file-add" />
              创建
            </a-button>
          </router-link>
          <div class="space"></div>
          <a-button>4</a-button>
        </div>
        <a-list :data-source="klass.problem_sets" bordered style="margin-top: 20px">
          <a-list-item slot="renderItem" slot-scope="problem_set">
            <a-list-item-meta>
              <template slot="title">{{ problem_set.name }}</template>
            </a-list-item-meta>
            {{ problem_set.start_time.format('lll') }}
            ~
            {{ problem_set.end_time.format('lll') }}
            <div class="toolbar-row">
              <div class="space"></div>
              <router-link :to="{name: 'class.editProblemSetProblems', params: {classID: klass.id, problemSetID: problem_set.id}}">
                <a-button type="link">
                  编辑题目
                </a-button>
              </router-link>
              <router-link :to="{name: 'class.editProblemSet', params: {classID: klass.id, problemSetID: problem_set.id}}">
                <a-button type="link">
                  编辑信息
                </a-button>
              </router-link>
              <router-link :to="{name: 'class.problemSet.submissions', params: {classID: klass.id, problemSetID: problem_set.id}}">
                <a-button type="link">
                  查看提交
                </a-button>
              </router-link>
              <router-link :to="{name: 'class.problemSet.GetGrades', params: {classID: klass.id,problemSetID: problem_set.id}}">
                <a-button type="link">
                  查看分数
                </a-button>
              </router-link>
              <a-button type="link" style="color: #E23c39;" @click="deleteProblemSet(problem_set)">
                删除
              </a-button>
            </div>
          </a-list-item>
        </a-list>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import Avatar from '@/components/Avatar'
import { mapGetters } from 'vuex'
import moment from 'moment'
import { deleteProblemSet } from '@/api/class'

export default {
  methods: {
    selectProblemSet (stu, e) {
      if (e.target.checked) {
        this.selected.push(stu)
      } else {
        this.selected.splice(this.selected.indexOf(stu), 1)
      }
    },
    deleteProblemSet (problemSet) {
      this.$confirm({
        content: '确定删除吗？',
        onOk: () => {
          deleteProblemSet({
            classID: this.klass.id,
            id: problemSet.id
          }).then(resp => {
            this.$success({
              content: '删除成功！'
            })
            this.refreshClass()
          }).catch(err => {
            console.log(err)
            this.$error({
              content: '删除失败：' + err.message
            })
          })
        }
      })
    }
  },
  components: {
    Avatar
  },
  inject: ['refreshClass'],
  data () {
    return {
      loading: true,
      klass: {
        problemSets: []
      }
    }
  },
  watch: {
    storeClass: {
      handler (val) {
        if (val) {
          this.loading = false
          if (val.problem_sets) {
            val.problem_sets = val.problem_sets.map(p => {
              p.start_time = moment(p.start_time)
              p.end_time = moment(p.end_time)
              return p
            })
          }
          this.klass = val
          this.loading = false
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters({
      storeClass: 'class'
    })
  },
  mounted () {
  }
}
</script>

<style lang="sass" scoped>
.ant-list-item-meta
  align-items: center
.ant-space-horizontal
  width: 100%
  justify-content: center
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
