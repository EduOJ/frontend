import api from '@/api/api'

const solutionApi = {
    GetSolutions: '/api/solutions',
    CreateSolution: '/api/solution',
    GetSolutionComments: '/api/solution/comments',
    CreateSolutionComments: '/api/solution/comment'
}

export function createSolution (param) {
    const formData = new FormData()
    for (const prop in param) {
      formData.append(prop, param[prop])
    }
    return api({
      url: solutionApi.CreateSolution,
      method: 'post',
      data: formData
    })
}

export function getSolutions (problemID) {
    return api({
      url: solutionApi.GetSolutions,
      method: 'get',
      params: {
        problemID: problemID
      }
    })
}

// TODO
export function CreateSolutionComments () {}

// TODO
export function getSolutionComments (id) {
  return api({
    url: solutionApi.GetSolutionComments,
    method: 'get'
  })
}
