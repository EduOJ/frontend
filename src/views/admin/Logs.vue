<template>
  <a-card title="日志查看">
    <a-table
      :columns="columns"
      bordered
      :components="components"
      :row-key="record => record.id"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      ref="table"
      @change="handleTableChange"
    >
      <template slot="level" slot-scope="text" >
        <a-tag
          :color="['blue',
                   'geekblue',
                   'gold',
                   'red',
                   'purple'][text]"
        >
          {{ [
            '调试',
            '提醒',
            '警告',
            '错误',
            '致命'
          ][text] }}
        </a-tag>
      </template>
      <template slot="caller" slot-scope="caller">
        {{ caller.replace("github.com/leoleoasd/EduOJBackend/", "") }}
      </template>
      <template slot="created_at" slot-scope="time">
        {{ (new Date(time)).toLocaleString() }}
      </template>
    </a-table>
  </a-card>
</template>

<script>
import Vue from 'vue'
import { getLogs } from '@/api/admin_logs'
import ResizableTableHeader from '@/components/Table/ResizableTableHeader.js'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    defaultSortOrder: 'ascend',
    width: 80
  },
  {
    title: '等级',
    dataIndex: 'level',
    scopedSlots: { customRender: 'level' },
    filters: [
      {
        text: '调试',
        value: '0'
      },
      {
        text: '提醒',
        value: '1'
      },
      {
        text: '警告',
        value: '2'
      },
      {
        text: '错误',
        value: '3'
      },
      {
        text: '致命',
        value: '4'
      }
    ],
    width: 80
  },
  {
    title: '位置',
    dataIndex: 'caller',
    scopedSlots: { customRender: 'caller' },
    width: 280
  },
  {
    title: '信息',
    dataIndex: 'message',
    width: 600
  },
  {
    title: '时间',
    dataIndex: 'created_at',
    scopedSlots: {
      customRender: 'created_at'
    }
  }
]

const ResizableTableHeaderWithColumns = (h, props, children) => {
  const draggingMap = {}
  columns.forEach(col => {
    draggingMap[col.dataIndex] = col.width
  })
  const draggingState = Vue.observable(draggingMap)
  return ResizableTableHeader(h, props, children, columns, draggingState)
}

export default {
  data () {
    return {
      components: {
        header: {
          cell: ResizableTableHeaderWithColumns
        }
      },
      data: [],
      search: '',
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [
          '20',
          '50',
          '100'
        ],
        defaultPageSize: 50,
        pageSize: 50,
        showTotal: (total, range) => `共 ${total} 条数据, 正在显示 ${range[0]} - ${range[1]} 条`
      },
      loading: false,
      columns
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.pagination = pagination
      this.sorter = sorter
      this.fetch({
        pageSize: pagination.pageSize,
        page: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        levels: filters.level
      })
    },
    fetch (params = {}) {
      this.loading = true
      getLogs({
        limit: params.pageSize,
        offset: (params.page - 1) * params.pageSize || 0,
        levels: (params.levels || []).join(',')
      }).then(data => {
        const pagination = { ...this.pagination }
        pagination.total = data.total
        this.loading = false
        this.data = data.logs
        this.pagination = pagination
      }).catch(err => {
        if (err.response || err.response.message) {
          this.loading = false
          this.data = []
          const pagination = { ...this.pagination }
          pagination.total = 0
          this.pagination = pagination
          this.$error({
            title: '发生错误',
            content: err.response.message
          })
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
