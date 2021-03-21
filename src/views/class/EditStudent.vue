<template>
  <a-row>
    <a-col span="18" offset="3">
      <a-skeleton :loading="loading">
        <a-card title="学生管理" v-if="!loading">
          <div class="student-tool-bar">
            <a-button type="primary" @click="addStudent">
              <a-icon type="usergroup-add" />
              添加学生
            </a-button>
            <a-button type="primary" @click="bulkAddStudentModal = true">
              <a-icon type="usergroup-add" />
              批量添加
            </a-button>
            <a-button @click="selected = []">
              <a-icon type="export" />
              导出选中学生的成绩(功能开发中)
            </a-button>
            <div class="space"></div>
            <a-button type="danger" @click="deleteStudent(selected)">
              <a-icon type="delete" />
              移除学生
            </a-button>
            <a-button>4</a-button>
          </div>
          <a-list :data-source="klass.students">
            <a-list-item slot="renderItem" slot-scope="student">
              <a-checkbox @change="selectStudent(student, $event)" :checked="selected.includes(student)" style="margin-right: 10px"/>
              <a-list-item-meta
                :description="student.nickname"
              >
                <template slot="title">{{ `#${student.id} ${student.username}` }}</template>
                <avatar slot="avatar" :user="student"></avatar>
              </a-list-item-meta>
              <div slot="extra">
                <a-button type="link">
                  查看分数（功能开发中）
                </a-button>
                <router-link :to="{name: 'submissions', query: {user_id: student.id}}">
                  <a-button type="link">
                    查看做题情况
                  </a-button>
                </router-link>
                <a-button type="link" style="color: #E23c39;" @click="deleteStudent([student])">
                  删除
                </a-button>
              </div>
            </a-list-item>
          </a-list>
          <div class="student-tool-bar">
            <a-button @click="selectAll">
              全选
            </a-button>
            <a-button @click="selected = []">
              <a-icon type="close" />
              清除选择
            </a-button>
            <div class="space"></div>
          </div>
        </a-card>
      </a-skeleton>
    </a-col>

    <a-modal
      title="添加用户"
      :visible="addStudentModal"
      :okButtonProps="{props:{loading: addStudentLoading}}"
      @ok="confirmAddStudent()"
      @cancel="addStudentModal = false"
    >
      <a-space direction="vertical" style="width: 100%">
        <a-select
          ref="select"
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
          <a-select-option v-for="d in search_result" v-if="!d.hidden" :key="d.value">
            {{ d.text }}
          </a-select-option>
        </a-select>
      </a-space>
    </a-modal>
    <a-modal
      title="批量添加"
      :visible="bulkAddStudentModal"
      :okButtonProps="{props:{loading: bulkAddStudentLoading}}"
      @ok="confirmBulkAddStudent()"
      @cancel="bulkAddStudentModal = false"
    >
      搜索：
      <a-textarea
        v-model="bulkAddStudentText"
        placeholder="用户名（学号）或id，一行一个"
        :auto-size="{ minRows: 3, maxRows: 10000 }"
      />
      <a-button @click="searchUsers" :loading="bulkAddStudentLoading">批量搜索</a-button>

      <div>
        搜索结果:
        <div v-if="bulkAddStudentSelected.length !== 0">
          <p :key="v.id" v-for="v in bulkAddStudentSelected">
            {{ `#${v.id} ${v.username} ${v.nickname}` }}
          </p>
        </div>
        <p v-else>
          结果为空
        </p>
      </div>
    </a-modal>
  </a-row>
</template>

<script>
import Avatar from '@/components/Avatar'
import { mapGetters } from 'vuex'
import { getUsers, getUser } from '@/api/user'
import { addStudents, deleteStudents } from '@/api/class'

export default {
  methods: {
    confirmBulkAddStudent () {
      this.bulkAddStudentLoading = true
      addStudents(this.klass.id, this.bulkAddStudentSelected.map(u => u.id)).then(resp => {
        this.refreshClass()
        this.bulkAddStudentLoading = false
        this.$success({
          content: '学生添加成功！',
          onOk: () => {
            this.bulkAddStudentSelected = []
            this.bulkAddStudentModal = false
          }
        })
      }).catch(err => {
        this.bulkAddStudentLoading = false
        console.log(err)
        this.$error({
          content: '学生添加失败！' + err.message
        })
      })
    },
    async searchUsers () {
      this.bulkAddStudentLoading = true
      for (const u of this.bulkAddStudentText.split('\n')) {
        try {
          const result = await getUser(u)
          if (this.klass.students.indexOf(result.user) === -1) {
            this.bulkAddStudentSelected.push(result.user)
          }
        } catch (err) {
          this.$error({
            content: `搜索${u}时遇到错误: ${err}`
          })
        }
      }
      this.bulkAddStudentLoading = false
      this.bulkAddStudentText = ''
    },
    selectStudent (stu, e) {
      if (e.target.checked) {
        this.selected.push(stu)
      } else {
        this.selected.splice(this.selected.indexOf(stu), 1)
      }
    },
    selectAll () {
      this.selected = []
      for (const u of this.klass.students) {
        this.selected.push(u)
      }
    },
    deleteStudent (students) {
      if (students.length === 0) {
        this.$error({
          content: '请至少选择一个学生'
        })
        return
      }
      this.$confirm({
        content: '确定删除吗？',
        onOk: () => {
          deleteStudents(this.klass.id, students.map(s => s.id)).then(resp => {
            this.refreshClass()
            this.$success({
              content: '删除成功！'
            })
          }).catch(err => {
            console.error(err)
            this.$error({
              content: '遇到错误：' + err.message
            })
          })
        }
      })
    },
    searchUserChange (val) {
      console.log('CHANGE', val)
      this.search_value = val
    },
    searchUser (text) {
      getUsers({
        offset: 0,
        limit: 5,
        search: text
      }).then(data => {
        this.search_result = data.users.filter(v => {
          return this.klass.students.indexOf(v) === -1
        }).map((v) => {
          return {
            value: v.id,
            text: `#${v.id} ${v.username} ${v.nickname}`
          }
        })
      })
    },
    addStudent () {
      this.addStudentModal = true
    },
    confirmAddStudent () {
      this.addStudentLoading = true
      addStudents(this.klass.id, this.search_value).then(resp => {
        this.refreshClass()
        this.addStudentLoading = false
        this.$success({
          content: '学生添加成功！',
          onOk: () => {
            this.search_value = []
            this.addStudentModal = false
          }
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
      bulkAddStudentText: '',
      bulkAddStudentSelected: [],
      bulkAddStudentOptions: [],
      bulkAddStudentLoading: false,
      selected: [],
      search_value: [],
      search_result: [],
      addStudentLoading: false,
      addStudentModal: false,
      bulkAddStudentModal: false,
      klass: {
        students: []
      }
    }
  },
  watch: {
    storeClass: {
      handler (val) {
        if (val) {
          this.selected = []
          this.search_value = []
          this.search_result = []
          this.loading = false
          this.klass = val
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
.student-tool-bar
  display: flex
  width: 100%
  :not(:last-child)
    margin-right: 10px
  .space
    flex: 1
</style>
