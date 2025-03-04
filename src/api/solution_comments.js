import api from '@/api/api'

const commentApi = {
  GetSolutionComments: '/api/solution/comments',
  CreateSolutionComments: '/api/solution/comment'
}

export function createSolutionComments (param) {
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: commentApi.CreateSolutionComments,
    method: 'post',
    data: formData
  })
}

export function getSolutionComments (solutionId) {
  return api({
    url: commentApi.GetSolutionComments,
    method: 'get',
    params: {
      solutionId: solutionId
    }
  })
}
