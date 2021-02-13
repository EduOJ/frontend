import api from '@/api/api'

const problemApi = {
  GetProblems: '/api/problems',
  Problem: '/api/problem/',
  AdminProblem: '/api/admin/problem/',
  CreateProblem: '/api/admin/problem'
}

export function getProblem (id) {
  return api({
    url: problemApi.Problem + id,
    method: 'get'
  })
}

export function deleteProblem (id) {
  return api({
    url: problemApi.AdminProblem + id,
    method: 'delete'
  })
}

export function updateProblem (id, param) {
  return api({
    url: problemApi.AdminProblem + id,
    method: 'put',
    data: {
      ...param
    }
  })
}

export function createProblem (param) {
  const formData = new FormData()
  console.log(param)
  for (const prop in param) {
    console.log(prop, param[prop])
    formData.append(prop, param[prop])
  }
  console.log(formData)
  return api({
    url: problemApi.CreateProblem,
    method: 'post',
    data: formData
  })
}

export function getProblems (param) {
  return api({
    url: problemApi.GetProblems,
    method: 'get',
    params: {
      ...param
    }
  })
}
