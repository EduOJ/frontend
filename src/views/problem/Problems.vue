<template>
  <a-card title="题目">
    <div slot="extra">
      <a-space>
        <a-checkbox v-model="tried" @change="checkboxChange('tried')($event)" ref="tried">
          我试过的
        </a-checkbox>
        <a-checkbox v-model="passed" @change="checkboxChange('passed')($event)" ref="passed">
          我通过的
        </a-checkbox>
        <a-input v-model="search" placeholder="搜索" @change="handleSearchChange">
          <a-icon slot="prefix" type="search" />
          <a-icon slot="suffix" type="close" @click="() => {this.search=''; handleSearchChange()}" />
        </a-input>
      </a-space>
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
      :customRow="customRow"
      ref="table"
      @change="handleTableChange"
    >
      <div
        slot="tagFilterDropdown"
        style="padding: 8px"
      >
        <a-row>
          <a-select
            size="small"
            mode="tags"
            placeholder="标签"
            v-model="searchingTags"
            style="width: 200px;margin-bottom: 5px"
          >
          </a-select>
        </a-row>
        <a-row type="flex" justify="space-around">
          <a-button
            type="primary"
            icon="search"
            size="small"
            @click="() => {
              updateRoute(); fetch()}"
          >
            搜索
          </a-button>
          <a-button icon="close" size="small" @click="() => {this.searchingTags = [];updateRoute(); fetch()}">
            清空
          </a-button>
        </a-row>
      </div>
      <template slot="name" slot-scope="text, record">
        <router-link :to="{name: 'problem', params: {id: record.id}}">
          {{ text }}
        </router-link>
      </template>
      <template slot="tags" slot-scope="text">
        <a-tag style="cursor: pointer" :key="tag" v-for="tag in text" @click="addTag(tag)" :color="searchingTags.indexOf(tag) !== -1 ? 'green' : 'orange'">
          {{ tag }}
        </a-tag>
      </template>
      <template slot="language_allowed" slot-scope="text">
        <Language
          v-for="language in text"
          :key="language"
          :language="language">
        </Language>
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
import languageConf from '@/config/languageConf'

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
        title: '标签',
        dataIndex: 'tags',
        scopedSlots: { customRender: 'tags', filterDropdown: 'tagFilterDropdown' }
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
      languageConf,
      columns,
      components: {
        header: {
          cell: ResizableTableHeaderWithColumns
        }
      },
      searchingTags: this.$route.query && this.$route.query.tags && this.$route.query.tags.split(',') || [],
      tried: this.$route.query && this.$route.query.tried === 'true' || false,
      passed: this.$route.query && this.$route.query.passed === 'true' || false,
      deleting: this.$route.query && this.$route.query.tags && this.$route.query.tags.split(',') || [],
      deleteModelText: '',
      visible: false,
      confirmLoading: false,
      data: [],
      search: this.$route.query && this.$route.query.search || '',
      pagination: {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [
          '20',
          '50',
          '100'
        ],
        current: this.$route.query && +this.$route.query.page || 1,
        pageSize: this.$route.query && +this.$route.query.pageSize || 50,
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
  watch: {
    $route (r) {
      this.tried = this.$route.query && this.$route.query.tried === 'true' || false
      this.passed = this.$route.query && this.$route.query.passed === 'true' || false
      this.searchingTags = this.$route.query && this.$route.query.tags && this.$route.query.tags.split(',') || []
      this.pagination.pageSize = this.$route.query && +this.$route.query.pageSize || 50
      this.pagination.current = this.$route.query && +this.$route.query.page || 1
      this.search = this.$route.query && this.$route.query.search || ''
      this.fetch()
    }
  },
  methods: {
    addTag (tag) {
      if (this.searchingTags.indexOf(tag) === -1) {
        this.searchingTags.push(tag)
        this.updateRoute()
        this.fetch()
      } else {
        this.searchingTags.splice(this.searchingTags.indexOf(tag), 1)
        this.updateRoute()
        this.fetch()
      }
    },
    customRow (record) {
      return {
        className: record.passed ? 'passed-problem-row' : null
      }
    },
    updateRoute () {
      const params = {
        tried: this.tried,
        passed: this.passed,
        pageSize: this.pagination.pageSize,
        page: this.pagination.current,
        tags: this.searchingTags.join(','),
        search: this.search
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
    },
    checkboxChange (name) {
      return e => {
        if (this.tried && this.passed) {
          switch (name) {
            case 'tried':
              this.passed = false
              break
            case 'passed':
              this.tried = false
              break
          }
        }
        this.updateRoute()
        this.fetch()
      }
    },
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
        this.fetch()
        setTimeout(_ => {
          this.visible = false
        }, 500)
      })
    },
    handleSearchChange () {
      this.updateRoute()
      this.fetch()
    },
    handleTableChange (pagination, filters, sorter) {
      console.log(pagination)
      this.pagination = pagination
      this.sorter = sorter
      this.updateRoute()
      this.fetch()
    },
    fetch (params = {}) {
      this.loading = true
      getProblems({
        search: this.search,
        limit: this.pagination.pageSize,
        offset: (this.pagination.current - 1) * this.pagination.pageSize || 0,
        user_id: this.$store.state.user.info.id || null,
        tried: this.$store.state.user.info.id && this.tried,
        passed: this.$store.state.user.info.id && this.passed,
        tags: this.searchingTags.join(',')
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

<style lang="scss">
.passed-problem-row{
  background-color: #f8feef
}
</style>
