import api from '@/api/api'

const classApi = {
  Class: '/api/class/:id',
  Students: '/api/class/:id/students',
  ProblemSet: '/api/class/:id/problem_set/:pid',
  ProblemSetProblem: '/api/class/:id/problem_set/:pid/problems',
  CreateProblemSet: '/api/class/:id/problem_set',
  CloneProblemSet: '/api/class/:id/problem_set/clone',
  CreateClass: '/api/class',
  ClassTaking: '/api/user/me/taking_classes',
  ClassManaging: '/api/user/me/managing_classes'
}

export function addProblems (classId, problemSetId, problems) {
  return api({
    url: classApi.ProblemSetProblem.replace(':id', classId).replace(':pid', problemSetId),
    method: 'post',
    data: {
      problem_ids: problems
    }
  })
}

export function deleteProblems (classId, problemSetId, problems) {
  return api({
    url: classApi.ProblemSetProblem.replace(':id', classId).replace(':pid', problemSetId),
    method: 'delete',
    data: {
      problem_ids: problems
    }
  })
}
export function getProblemSet (classId, pid) {
  return api({
    url: classApi.ProblemSet.replace(':id', classId).replace(':pid', pid),
    method: 'get'
  })
}

export function createProblemSet (data) {
  return api({
    url: classApi.CreateProblemSet.replace(':id', data.class_id),
    method: 'post',
    data
  })
}
export function editProblemSet (data) {
  return api({
    url: classApi.ProblemSet.replace(':id', data.class_id).replace(':pid', data.id),
    method: 'put',
    data
  })
}

export function getClassTaking (param) {
  return api({
    url: classApi.ClassTaking,
    method: 'get',
    params: {
      ...param
    }
  })
}

export function getClassManaging (param) {
  return api({
    url: classApi.ClassManaging,
    method: 'get',
    params: {
      ...param
    }
  })
}

export function getClass (id) {
  return api({
    url: classApi.Class.replace(':id', id),
    method: 'get'
  })
}

export function addStudents (classId, students) {
  return api({
    url: classApi.Students.replace(':id', classId),
    method: 'post',
    data: {
      user_ids: students
    }
  })
}

export function deleteStudents (classId, students) {
  return api({
    url: classApi.Students.replace(':id', classId),
    method: 'delete',
    data: {
      user_ids: students
    }
  })
}

export function deleteClass (id) {
  return api({
    url: classApi.Class.replace(':id', id),
    method: 'delete'
  })
}

export function updateClass (data) {
  return api({
    url: classApi.Class.replace(':id', data.id),
    method: 'put',
    data
  })
}

export function createClass (data) {
  return api({
    url: classApi.CreateClass,
    method: 'post',
    data
  })
}
