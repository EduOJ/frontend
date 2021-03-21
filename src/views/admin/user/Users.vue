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
      <a-button @click="importUserModal = true">导入用户</a-button>
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
    <a-modal
      title="导入用户"
      :visible="importUserModal"
      :confirm-loading="confirmLoading"
      @ok="importUser"
      @cancel="importUserModal = false"
    >
      <a-textarea
        v-model="importUserText"
        placeholder="顺序：用户名（学号），昵称（姓名），密码，邮箱。
制表符分割。 从excel复制表格后粘贴即可。"
        :auto-size="{ minRows: 3, maxRows: 10000 }"
      />
    </a-modal>
  </a-card>
</template>

<script>
import Vue from 'vue'
import { deleteUser, getUsers, createUser } from '@/api/admin_manage_user'
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
    sorter: true
  },
  {
    title: 'Email',
    dataIndex: 'email',
    sorter: true
  },
  {
    title: '姓名',
    dataIndex: 'nickname',
    sorter: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    last: true
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
      importUserText: '',
      importUserModal: false,
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
    this.fetch({
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
    importUser () {
      const users = []
      for (const u of this.importUserText.split('\n')) {
        users.push({
          username: u.split('\t')[0],
          nickname: u.split('\t')[1],
          password: u.split('\t')[2],
          email: u.split('\t')[3]
        })
      }
      const promises = []
      for (const u of users) {
        promises.push(new Promise((resolve, reject) => {
          createUser(u).then(resp => {
            resolve(resp)
          }).catch(err => {
            err.user = u
            reject(err)
          })
        }))
      }
      Promise.allSettled(promises).then(results => {
        console.log(results)
        let message = ''
        let error = false
        for (const r of results) {
          if (r.status === 'fulfilled') {
            message += `用户${r.value.user.nickname}创建成功\n`
          } else {
            error = true
            message += `用户${r.reason.user.nickname}创建失败: ${r.reason}\n`
          }
        }
        message = message.split('\n').map(m => {
          return (<p style="margin-block-end: 0;"> {m} </p>)
        })
        if (error) {
          this.$error({
            content: (h) => {
              return (
                <div>
                  {message}
                </div>
              )
            }
          })
        } else {
          this.$success({
            content: (h) => {
              return (
                <div>
                  {message}
                </div>
              )
            }
          })
        }
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
        if (params.callback) {
          params.callback()
        }
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
