<template>
  <a-card>
    <template slot="title">
      查看提交
    </template>
    <template slot="extra">
      <a-checkbox @change="onlySeeSelf">
        只看我的提交
      </a-checkbox>
    </template>
    <a-table
      :columns="columns"
      bordered
      :components="components"
      :row-key="problem => problem.id"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      ref="table"
      @change="handleTableChange"
    >
      <template slot="id" slot-scope="text, record">
        <router-link
          :to="{name: 'submission', params: {id: record.id}}"
          v-if="canReadAnswers || record.user.id === now_user_id"
        >
          {{ text }}
        </router-link>
        <template v-else>
          {{ text }}
        </template>
      </template>
      <template slot="problem_name" slot-scope="text, record">
        <router-link :to="{name: 'problem', params: {id: record.problem_id}}">
          {{ `#${record.problem_id} ${record.problem_name}` }}
        </router-link>
      </template>
      <user-name slot="user_name" slot-scope="user" :user="user" />
      <template slot="status" slot-scope="text, record">
        <run-status :status="text" :score="record.score" />
      </template>
      <template slot="created_at" slot-scope="time">
        {{ format(time) }}
      </template>
      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <a-select
          show-search
          :value="column.searching"
          :placeholder="`搜索 ${column.title}`"
          style="width: 200px"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :allowClear="true"
          @search="handleSearch(column.dataIndex)($event)"
          @focus="handleSearch(column.dataIndex)()"
          @change="handleChange(column.dataIndex)($event)"
        >
          <a-select-option v-for="d in search_result" :key="d.value">
            {{ d.text }}
          </a-select-option>
        </a-select>
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
    </a-table>
  </a-card>
</template>

<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { getSubmissions } from '@/api/submission'
import ResizableTableHeader from '@/components/Table/ResizableTableHeader.js'
import RunStatus from '@/components/RunStatus'
import UserName from '@/components/UserName'
import { getProblems } from '@/api/problem'
import { getUsers } from '@/api/user'
import moment from 'moment'

