<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-card title="作业" :loading="loading">
        <div class="flex-row">
          <router-link :to="{name: 'class.addProblemSet', param: {classId: this.klass.id}}">
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
            <div class="flex-row">
              <div class="space"></div>
              <router-link :to="{name: 'class.editProblemSetProblems', params: {classId: klass.id, id: problem_set.id}}">
                <a-button type="link">
                  编辑题目
                </a-button>
              </router-link>
              <router-link :to="{name: 'class.editProblemSet', params: {classId: klass.id, id: problem_set.id}}">
                <a-button type="link">
                  编辑信息
                </a-button>
              </router-link>
              <a-button type="link">
                查看分数（功能开发中）
              </a-button>
              <a-button type="link">
                查看分数（功能开发中）
              </a-button>
              <a-button type="link" style="color: #E23c39;" @click="deleteProblemSet([problem_set])">
                删除
              </a-button>
            </div>
          </a-list-item>
        </a-list>
      </a-card>
    </a-col>

    <a-modal
      title="添加用户"
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
          placeholder="输入来搜索用户"
          style="width: 100%"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :allowClear="true"
          @search="searchUser"
          @change="searchUserChange"
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
import { getUsers } from '@/api/user'
import moment from 'moment'

export default {
  methods: {
    selectProblemSet (stu, e) {
      if (e.target.checked) {
        this.selected.push(stu)
      } else {
        this.selected.splice(this.selected.indexOf(stu), 1)
      }
    },
    deleteProblemSet (problemSets) {
      if (problemSets.length === 0) {
        this.$error({
          content: '请至少选择一个学生'
        })
        return
      }
      this.$confirm({
        content: '确定删除吗？',
        onOk: () => {

        }
      })
    },
    searchUserChange (val) {
      this.search_value = val
    },
    searchUser (text) {
      getUsers({
        offset: 0,
        limit: 5,
        search: text
      }).then(data => {
        this.search_result = data.users.filter(v => {
          return this.klass.problemSets.indexOf(v) === -1
        }).map((v) => {
          return {
            value: v.id,
            text: `#${v.id} ${v.username} ${v.nickname}`
          }
        })
      })
    },
    addProblemSet () {
      this.addProblemSetModal = true
    },
    confirmAddProblemSet () {
      this.addProblemSetLoading = true
    }
  },
  components: {
    Avatar
  },
  inject: ['refreshClass'],
  data () {
    return {
      loading: true,
      selected: [],
      search_value: [],
      search_result: [],
      addProblemSetLoading: false,
      addProblemSetModal: false,
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
.flex-row
  display: flex
  width: 100%
  :not(:last-child)
    margin-right: 5px
  .space
    flex: 1
</style>
