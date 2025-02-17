<template>
  <a-card>
    <template slot="title">
      查看分数
    </template>
    <template slot="extra" >
      <download-excel
        class="export-excel-wrapper"
        :data="DetailsForm"
        :fields="json_fields"
        :header="title"
        :name="title"
      >
        <a-button>
          一键下载excel
        </a-button>
      </download-excel>
    </template>
    <a-table
      :columns="columns"
      bordered
      :components="components"
      :row-key="problem_sets => problem_sets.id"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      ref="table"
      @change="handleTableChange"
    >
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
import { getClass, getClassGrades } from '@/api/class'
import ResizableTableHeader from '@/components/Table/ResizableTableHeader.js'
import moment from 'moment'

export default {
  data () {
    const columns = [
      {
        title: '学号',
        dataIndex: 'user.username',
        scopedSlots: {
          customRender: 'user.username',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
          width: 180
        },
        sorter: (a, b) => a.user.username - b.user.username,
        sortDirections: ['descend', 'ascend']
      },
      {
        title: '姓名',
        dataIndex: 'user.nickname',
        scopedSlots: {
          customRender: 'user.nickname',
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
          width: 220
        }
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
      classID: this.$route.params.classID,
      className: '',
      now_user_id: this.$store.state.user.info.id,
      problem_sets: [],
      columns: columns,
      components: {
        header: {
          cell: ResizableTableHeaderWithColumns
        }
      },
      title: '',
      json_fields: {
        学号: 'user.username',
        姓名: 'user.nickname'
      },
      DetailsForm: [],
      deleting: {},
      deleteModelText: '',
      visible: false,
      confirmLoading: false,
      data: [],
      pagination: {
        showTotal: (total, range) => `共 ${total} 条数据`
      },
      loading: false,
      sorter: {
        sortField: 'user.username',
        sortOrder: 'ascend'
      }
    }
  },
  mounted () {
    console.log(this.columns)
    getClass(this.classID).then(resp => {
      this.className = resp.class.name
      getClassGrades(this.classID).then(resp => {
      const users = {}
      this.problem_sets = resp.problem_sets
      this.title = `${this.className} 总成绩表格`
      this.problem_sets.forEach((problemset) => {
        problemset.grades.forEach(grade => {
          const username = grade.user.username
            if (!users[username]) {
              users[username] = { user: grade.user }
            }
            users[username][`${problemset.id}`] = grade.total
        })
        this.data = Object.values(users)
      })
      const dynamicColumn = resp.problem_sets.map(item => {
      let _i = 0
        item.problems.forEach(problem => {
          _i++
        })
        _i *= 100
        this.$set(this.json_fields, `${item.name} (总分:${_i})`, item.id.toString())
        return {
          title: `${item.name} (总分:${_i})`,
          dataIndex: item.id
        }
      })
      for (let i = 0; i < dynamicColumn.length; i++) {
        const _index = i + 2
        this.columns.splice(_index, 0, dynamicColumn[i])
      }
      this.DetailsForm = this.data
      this.DetailsForm.sort((a, b) => a.user.username - b.user.username)
    }).catch(err => {
      this.$error({
        title: '发生错误',
        content: err.response.message + err.response.error
      })
    })
    }).catch(err => {
      this.$error({
        title: '发生错误',
        content: err.response.message + err.response.error
      })
   })
  },
  watch: {
    '$route' (r) {
      this.search_user_id = this.$route.query && +this.$route.query.user_id || null
    }
  },
  methods: {
    format (time) {
      return moment(time).format('lll')
    },
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.pagination = pagination
      this.sorter = sorter
    }
  }
}
</script>
