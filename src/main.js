// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import i18n from './locales'
import { VueAxios } from './utils/request'
import ProLayout, { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import themePluginConfig from '../config/themePluginConfig'
import { FormModel, Space } from 'ant-design-vue'
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import VueClipboard from 'vue-clipboard2'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'

import bootstrap from './core/bootstrap'
import './core/lazy_use'
import './permission' // permission control
import './utils/filter' // global filter
import './global.less'

import JsonExcel from 'vue-json-excel'

// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
Vue.component('downloadExcel', JsonExcel)

// Vue.use(ElementUI)

Vue.config.productionTip = false

// mount axios to `Vue.$http` and `this.$http`
Vue.use(VueAxios)
Vue.use(FormModel)
Vue.use(Space)
Vue.use(VueClipboard)

Vue.use(PerfectScrollbar)
Vue.component('pro-layout', ProLayout)
Vue.component('page-header-wrapper', PageHeaderWrapper)

window.umi_plugin_ant_themeVar = themePluginConfig.theme
bootstrap()
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
