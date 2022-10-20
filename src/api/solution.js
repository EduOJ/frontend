import api from '@/api/api'

const solutionApi = {
    GetSolutions: '/api/solutions',
    CreateSolution: '/api/solution',
    // Solution: '/api/solution',
    GetSolutionComments: '/api/solution/comments'
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
      url: solutionApi.CreateSolution,
      method: 'post',
      data: formData
    })
}

export function getSolutions (param) {
    return api({
      url: solutionApi.GetSolutions,
      method: 'get',
      params: {
        ...param
      }
    })
}

// TODO
export function getSolutionComments (id) {
  return api({
    url: solutionApi.GetSolutionComments,
    method: 'get'
  })
}
