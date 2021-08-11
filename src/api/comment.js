import api from '@/api/api'

const commentApi = {

    CreateComment: '/api/comment',
    GetComment: '/api/comments',
    AddReaction: '/api/comment',
    DeleteComment: '/api/comment'
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

export function getComment (params) {
    return api({
      url: commentApi.GetComment,
      method: 'get',
      params
    })
}

export function addReaction (param) {
    return api({
      url: commentApi.AddReaction + '/' + param['comment_id'] + '/reaction',
      method: 'post',
      data: param
    })
}

export function deleteReaction (param) {
  return api({
    url: commentApi.AddReaction + '/' + param['comment_id'] + '/reaction',
    method: 'delete',
    data: param
  })
}

export function deleteComment (param) {
    return api({
      url: commentApi.DeleteComment + '/' + param['comment_id'],
      method: 'delete',
      data: param
    })
}
