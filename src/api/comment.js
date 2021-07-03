import api from '@/api/api'

const commentApi = {

    CreateComment: '/api/comments',
    GetComment: '/api/comments',
    AddReaction: '/api/comments'
}

export function createComment (param) {
    const formData = new FormData()
    for (const prop in param) {
      formData.append(prop, param[prop])
    }
    return api({
      url: commentApi.CreateComment,
      method: 'post',
      data: formData
    })
}

export function getComment (param) {
    return api({
      url: commentApi.GetComment,
      method: 'get',
      params: {
        ...param
      }
    })
}

export function AddReaction (param) {
    const formData = new FormData()
    for (const prop in param) {
      formData.append(prop, param[prop])
    }
    return api({
      url: commentApi.AddReaction,
      method: 'put',
      data: formData
    })
}
