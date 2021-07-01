import api from '@/api/api'

const commentApi = {

    CreateComment: '/api/comment/create',
    GetComment: '/api/comment/get',
    AddReaction: '/api/comment/reaction/add'
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
    const formData = new FormData()
    for (const prop in param) {
      formData.append(prop, param[prop])
    }

    return api({
      url: commentApi.GetComment,
      method: 'post',
      data: formData
    })
}

export function AddReaction (param) {
    const formData = new FormData()
    for (const prop in param) {
      formData.append(prop, param[prop])
    }

    return api({
      url: commentApi.AddReaction,
      method: 'post',
      data: formData
    })
}
