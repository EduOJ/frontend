import api from '@/api/api'

const solutionApi = {
    GetSolutions: '/api/solutions',
    CreateSolution: '/api/solution/create',
    Solution: '/api/solution'
}

export function getSolution (id) {
    return api({
      url: solutionApi.Solution + id,
      method: 'get'
    })
}

export function createSolution (param) {
    const formData = new FormData()
    for (const prop in param) {
      if (Array.isArray(param[prop])) {
        formData.append(prop, param[prop].join(','))
      } else {
        formData.append(prop, param[prop])
      }
    }
    return api({
      url: solutionApi.CreateProblem,
      method: 'post',
      data: formData
    })
}

export function getSolutions (param) {
    return api({
      url: solutionApi.GetProblems,
      method: 'get',
      params: {
        ...param
      }
    })
}
