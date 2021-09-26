<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <div class="avatar">
          <avatar :size="72" :user="user"/>
        </div>
        <div class="content">
          <div class="content-title">
            {{ timeFix }}，{{ user.nickname }}<span class="welcome-text">，欢迎您。</span>
          </div>
          <del>今天你做题了吗？</del>
        </div>
      </div>
    </template>
    <template v-slot:extraContent>
      <div class="extra-content" v-if="!user.isGuest">
        <div class="stat-item">
          <a-statistic title="通过的题目" :value="passed_count" />
        </div>
        <div class="stat-item">
          <a-statistic title="尝试但没通过的题目" :value="tried_count" />
        </div>
      </div>
    </template>

    <div>
      <a-row :gutter="24">
        <a-col :xl="class_taking.length + class_managing.length === 0 ? 24 : 16" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card
            class="problem_set-list"
            style="margin-bottom: 24px;"
            :bordered="false"
            title="我的作业"
            v-if="!user.isGuest"
            :body-style="{ padding: 0 }">
            <div>
              <a-card-grid class="problem_set-card-grid">
                <a-card :bordered="false" :body-style="{ padding: 0 }">
                  <a-card-meta>
                    <div slot="title" class="card-title">
                      <a>作业</a>
                    </div>
                    <div slot="description" class="card-description">
                      作业描述
                      这里会展示所有作业
                      功能还在开发中......
                    </div>
                  </a-card-meta>
                  <div class="problem_set-item">
                    <span class="datetime">作业时间</span>
                  </div>
                </a-card>
              </a-card-grid>
            </div>
          </a-card>

          <a-card :loading="problem_loading" :bordered="false">
            <template slot="title">
              随机题目： {{ problem.name }}
            </template>
            <template slot="extra">
              <router-link :to="{name: 'problem', params: {id: problem.id}}">
                <a-button>
                  前往做题
                </a-button>
              </router-link>
            </template>
            <h2>#{{ problem.id }} {{ problem.name }}</h2>
            <a-skeleton active :loading="problem_loading">
              <markdown v-model="problem.description">
              </markdown>
            </a-skeleton>
          </a-card>
        </a-col>
        <a-col
          :xl="8"
          :lg="24"
          :md="24"
          :sm="24"
          :xs="24">
          <a-card
            title="我在的班级"
            class="class-card"
            :bordered="false"
            v-if="class_taking.length !== 0"
            style="margin-bottom: 24px;">
            <a-list item-layout="horizontal" :data-source="class_taking">
              <a-list-item slot="renderItem" slot-scope="klass">
                <router-link :to="{'name':'class.dashboard', params: {classID: klass.id}}" style="color: rgba(0, 0, 0, 0.65)">
                  <a-list-item-meta>
                    <span slot="title">
                      {{ klass.course_name }}
                    </span>
                  </a-list-item-meta>
                  {{ klass.name }}
                </router-link>
              </a-list-item>
            </a-list>
          </a-card>
          <a-card
            class="class-card"
            bordered
            title="我管理的班级"
            v-if="class_managing.length !== 0">
            <a-list item-layout="horizontal" :data-source="class_managing">
              <a-list-item slot="renderItem" slot-scope="klass">
                <router-link :to="{'name':'class.dashboard', params: {classID: klass.id}}" style="color: rgba(0, 0, 0, 0.65)">
                  <a-list-item-meta>
                    <span slot="title">
                      {{ klass.course_name }}
                    </span>
                  </a-list-item-meta>
                  {{ klass.name }}
                </router-link>
              </a-list-item>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </page-header-wrapper>
</template>

<script>
import { timeFix } from '@/utils/util'
import { mapState } from 'vuex'
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import { getClassManaging, getClassTaking } from '@/api/class'
import { getUserProblemInfo } from '@/api/user'
import { getProblem } from '@/api/problem'
import Markdown from '@/components/Editor/Markdown'
import Avatar from '@/components/Avatar'

