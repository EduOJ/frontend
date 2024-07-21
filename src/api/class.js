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
  ClassManaging: '/api/user/me/managing_classes',
  ProblemSetGrades: '/api/class/:id/problem_set/:pid/grades'
}

export function addProblems (classID, problemSetId, problems) {
  return api({
    url: classApi.ProblemSetProblem.replace(':id', classID).replace(':pid', problemSetId),
    method: 'post',
    data: {
      problem_ids: problems
    }
  })
}

export function deleteProblems (classID, problemSetId, problems) {
  return api({
    url: classApi.ProblemSetProblem.replace(':id', classID).replace(':pid', problemSetId),
    method: 'delete',
    data: {
      problem_ids: problems
    }
  })
}
export function getProblemSet (classID, pid) {
  return api({
    url: classApi.ProblemSet.replace(':id', classID).replace(':pid', pid),
    method: 'get'
  })
}

export function createProblemSet (data) {
  return api({
    url: classApi.CreateProblemSet.replace(':id', data.classID),
    method: 'post',
    data
  })
}
export function editProblemSet (data) {
  return api({
    url: classApi.ProblemSet.replace(':id', data.classID).replace(':pid', data.id),
    method: 'put',
    data
  })
}

export function deleteProblemSet (data) {
  return api({
    url: classApi.ProblemSet.replace(':id', data.classID).replace(':pid', data.id),
    method: 'delete'
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

export function getProblemSetGrades (classID, problemSetId) {
  return api({
    url: classApi.ProblemSetGrades.replace(':id', classID).replace(':pid', problemSetId),
    method: 'get'
  })
}
export function getClass (id) {
  return api({
    url: classApi.Class.replace(':id', id),
    method: 'get'
  })
}

export function addStudents (classID, students) {
  return api({
    url: classApi.Students.replace(':id', classID),
    method: 'post',
    data: {
      user_ids: students
    }
  })
}

export function deleteStudents (classID, students) {
  return api({
    url: classApi.Students.replace(':id', classID),
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
