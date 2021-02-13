import router from './router'
import store from '@/store'
// import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
// import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
// import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// const whiteList = ['login', 'register', 'registerResult', 'dashboard.workplace'] // no redirect whitelist
const loginRoutePath = '/user/auth'
const defaultRoutePath = '/dashboard/workplace'

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`))
  /* has token */
  console.log(to)

  if (to.path === loginRoutePath) {
    next({ path: defaultRoutePath })
    NProgress.done()
  } else {
    store.dispatch('GetInfo').then(() => {
      if (to.meta && to.meta.permission) {
        if (store.state.user && store.state.user.info && store.state.user.info.roles) {
          if (store.getters.can(to.meta.permission, to.meta.target, to.params.id)) {
            next()
          } else {
            next({ name: 'Exception403' })
          }
        } else {
          if (store.state.user && store.state.user.info && store.state.user.info.roles) {
            if (store.getters.can(to.meta.permission, to.meta.target, to.params.id)) {
              next()
              NProgress.done()
            } else {
              next({ name: 'Exception403' })
              NProgress.done()
            }
          } else {
            next({ name: 'login' })
            NProgress.done()
          }
        }
      } else {
        next()
        NProgress.done()
      }
    })

    // // check auth user.roles is null
    // if (store.getters.roles.length === 0) {
    //   // request auth userInfo
    //   store
    //     .dispatch('GetInfo')
    //     .then(res => {
    //       const roles = res.result && res.result.role
    //       // generate dynamic router
    //       store.dispatch('GenerateRoutes', { roles }).then(() => {
    //         // 根据roles权限生成可访问的路由表
    //         // 动态添加可访问路由表
    //         router.addRoutes(store.getters.addRouters)
    //         // 请求带有 redirect 重定向时，登录自动重定向到该地址
    //         const redirect = decodeURIComponent(from.query.redirect || to.path)
    //         if (to.path === redirect) {
    //           // set the replace: true so the navigation will not leave a history record
    //           next({ ...to, replace: true })
    //         } else {
    //           // 跳转到目的路由
    //           next({ path: redirect })
    //         }
    //       })
    //     })
    //     .catch(() => {
    //       notification.error({
    //         message: '错误',
    //         description: '请求用户信息失败，请重试'
    //       })
    //       // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
    //       store.dispatch('Logout').then(() => {
    //         next({ path: loginRoutePath, query: { redirect: to.fullPath } })
    //       })
    //     })
    // } else {
    //   next()
    // }
  }

  // if (storage.get(ACCESS_TOKEN)) {
  // } else {
  //   alert('SHOULD NOT HAPPEN')
  //   if (whiteList.includes(to.name)) {
  //     next()
  //     NProgress.done()
  //   } else {
  //     next()
  //     // next({ path: loginRoutePath, query: { redirect: to.fullPath } })s
  //     NProgress.done() // if current page is auth will not trigger afterEach hook, so manually handle it
  //   }
  // }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
