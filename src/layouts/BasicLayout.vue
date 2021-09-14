<template>
  <pro-layout
    :title="title"
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :logo="logoRender"
    :i18nRender="i18nRender"
    v-bind="settings"
  >
    <template v-slot:rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :theme="settings.theme" :user="user"/>
    </template>
    <template v-slot:footerRender>
      <global-footer />
    </template>
    <router-view />
  </pro-layout>
</template>

<script>
import { SettingDrawer } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'
import config from '@/config/config'

import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import LogoSvg from '../assets/logo.svg?inline'
import store from '@/store'
// import { mapState } from 'vuex'

export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    RightContent,
    GlobalFooter
  },
  data () {
    return {
      title: config.title,
      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      settings: {
        // 布局类型
        layout: 'topmenu', // 'sidemenu', 'topmenu'
        // 定宽: true / 流式: false
        contentWidth: 'Fixed',
        // 主题 'dark' | 'light'
        theme: 'light',
        // 主色调
        primaryColor: '#1890ff',
        fixedHeader: false,
        fixSiderbar: false,
        colorWeak: false,

        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user.info
    }
  },
  created () {
    store.dispatch('GetInfo').then(data => {
      store.commit('SET_INFO', data)
      const routes = this.$router.options.routes
      const menus = (routes[0] && routes[0].children) || []
      const filter = (menu) => {
        if (menu.meta && menu.meta.permission) {
          if (!this.$store.getters.can(menu.meta.permission, menu.meta.target, -1)) {
            return null
          }
        }
        if (menu.hidden) return null
        let copy = Object.assign({}, menu)
        if (menu.children) {
          copy.children = []
          menu.children.forEach((menu) => {
            const t = filter(menu)
            if (t) {
              copy.children.push(t)
            }
          })
          if (copy.children.length === 0 && (copy.component.name || copy.component.name === 'RouteView')) {
            return null
          }
          if (copy.children.length === 1) {
            console.log(JSON.parse(JSON.stringify(copy)))
            console.log(JSON.parse(JSON.stringify(copy.children[0])))
            copy.path = copy.children[0].path
            copy.meta.title = copy.children[0].meta.title
            copy = Object.assign(copy, copy.children[0])
            copy.meta.icon = menu.meta.icon
            copy.children = null
          }
        }
        return copy
      }
      this.menus = []
      menus.forEach((menu) => {
        const filtered = filter(menu)
        if (filtered) {
          this.menus.push(filtered)
        }
      })

      this.$watch('collapsed', () => {
        this.$store.commit(SIDEBAR_TYPE, this.collapsed)
      })
      this.$watch('isMobile', () => {
        this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
      })
    })
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }
  },
  methods: {
    i18nRender,
    handleMediaQuery (val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = false
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse (val) {
      this.collapsed = val
    },
    handleSettingChange ({ type, value }) {
      console.log('type', type, value)
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value === 'Fixed'
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = false
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = true
          }
          break
      }
    },
    logoRender () {
      return <LogoSvg />
    }
  }
}
</script>

<style lang="less">
@import "./BasicLayout.less";
//.ant-pro-basicLayout-content{
//  margin:0
//}
.ant-layout-content{
  display: flex;
  align-items: stretch;
}
.ant-pro-basicLayout-children-content-wrap{
  width: 100%;
}
.ant-pro-grid-content.wide{
  margin: 0;
  max-width: 100%;
}
.ant-menu-item{
  height: @layout-header-height;
}
</style>
