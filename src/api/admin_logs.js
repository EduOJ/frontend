import api from '@/api/api'
const logApi = {
  GetLogs: '/api/admin/logs'
}

export function getLogs (param) {
  return api({
    url: logApi.GetLogs,
    method: 'get',
    params: {
      ...param
    }
  })
}
