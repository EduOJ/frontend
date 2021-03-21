import api from '@/api/api'

const problemApi = {
  GetProblems: '/api/problems',
  Problem: '/api/problem/',
  AdminProblem: '/api/admin/problem/',
  CreateProblem: '/api/admin/problem',
  CreateTestCase: '/api/admin/problem/:id/test_case',
  CreateSubmission: '/api/problem/:id/submission',
  TestCase: '/api/admin/problem/:pid/test_case/:tid'
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
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: problemApi.AdminProblem + id,
    method: 'put',
    data: formData
  })
}

export function createProblem (param) {
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: problemApi.CreateProblem,
    method: 'post',
    data: formData
  })
}

export function createSubmission (param) {
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: problemApi.CreateSubmission.replace(':id', param.problem_id),
    method: 'post',
    data: formData
  })
}

export function createTestCase (testCase) {
  const formData = new FormData()
  for (const prop in testCase) {
    formData.append(prop, testCase[prop])
  }
  return api({
    url: problemApi.CreateTestCase.replace(':id', testCase.problem_id),
    method: 'post',
    data: formData,
    timeout: 60000
  })
}

export function updateTestCase (testCase) {
  const formData = new FormData()
  for (const prop in testCase) {
    formData.append(prop, testCase[prop])
  }
  return api({
    url: problemApi.TestCase.replace(':pid', testCase.problem_id).replace(':tid', testCase.id),
    method: 'put',
    data: formData
  })
}

export function deleteTestCase (testCase) {
  return api({
    url: problemApi.TestCase.replace(':pid', testCase.problem_id).replace(':tid', testCase.id),
    method: 'delete'
  })
}
export function deleteAllTestCase (problemId) {
  return api({
    url: problemApi.TestCase.replace(':pid', problemId).replace(':tid', 'all'),
    method: 'delete'
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