export default {
  data () {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        scopedSlots: {
          customRender: 'id'
        },
        width: 80
      },
      {
        title: '题目名称',
        dataIndex: 'problem_name',
        scopedSlots: {
          customRender: 'problem_name',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon'
        },
        searching: ''
      },
      {
        title: '提交者',
        dataIndex: 'user',
        scopedSlots: {
          customRender: 'user_name',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon'
        },
        searching: ''
      },
      {
        title: '结果',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' }
      },
      {
        title: '提交时间',
        dataIndex: 'created_at',
        scopedSlots: { customRender: 'created_at' },
        last: true
      }
    ]

    const ResizableTableHeaderWithColumns = (h, props, children) => {
      const draggingMap = {}
      columns.forEach(col => {
        draggingMap[col.dataIndex] = null
      })
      const draggingState = Vue.observable(draggingMap)
      return ResizableTableHeader(h, props, children, columns, draggingState)
    }

    return {
      columns: columns,
      components: {
        header: {
          cell: ResizableTableHeaderWithColumns
        }
      },
      now_user_id: this.$store.state.user.info.id,
      canReadAnswers: this.$store.getters.can('read_answers', 'class', this.$route.params.classID) || this.$store.getters.can('read_answers'),
      deleting: {},
      deleteModelText: '',
      visible: false,
      confirmLoading: false,
      data: [],
      search: '',
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [
          '2',
          '20',
          '50',
          '100'
        ],
        defaultPageSize: 50,
        pageSize: 50,
        showTotal: (total, range) => `共 ${total} 条数据, 正在显示 ${range[0]} - ${range[1]} 条`
      },
      loading: false,
      sorter: {
        sortField: 'id',
        sortOrder: 'ascend'
      },
      search_problem_id: this.$route.query && +this.$route.query.problem_id || null,
      search_user_id: this.$route.query && +this.$route.query.user_id || null,
      search_result: []
    }
  },
  computed: {
    ...mapGetters(['can'])
  },
  components: {
    RunStatus,
    UserName
  },
  mounted () {
    this.fetch({
      pageSize: this.$refs.table.pagination.pageSize,
      page: this.$refs.table.pagination.current,
      user_id: this.search_user_id,
      problem_id: this.search_problem_id,
      callback: () => {
        this.$nextTick(() => {
          for (const col of this.columns) {
            if (col.thDom) {
              col.width = col.thDom.getBoundingClientRect().width
            }
          }
        })
      }
    })
  },
  methods: {
    format (time) {
      return moment(time).format('lll')
    },
    onlySeeSelf (val) {
      console.log(val)
      if (val.target.checked) {
        this.search_user_id = this.$store.state.user.info.id
        const params = {
          user_id: this.$store.state.user.info.id
        }
        history.pushState(
          {},
          null,
          this.$route.path +
          '?' +
          Object.keys(params)
            .map(key => {
              return (
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
              )
            })
            .join('&')
        )
      } else {
        this.search_user_id = null
        history.pushState(
          {},
          null,
          this.$route.path
        )
      }
      this.fetch({
        pageSize: this.pagination.pageSize,
        page: this.pagination.current,
        user_id: this.search_user_id,
        problem_id: this.search_problem_id
      })
    },
    handleSearch (dataIndex) {
      console.log(dataIndex)
      if (dataIndex === 'problem_name') {
        return (text) => {
          getProblems({
            offset: 0,
            limit: 5,
            search: text
          }).then(data => {
            this.search_result = data.problems.map((v) => {
              return {
                value: v.id,
                text: v.name
              }
            })
          })
        }
      } else if (dataIndex === 'user') {
        return (text) => {
          getUsers({
            offset: 0,
            limit: 5,
            search: text
          }).then(data => {
            this.search_result = data.users.map((v) => {
              return {
                value: v.id,
                text: v.nickname
              }
            })
          })
        }
      }
    },
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.pagination = pagination
      this.sorter = sorter
      this.fetch({
        pageSize: pagination.pageSize,
        page: pagination.current,
        user_id: this.search_user_id,
        problem_id: this.search_problem_id
      })
    },
    handleChange (dataIndex) {
      if (dataIndex === 'problem_name') {
        return (id, text) => {
          this.search_problem_id = id
          const col = this.columns.filter((v) => v.dataIndex === dataIndex)[0]
          if (id) {
            const title = this.search_result.filter((v) => v.value === id)[0].text
            col.searching = title
            col.title = `题目名称：${title}`
          } else {
            col.searching = ''
            col.title = '题目名称'
          }
          this.fetch({
            pageSize: this.pagination.pageSize,
            page: this.pagination.current,
            user_id: this.search_user_id,
            problem_id: this.search_problem_id
          })
          this.search_result = []
        }
      } else if (dataIndex === 'user') {
        return (id) => {
          this.search_user_id = id
          const col = this.columns.filter((v) => v.dataIndex === dataIndex)[0]
          col.searching = id
          if (id) {
            console.log(this.search_result)
            const title = this.search_result.filter((v) => v.value === id)[0].text
            col.title = `提交者：${title}`
          } else {
            col.title = '提交者'
          }
          this.fetch({
            pageSize: this.pagination.pageSize,
            page: this.pagination.current,
            user_id: this.search_user_id,
            problem_id: this.search_problem_id
          })
          this.search_result = []
        }
      }
    },
    handleReset () {
      this.search_problem_id = null
    },
    fetch (params = {}) {
      console.log(params)
      this.loading = true
      getSubmissions({
        user_id: params.user_id,
        problem_id: params.problem_id,
        limit: params.pageSize,
        offset: (params.page - 1) * params.pageSize || 0
      }).then(data => {
        const pagination = { ...this.pagination }
        pagination.total = data.total
        this.loading = false
        this.data = data.submissions
        this.pagination = pagination
        if (params.callback) {
          params.callback()
        }
      }).catch(err => {
        console.log(err)
        if (err.response || err.response.message) {
          this.loading = false
          this.data = []
          const pagination = { ...this.pagination }
          pagination.total = 0
          this.pagination = pagination
          this.$error({
            title: '发生错误',
            content: err.response.message + err.response.error
          })
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
