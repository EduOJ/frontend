import api from '@/api/api'

const commentApi = {

    CreateComment: '/api/comment',
    GetComment: '/api/comments',
    AddReaction: '/api/comment'
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
      url: commentApi.AddReaction + '/' + param['comment_id'] + '/reaction',
      method: 'post',
      data: formData
    })
}
