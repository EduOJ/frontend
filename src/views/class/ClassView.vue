<template>
  <page-header-wrapper
    :title="`${Class.course_name} | ${Class.name}`"
    :tab-list="tabList"
    :tab-active-key="tabActiveKey"
    :breadcrumb="breadcrumb"
    @tabChange="handleTabChange"
  >
    <template v-slot:content>
      <a-row>
        <a-col :lg="8" :md="24">
          <a-descriptions size="small" :column="1">
            <a-descriptions-item label="课程名称">{{ Class.course_name }}</a-descriptions-item>
            <a-descriptions-item label="班级名称">{{ Class.name }}</a-descriptions-item>
          </a-descriptions>
        </a-col>
        <a-col :lg="16" :md="24">
          <a-row>
            <a-col :lg="4" :md="24">
              <h1>课程描述：</h1>
            </a-col>
            <a-col :lg="16" :md="24">
              <markdown :value="Class.description"></markdown>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </template>
    <template v-slot:extra>
      <span class="invite_code_wrapper" v-if="Class.invite_code !== ''">
        邀请码：
        <a-tooltip
          title="复制成功！"
          trigger="none"
          :visible="copyToolipVisible"
          v-clipboard:copy="Class.invite_code"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyFail"
        >
          {{ Class.invite_code }}
        </a-tooltip>
      </span>
      <router-link :to="{name: 'class.edit', params: {classId: id}}" v-if="can_manage_class">
        <a-button>
          信息编辑
        </a-button>
      </router-link>
      <router-link :to="{name: 'class.editStudent', params: {classId: id}}" v-if="can_manage_class">
        <a-button>
          学生管理
        </a-button>
      </router-link>
      <router-link :to="{name: 'class.editProblemSets', params: {classId: id}}" v-if="can_manage_class">
        <a-button>
          作业管理
        </a-button>
      </router-link>
    </template>
    <router-view></router-view>
  </page-header-wrapper>
</template>

<script>
import { getClass } from '@/api/class'
import Markdown from '@/components/Editor/Markdown'
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'ClassView',
  components: {
    Markdown
  },
  data () {
    return {
      tabList: [],
      copyToolipVisible: false,
      id: this.$route.params.classId,
      tabActiveKey: this.$route.meta.tab,
      can_manage_class: this.can('manage_class') || this.can('manage_class', this.$route.params.classId),
      Class: {
        id: '',
        name: '',
        course_name: '',
        description: '',
        invite_code: '',
        managers: [],
        students: [],
        problem_sets: []
      }
    }
  },
  provide () {
    return {
      refreshClass: this.fetch
    }
  },
  mounted () {
    this.fetch()
  },
  computed: {
    breadcrumb () {
      const routes = this.$route.matched.concat().filter(r => !!(r.meta.title)).map(function (route) {
        return {
          path: route.path,
          breadcrumbName: route.meta.title
        }
      })
      console.log({ routes: routes })
      return { props: { routes: routes } }
    }
  },
  methods: {
    ...mapGetters(['can']),
    fetch () {
      getClass(this.id).then(data => {
        data.class.problem_sets.sort((e1, e2) => {
          return moment(e1.end_time).isBefore(moment(e2.end_time))
        })
        this.Class = data.class
        this.$store.commit('SET_CLASS', data.class)
      }).catch(err => {
        console.log(err)
        this.$error({
          content: '获取班级信息时发生了错误 ' + err.message
        })
      })
    },
    handleTabChange (tab) {
      console.log(tab)
    },
    copySuccess () {
      this.copyToolipVisible = true
      setTimeout(() => {
        this.copyToolipVisible = false
      }, 1000)
    },
    copyFail () {
      this.$error({
        content: '复制失败！'
      })
    }
  }
}
</script>

<style lang="sass">
.ant-page-header-heading-extra
  display: flex
  align-items: center
  justify-content: center
  *
    flex: auto
</style>

<style scoped lang="sass">
.invite_code_wrapper
  font-size: 1.7em
  span
    font-weight: bold
    cursor: pointer
</style>
