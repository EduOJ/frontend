<template>
  <page-header-wrapper
    :title="`${Class.course_name} | ${Class.name}`"
    :tab-list="tabList"
    :tab-active-key="tabActiveKey"
    :breadcrumb="breadcrumb"
    class="class-wrapper"
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
      <span class="invite_code_wrapper" v-if="Class.invite_code">
        邀请码：
        <a-tooltip
          title="复制成功！"
          trigger="none"
          :visible="copyTooltipVisible"
          v-clipboard:copy="Class.invite_code"
          v-clipboard:success="copySuccess"
          v-clipboard:error="copyFail"
        >
          {{ Class.invite_code }}
        </a-tooltip>
      </span>
      <router-link :to="{name: 'class.edit', params: {classID: id}}" v-if="can_manage_class">
        <a-button>
          信息编辑
        </a-button>
      </router-link>
      <router-link :to="{name: 'class.editStudent', params: {classID: id}}" v-if="can_manage_class">
        <a-button>
          学生管理
        </a-button>
      </router-link>
      <router-link :to="{name: 'class.editProblemSets', params: {classID: id}}" v-if="can_manage_class">
        <a-button>
          作业管理
        </a-button>
      </router-link>
    </template>
    <div class="content">
      <router-view></router-view>
    </div>
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
      tabList: [
        { key: 'class.dashboard', tab: '主页' },
        { key: 'class.problemSets', tab: '作业' }
      ],
      copyTooltipVisible: false,
      id: this.$route.params.classID,
      can_manage_class: (!!this.can()('manage_class') || !!this.can()('manage_class', this.$route.params.classID)),
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
      const routes = this.$route.matched.concat().filter(r => !!(r.meta.title)).map(route => {
        if (route.path === '/dummy2') {
          return {
            path: '/class/' + this.id,
            breadcrumbName: route.meta.title
          }
        }
        return {
          path: route.path,
          breadcrumbName: route.meta.title
        }
      })
      return { props: { routes: routes, itemRender: this.breadcrumbRender } }
    },
    tabActiveKey () {
      return this.$route.name
    }
  },
  methods: {
    ...mapGetters(['can']),
    breadcrumbRender ({ route, params, routes }) {
      console.log(route)
      return routes.indexOf(route) === routes.length - 1 && (
        <span>{route.breadcrumbName}</span>
      ) || (
        <router-link to={{ path: route.path || '/', params }}>{route.breadcrumbName}</router-link>
      )
    },
    fetch () {
      getClass(this.id).then(data => {
        data.class.problem_sets = data.class.problem_sets.map(p => {
          p.end_time = moment(p.end_time)
          p.start_time = moment(p.start_time)
          return p
        })
        data.class.problem_sets.sort((e1, e2) => {
          return e1.end_time.isBefore(e2.end_time) ? -1 : 1
        })
        console.log(data.class)
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
      this.$router.push({
        name: tab,
        params: this.$route.params
      })
    },
    copySuccess () {
      this.copyTooltipVisible = true
      setTimeout(() => {
        this.copyTooltipVisible = false
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

<style scoped lang="sass">
.class-wrapper
  ::v-deep
    .ant-page-header-heading-extra
      display: flex
      align-items: center
      justify-content: center
      *
        flex: auto
.content
  min-height: 500px
.invite_code_wrapper
  font-size: 1.7em
  span
    font-weight: bold
    cursor: pointer
</style>
