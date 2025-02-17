<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="作业" :loading="loading" class="tool-card">
        <div class="toolbar-row">
          <a-button type="primary" @click="addProblem">
            <a-icon type="file-add" />
            添加
          </a-button>
          <a-button type="danger" @click="deleteProblem(selected)">
            <a-icon type="delete" />
            移除题目
          </a-button>
          <div class="space"></div>
        </div>
        <a-list :data-source="problem_set.problems" bordered style="margin-top: 20px">
          <a-list-item slot="renderItem" slot-scope="problem">
            <div class="problem-name">
              <a-checkbox @change="selectProblem(problem, $event)" :checked="selected.includes(problem)" style="margin-right: 10px"/>
              {{ problem.name }}
            </div>
            <div class="toolbar-row">
              <div class="space"></div>
              <a-button type="link">
                查看分数（功能开发中）
              </a-button>
              <a-button type="link" style="color: #E23c39;" @click="deleteProblem([problem])">
                删除
              </a-button>
            </div>
          </a-list-item>
        </a-list>
        <div class="toolbar-row" style="margin-top: 20px">
          <a-button @click="this.selectAll">
            全选
          </a-button>
          <a-button @click="selected = []">
            <a-icon type="close" />
            清除选择
          </a-button>
          <div class="space"></div>
        </div>
      </a-card>
    </a-col>

    <a-modal
      title="添加题目"
      :visible="addProblemSetModal"
      :okButtonProps="{props:{loading: addProblemSetLoading}}"
      @ok="confirmAddProblemSet()"
      @cancel="addProblemSetModal = false"
    >
      <div style="height: 120px">
        <a-select
          show-search
          mode="multiple"
          :value="search_value"
          placeholder="输入来搜索题目"
          style="width: 100%"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :allowClear="true"
          @search="search"
          @change="searchChange"
        >
          <a-select-option v-for="d in search_result" :key="d.value">
            {{ d.text }}
          </a-select-option>
        </a-select>
      </div>
    </a-modal>
  </a-row>
</template>

<script>
import Avatar from '@/components/Avatar'
import { mapGetters } from 'vuex'
import { getProblems } from '@/api/problem'
import { getProblemSet, addProblems, deleteProblems } from '@/api/class'
import moment from 'moment'

export default {
  methods: {
    selectProblem (stu, e) {
      if (e.target.checked) {
        this.selected.push(stu)
      } else {
        this.selected.splice(this.selected.indexOf(stu), 1)
      }
    },
    deleteProblem (problems) {
      if (problems.length === 0) {
        this.$error({
          content: '请至少选择一个题目'
        })
        return
      }
      this.$confirm({
        content: '确定删除吗？',
        onOk: () => {
          deleteProblems(this.classID, this.id, problems.map(p => p.id)).then(data => {
            this.fetch()
            this.addProblemSetLoading = false
            this.$success({
              content: '题目删除成功！',
              onOk: () => {
                this.fetch()
                this.search_value = []
                this.addStudentModal = false
              }
            })
          }).catch(err => {
            this.$error({
              content: '发生了错误：' + err.message
            })
          })
        }
      })
    },
    searchChange (val) {
      this.search_value = val
    },
    search (text) {
      getProblems({
        offset: 0,
        limit: 5,
        search: text
      }).then(data => {
        this.search_result = data.problems.filter(v => {
          return this.problem_set.problems.indexOf(v) === -1
        }).map((v) => {
          return {
            value: v.id,
            text: `#${v.id} ${v.name}`
          }
        })
      })
    },
    addProblem () {
      this.addProblemSetModal = true
    },
    selectAll () {
      this.selected = []
      for (const u of this.problem_set.problems) {
        this.selected.push(u)
      }
    },
    confirmAddProblemSet () {
      this.addProblemSetLoading = true
      console.log(this.search_value)
      addProblems(this.classID, this.id, this.search_value).then(data => {
        this.fetch()
        this.addProblemSetLoading = false
        this.$success({
          content: '题目添加成功！',
          onOk: () => {
            this.search_value = []
            this.addProblemSetModal = false
          }
        })
      }).catch(err => {
        this.$error({
          content: '发生了错误：' + err.message
        })
      })
    },
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
      selected: [],
      search_value: [],
      search_result: [],
      addProblemSetLoading: false,
      addProblemSetModal: false,
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
