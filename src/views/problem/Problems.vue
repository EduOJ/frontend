<template>
  <a-card title="题目">
    <div slot="extra">
      <a-input v-model="search" placeholder="搜索" @change="handleSearchChange">
        <a-icon slot="prefix" type="search" />
        <a-icon slot="suffix" type="close" @click="() => this.search=''" />
      </a-input>
    </div>
    <a-space v-if="can('create_problem')">
      <router-link :to="{name: 'problem.add'}">
        <a-button>创建题目</a-button>
      </router-link>
    </a-space>
    <p></p>
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
      <template slot="name" slot-scope="text, record">
        <router-link :to="{name: 'problem', params: {id: record.id}}">
          {{ text }}
        </router-link>
      </template>
      <template slot="language_allowed" slot-scope="text">
        <a-tag
          :color="{
            'c': 'green',
            'cpp': 'cyan'
          }[language]"
          v-for="language in text"
          :key="language">
          {{ language }}
        </a-tag>
      </template>
      <template slot="action" slot-scope="text, record" >
        <a-space>
          <router-link :to="{name: 'problem.edit', params: {id: record.id}}">
            <a-button type="default" :disabled="!(can('update_problem') || can('update_problem','problem' , record.id))">
              编辑
            </a-button>
          </router-link>
          <a-button type="danger" @click="handleDeleteBtnClick(record)" :disabled="!(can('delete_problem') || can('delete_problem','problem', record.id))">
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>
    <a-modal
      title="你确定要删除此题目吗?"
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
import { mapGetters } from 'vuex'
import store from '@/store'
import { getProblems, deleteProblem } from '@/api/problem'
import Language from '@/components/Language'
import ResizableTableHeader from '@/components/Table/ResizableTableHeader.js'

export default {
  data () {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 80
      },
      {
        title: '名称',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' }
      },
      {
        title: '语言',
        dataIndex: 'language_allowed',
        scopedSlots: { customRender: 'language_allowed' },
        last: true
      }
    ]

    if (store.getters.can('manage_problem')) {
      delete columns[columns.length - 1].last
      columns.push({
        title: '操作',
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' },
        last: true
      })
    }

    const ResizableTableHeaderWithColumns = (h, props, children) => {
      const draggingMap = {}
      columns.forEach(col => {
        draggingMap[col.dataIndex] = col.width
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
      }
    }
  },
  computed: {
    ...mapGetters(['can'])
  },
  components: {
    Language
  },
  mounted () {
    this.fetch({
      pageSize: this.$refs.table.pagination.pageSize,
      page: this.$refs.table.pagination.current,
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
      this.deleteModelText = `你确认要删除 ${record.name} 吗?`
      this.visible = true
    },
    handleDeleteCancel () {
      this.visible = false
    },
    handleDeleteOk () {
      this.confirmLoading = true
      deleteProblem(this.deleting.id).then((resp) => {
        this.confirmLoading = false
        this.deleteModelText = '删除成功!'
        this.deleting = {}
        this.fetch({
          pageSize: this.$refs.table.pagination.pageSize,
          page: this.$refs.table.pagination.current
        })
        setTimeout(_ => {
          this.visible = false
        }, 500)
      })
    },
    handleSearchChange () {
      this.fetch({
        pageSize: this.$refs.table.pagination.pageSize,
        page: this.$refs.table.pagination.current
      })
    },
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination, filters, sorter)
      this.pagination = pagination
      this.sorter = sorter
      this.fetch({
        pageSize: pagination.pageSize,
        page: pagination.current
      })
    },
    fetch (params = {}) {
      this.loading = true
      getProblems({
        search: this.search,
        limit: params.pageSize,
        offset: (params.page - 1) * params.pageSize || 0
      }).then(data => {
        const pagination = { ...this.pagination }
        pagination.total = data.total
        this.loading = false
        this.data = data.problems
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
