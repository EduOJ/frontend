import { UserLayout, BasicLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: (h) => h('router-view')
}

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '主页' },
    redirect: '/home',
    children: [
      // dashboard
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/Home'),
        meta: { title: '主页', icon: bxAnaalyse }
      },
      {
        path: '/problems/',
        component: RouteView,
        meta: { title: '题目管理', icon: 'calculator' },
        children: [
          {
            path: '/problems/',
            name: 'problems',
            component: () => import('@/views/problem/Problems'),
            meta: { title: '题目列表' }
          },
          {
            path: '/problem/add',
            name: 'problem.add',
            component: () => import('@/views/problem/CreateProblem'),
            meta: { title: '创建题目', permission: 'create_problem' }
          },
          {
            path: '/problem/:id',
            name: 'problem',
            component: () => import('@/views/problem/Problem'),
            hidden: true,
            meta: { title: '查看题目' }
          },
          {
            path: '/problem/:id/submit',
            name: 'problem.submit',
            component: () => import('@/views/problem/Submit'),
            hidden: true,
            meta: { title: '提交' }
          },
          {
            path: '/problem/:id/edit',
            name: 'problem.edit',
            component: () => import('@/views/problem/EditProblem'),
            hidden: true,
            meta: { title: '编辑题目' }
          }
        ]
      },
      {
        path: '/comments/',
        component: RouteView,
        meta: { title: '评论管理', icon: 'database' },
        children: [
          {
            path: '/comments/add',
            name: 'comment.add',
            component: () => import('@/views/problem/CreateProblem'),
            meta: { title: '发送评论' }
          }
        ]
      },
      {
        path: '/submissions',
        component: RouteView,
        meta: { title: '提交管理', icon: 'database' },
        children: [
          {
            path: '/submissions',
            name: 'submissions',
            component: () => import('@/views/submission/Submissions'),
            meta: { title: '提交列表' }
          },
          {
            path: '/submission/:id',
            name: 'submission',
            component: () => import('@/views/submission/Submission'),
            hidden: true,
            meta: { title: '查看提交' }
          }
        ]
      },
      {
        path: '/dummy2',
        component: RouteView,
        meta: { title: '班级', icon: 'cluster' },
        children: [
          {
            path: '/class/add',
            name: 'class.add',
            component: () => import('@/views/class/CreateClass'),
            meta: { title: '创建班级', permission: 'manage_class' }
          },
          {
            path: '/class/:classID',
            component: () => import('@/views/class/ClassView'),
            hidden: true,
            name: 'class',
            redirect: { name: 'class.dashboard' },
            children: [
              {
                path: '/class/:classID/dashboard',
                name: 'class.dashboard',
                component: () => import('@/views/class/Dashboard'),
                meta: { title: '查看班级' }
              },
              {
                path: '/class/:classID/edit',
                name: 'class.edit',
                component: () => import('@/views/class/EditClass'),
                meta: { title: '编辑班级' }
              },
              {
                path: '/class/:classID/edit_student',
                name: 'class.editStudent',
                component: () => import('@/views/class/EditStudent'),
                meta: { title: '学生管理' }
              },
              {
                path: '/class/:classID/edit_problem_set',
                name: 'class.editProblemSets',
                component: () => import('@/views/class/EditProblemSets'),
                meta: { title: '作业管理' }
              },
              {
                path: '/class/:classID/edit_problem_set/add',
                name: 'class.addProblemSet',
                component: () => import('@/views/class/CreateProblemSet'),
                meta: { title: '创建作业' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/edit',
                name: 'class.editProblemSet',
                component: () => import('@/views/class/EditProblemSet'),
                meta: { title: '编辑作业' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/edit_problem',
                name: 'class.editProblemSetProblems',
                component: () => import('@/views/class/EditProblemSetProblems'),
                meta: { title: '编辑作业' }
              },
              {
                path: '/class/:classID/problem_set',
                name: 'class.problemSets',
                component: () => import('@/views/class/ProblemSets'),
                meta: { title: '查看作业' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/problems',
                name: 'class.problemSet.problems',
                component: () => import('@/views/class/ProblemSetProblems'),
                meta: { title: '查看作业' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/problem/:problemID',
                name: 'class.problemSet.problem',
                component: () => import('@/views/class/ProblemSetProblem'),
                meta: { title: '做题' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/problem/:problemID/submit',
                name: 'class.problemSet.submit',
                component: () => import('@/views/class/ProblemSetSubmit'),
                meta: { title: '做题' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/submission/:submissionID',
                name: 'class.problemSet.submission',
                component: () => import('@/views/class/ProblemSetSubmission'),
                meta: { title: '查看提交' }
              },
              {
                path: '/class/:classID/problem_set/:problemSetID/submissions',
                name: 'class.problemSet.submissions',
                component: () => import('@/views/class/ProblemSetSubmissions'),
                meta: { title: '查看提交' }
              }
            ]
          }
        ]
      },
      {
        path: '/dummy1',
        component: RouteView,
        redirect: '/form/base-form',
        name: 'account',
        meta: { title: '系统自带的', permission: 'all' },
        children: [
          {
            path: '/profile',
            name: 'profile',
            component: RouteView,
            redirect: '/profile/basic',
            meta: { title: '详情页', icon: 'profile', permission: [ 'profile' ] },
            children: [
              {
                path: '/profile/basic',
                name: 'ProfileBasic',
                component: () => import('@/views/profile/basic'),
                meta: { title: '基础详情页', permission: [ 'profile' ] }
              },
              {
                path: '/profile/advanced',
                name: 'ProfileAdvanced',
                component: () => import('@/views/profile/advanced/Advanced'),
                meta: { title: '高级详情页', permission: [ 'profile' ] }
              }
            ]
          },
          // forms
          {
            path: '/form',
            redirect: '/form/base-form',
            component: RouteView,
            meta: { title: '表单页', icon: 'form' },
            children: [
              {
                path: '/form/base-form',
                name: 'BaseForm',
                component: () => import('@/views/form/basicForm'),
                meta: { title: '基础表单' }
              },
              {
                path: '/form/step-form',
                name: 'StepForm',
                component: () => import('@/views/form/stepForm/StepForm'),
                meta: { title: '分步表单' }
              },
              {
                path: '/form/advanced-form',
                name: 'AdvanceForm',
                component: () => import('@/views/form/advancedForm/AdvancedForm'),
                meta: { title: '高级表单' }
              }
            ]
          },
          {
            path: '/list',
            name: 'list',
            component: RouteView,
            redirect: '/list/table-list',
            meta: { title: '列表页', icon: 'table', permission: 'table' },
            children: [
              {
                path: '/list/table-list/:pageNo([1-9]\\d*)?',
                name: 'TableListWrapper',
                hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
                component: () => import('@/views/list/TableList'),
                meta: { title: '查询表格', permission: 'table' }
              },
              {
                path: '/list/basic-list',
                name: 'BasicList',
                component: () => import('@/views/list/BasicList'),
                meta: { title: '标准列表', permission: 'table' }
              },
              {
                path: '/list/card',
                name: 'CardList',
                component: () => import('@/views/list/CardList'),
                meta: { title: '卡片列表', permission: 'table' }
              },
              {
                path: '/list/search',
                name: 'SearchList',
                component: () => import('@/views/list/search/SearchLayout'),
                redirect: '/list/search/article',
                meta: { title: '搜索列表', permission: 'table' },
                children: [
                  {
                    path: '/list/search/article',
                    name: 'SearchArticles',
                    component: () => import('../views/list/search/Article'),
                    meta: { title: '搜索列表（文章）', permission: 'table' }
                  },
                  {
                    path: '/list/search/project',
                    name: 'SearchProjects',
                    component: () => import('../views/list/search/Projects'),
                    meta: { title: '搜索列表（项目）', permission: 'table' }
                  },
                  {
                    path: '/list/search/application',
                    name: 'SearchApplications',
                    component: () => import('../views/list/search/Applications'),
                    meta: { title: '搜索列表（应用）', permission: 'table' }
                  }
                ]
              }
            ]
          },
          {
            path: '/result',
            name: 'result',
            component: RouteView,
            redirect: '/result/success',
            meta: { title: '结果页', icon: 'check-circle-o', permission: 'result' },
            children: [
              {
                path: '/result/success',
                name: 'ResultSuccess',
                component: () => import(/* webpackChunkName: "result" */ '@/views/result/Success'),
                meta: { title: '成功', keepAlive: false, hiddenHeaderContent: true, permission: [ 'result' ] }
              },
              {
                path: '/result/fail',
                name: 'ResultFail',
                component: () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),
                meta: { title: '失败', keepAlive: false, hiddenHeaderContent: true, permission: [ 'result' ] }
              }
            ]
          },
          {
            path: '/exception',
            name: 'exception',
            component: RouteView,
            redirect: '/exception/403',
            meta: { title: '异常页', icon: 'warning', hidden: true },
            children: [
              {
                path: '/exception/403',
                name: 'Exception403',
                component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
                meta: { title: '403' }
              },
              {
                path: '/exception/404',
                name: 'Exception404',
                component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
                meta: { title: '404', permission: [ 'admin' ] }
              },
              {
                path: '/exception/500',
                name: 'Exception500',
                component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
                meta: { title: '500', permission: [ 'admin' ] }
              }
            ]
          }
        ]
      },
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '我的', icon: 'user' },
        children: [
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: '个人设置', hideHeader: true },
            redirect: '/account/settings/base',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/base',
                name: 'settings.base',
                component: () => import('@/views/account/settings/BaseSetting'),
                meta: { title: '个人信息', hidden: true }
              },
              {
                path: '/account/settings/change_password',
                name: 'settings.change_password',
                component: () => import('@/views/account/settings/ChangePassword'),
                meta: { title: '安全设置', hidden: true }
              },
              {
                path: '/account/settings/webauthn',
                name: 'settings.webauthn',
                component: () => import('@/views/account/settings/Webauthn'),
                meta: { title: '使用安全秘钥登录', hidden: true }
              },
              {
                path: '/account/settings/system',
                name: 'settings.system',
                component: () => import('@/views/account/settings/SystemSettings'),
                meta: { title: '系统设置', hidden: true }
              }
            ]
          }
        ]
      },
      {
        path: '/admin',
        component: RouteView,
        name: 'admin',
        meta: { title: '系统管理', icon: 'user' },
        children: [
          {
            path: '/admin/logs/',
            name: 'admin.logs',
            component: () => import('@/views/admin/Logs'),
            meta: { title: '日志查看', permission: 'read_logs' }
          },
          {
            path: '/admin/users/',
            name: 'admin.users',
            component: () => import('@/views/admin/user/Users'),
            meta: { title: '用户管理', permission: 'read_user' }
          },
          {
            path: '/admin/user/add',
            name: 'admin.user.add',
            component: () => import('@/views/admin/user/CreateUser'),
            hidden: true,
            meta: { title: '创建用户', permission: 'manage_user' }
          },
          {
            path: '/admin/user/:id',
            name: 'admin.user',
            component: RouteView,
            hidden: true,
            meta: { title: '用户管理', permission: 'read_user' },
            children: [
              {
                path: '/admin/user/:id/edit',
                name: 'admin.user.edit',
                component: () => import('@/views/admin/user/EditUser'),
                meta: { title: '编辑用户', permission: 'manage_user' }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    component: UserLayout,
    redirect: { name: 'login' },
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login'),
        meta: { title: '登录' }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register'),
        meta: { title: '注册' }
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]
