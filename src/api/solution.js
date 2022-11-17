import api from '@/api/api'

const solutionApi = {
  GetSolutions: '/api/solutions',
  CreateSolution: '/api/solution',
  GetLikes: '/api/likes',
  Like: '/api/like'
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

export function getLikes (param) {
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: solutionApi.GetLikes,
    method: 'get',
    data: formData
  })
}

export function like (param) {
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: solutionApi.Like,
    method: 'post',
    data: formData
  })
}