export default {
  name: 'Home',
  components: {
    PageHeaderWrapper,
    Markdown,
    Avatar
  },
  data () {
    return {
      timeFix: timeFix(),
      class_managing: [],
      class_taking: [],
      passed_count: '加载中',
      tried_count: '加载中',
      problem: {},
      problem_loading: true
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.user.info
    })
  },
  mounted () {
    if (!this.user.isGuest) {
      const p = [getClassManaging(), getClassTaking()]
      Promise.all(p).then(data => {
        console.log(data)
        this.class_managing = data[0].classes
        this.class_taking = data[1].classes
      }).catch(err => {
        console.log(err)
        this.$error({
          content: '获取班级信息时发生了错误'
        })
      })
      getUserProblemInfo(this.user.id).then(resp => {
        this.passed_count = resp.passed_count
        this.tried_count = resp.tried_count
      }).catch(err => {
        console.log(err)
        this.$error({
          content: '获取做题信息时发生了错误'
        })
      })
    }
    getProblem('random').then(resp => {
      this.problem = resp.problem
      this.problem_loading = false
    }).catch(err => {
      console.log(err)
      this.$error({
        content: '获取随机题目时发生了错误'
      })
    })
  },
  methods: {
  }
}
</script>

<style lang="sass">

</style>

<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';

  .text-overflow() {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-all;
  }

  // mixins for clearfix
  // ------------------------
  .clearfix() {
    zoom: 1;
    &::before,
    &::after {
      display: table;
      content: ' ';
    }
    &::after {
      clear: both;
      height: 0;
      font-size: 0;
      visibility: hidden;
    }
  }

  .page-header-content {
    display: flex;

    .avatar {
      flex: 0 1 72px;

      & > span {
        display: block;
        width: 72px;
        height: 72px;
        border-radius: 72px;
      }
    }

    .content {
      position: relative;
      top: 4px;
      flex: 1 1 auto;
      margin-left: 24px;
      color: @text-color-secondary;
      line-height: 22px;

      .content-title {
        margin-bottom: 12px;
        color: @heading-color;
        font-weight: 500;
        font-size: 20px;
        line-height: 28px;
      }
    }
  }

  .extra-content {
    .clearfix();
    float: right;
    white-space: nowrap;

    .stat-item {
      position: relative;
      display: inline-block;
      padding: 0 32px;

      > p:first-child {
        margin-bottom: 4px;
        color: @text-color-secondary;
        font-size: @font-size-base;
        line-height: 22px;
      }

      > p {
        margin: 0;
        color: @heading-color;
        font-size: 30px;
        line-height: 38px;

        > span {
          color: @text-color-secondary;
          font-size: 20px;
        }
      }

      &::after {
        position: absolute;
        top: 8px;
        right: 0;
        width: 1px;
        height: 40px;
        background-color: @border-color-split;
        content: '';
      }

      &:last-child {
        padding-right: 0;

        &::after {
          display: none;
        }
      }
    }
  }

  .problem_set-list {

    .card-title {
      font-size: 0;

      a {
        color: rgba(0, 0, 0, 0.85);
        margin-left: 12px;
        line-height: 24px;
        height: 24px;
        display: inline-block;
        vertical-align: top;
        font-size: 14px;

        &:hover {
          color: #1890ff;
        }
      }
    }

    .card-description {
      color: rgba(0, 0, 0, 0.45);
      height: 44px;
      line-height: 22px;
      overflow: hidden;
    }

    .problem_set-item {
      display: flex;
      margin-top: 8px;
      overflow: hidden;
      font-size: 12px;
      height: 20px;
      line-height: 20px;

      a {
        color: rgba(0, 0, 0, 0.45);
        display: inline-block;
        flex: 1 1 0;

        &:hover {
          color: #1890ff;
        }
      }

      .datetime {
        color: rgba(0, 0, 0, 0.25);
        flex: 0 0 auto;
        float: right;
      }
    }

    .ant-card-meta-description {
      color: rgba(0, 0, 0, 0.45);
      height: 44px;
      line-height: 22px;
      overflow: hidden;
    }
  }

  .item-group {
    padding: 20px 0 8px 24px;
    font-size: 0;

    a {
      color: rgba(0, 0, 0, 0.65);
      display: inline-block;
      font-size: 14px;
      margin-bottom: 13px;
      width: 25%;
    }
  }
</style>
