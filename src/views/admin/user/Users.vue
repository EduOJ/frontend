<template>
  <a-card title="用户管理">
    <div slot="extra">
      <a-input ref="userNameInput" v-model="search" placeholder="搜索" @change="handleSearchChange">
        <a-icon slot="prefix" type="search" />
        <a-icon slot="suffix" type="close" @click="() => this.search=''" />
      </a-input>
    </div>
    <a-space>
      <router-link :to="{name: 'admin.user.add'}">
        <a-button>添加用户</a-button>
      </router-link>
      <a-button>导入用户</a-button>
      <a-button>导出用户</a-button>
    </a-space>
    <p></p>
    <a-table
      :columns="columns"
      bordered
      :components="components"
      :row-key="user => user.id"
      :data-source="data"
      :pagination="pagination"
      :loading="loading"
      ref="table"
      @change="handleTableChange"
    >
      <template slot="action" slot-scope="text, record" >
        <a-space>
          <router-link :to="{name: 'admin.user.edit', params: {id: record.id}}">
            <a-button type="default">
              编辑
            </a-button>
          </router-link>
          <a-button type="danger" @click="handleDeleteBtnClick(record)">
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>
    <a-modal
      title="你确定要删除此用户吗?"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleDeleteOk"
      @cancel="handleDeleteCancel"
    >
      <p>{{ deleteModelText }}</p>
    </a-modal>
  </a-card>
</template>

<script>
import Vue from 'vue'
import { deleteUser, getUsers } from '@/api/admin_manage_user'
import ResizableTableHeader from '@/components/Table/ResizableTableHeader.js'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    sorter: true,
    defaultSortOrder: 'ascend',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'username',
    sorter: true,
    width: 200
  },
  {
    title: 'Email',
    dataIndex: 'email',
    sorter: true,
    width: 200
  },
  {
    title: '姓名',
    dataIndex: 'nickname',
    sorter: true,
    width: 200
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
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
      deleting: {},
      deleteModelText: '',
      visible: false,
      confirmLoading: false,
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
      columns
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    handleDeleteBtnClick (record) {
      this.deleting = record
      this.deleteModelText = `你确认要删除 ${record.username} 吗?`
      this.visible = true
    },
    handleDeleteCancel () {
      this.visible = false
    },
    handleDeleteOk () {
      this.confirmLoading = true
      deleteUser(this.deleting.id).then((resp) => {
        this.confirmLoading = false
        this.deleteModelText = '删除成功!'
        this.deleting = {}
        setTimeout(_ => {
          this.visible = false
          this.fetch({
            pageSize: this.$refs.table.pagination.pageSize,
            page: this.$refs.table.pagination.current,
            sortField: this.sorter.field,
            sortOrder: this.sorter.order
          })
        }, 500)
      })
    },
    handleSearchChange () {
      this.fetch({
        pageSize: this.$refs.table.pagination.pageSize,
        page: this.$refs.table.pagination.current,
        sortField: this.sorter.field,
        sortOrder: this.sorter.order
      })
    },
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.pagination = pagination
      this.sorter = sorter
      this.fetch({
        pageSize: pagination.pageSize,
        page: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order
      })
    },
    fetch (params = {}) {
      this.loading = true
      getUsers({
        search: this.search,
        limit: params.pageSize,
        offset: (params.page - 1) * params.pageSize || 0,
        order_by: (params.sortField || 'id') + '.' + (((params.sortOrder || 'ascend') === 'ascend') ? 'ASC' : 'DESC')
      }).then(data => {
        const pagination = { ...this.pagination }
        pagination.total = data.total
        this.loading = false
        this.data = data.users
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
