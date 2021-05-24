export default {
  keys: ['compare_soft_match', 'compare_float', 'compare_exact_match'],
  compare_soft_match: {
    name: '忽略行末空格 + 最后回车'
  },
  compare_float: {
    name: '浮点数匹配 （相差1e-5内认为正确)'
  },
  compare_exact_match: {
    name: '字符级严格匹配'
  }
}
