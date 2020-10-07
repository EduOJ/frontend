import api from '@/api/api'

const userApi = {
  GetUsers: '/api/admin/users',
  User: '/api/admin/user/',
  CreateUser: '/api/admin/user'
}

export function getUser (id) {
  return api({
    url: userApi.User + id,
    method: 'get'
  })
}

export function deleteUser (id) {
  return api({
    url: userApi.User + id,
    method: 'delete'
  })
}

export function updateUser (id, param) {
  return api({
    url: userApi.User + id,
    method: 'put',
    data: {
      ...param
    }
  })
}

export function createUser (param) {
  return api({
    url: userApi.CreateUser,
    method: 'post',
    data: {
      ...param
    }
  })
}

export function getUsers (param) {
  return api({
    url: userApi.GetUsers,
    method: 'get',
    params: {
      ...param
    }
  })
}
