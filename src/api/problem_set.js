import api from '@/api/api'

const problemSetApi = {
  Problem: '/api/class/:classID/problem_set/:problemSetID/problem/:id',
  Submit: '/api/class/:classID/problem_set/:problemSetID/problem/:id/submission',
  GetSubmissions: '/api/class/:classID/problem_set/:problemSetID/submissions',
  GetSubmission: '/api/class/:classID/problem_set/:problemSetID/submission/:submissionID'
}

export function getSubmission (classID, problemSetID, submissionID, poll = false, before = null) {
  return api({
    url: problemSetApi.GetSubmission.replace(':classID', classID).replace(':problemSetID', problemSetID).replace(':submissionID', submissionID),
    method: 'get',
    params: {
      poll: poll ? 1 : 0,
      before: before
    },
    timeout: poll ? -1 : 6000
  })
}

export function getProblemSetProblem (classID, pid, id) {
  return api({
    url: problemSetApi.Problem.replace(':classID', classID).replace(':problemSetID', pid).replace(':id', id),
    method: 'get'
  })
}

export function getSubmissions (classID, pid, req) {
  return api({
    url: problemSetApi.GetSubmissions.replace(':classID', classID).replace(':problemSetID', pid),
    method: 'get',
    params: req
  })
}

export function createSubmission (param) {
  const formData = new FormData()
  for (const prop in param) {
    formData.append(prop, param[prop])
  }
  return api({
    url: problemSetApi.Submit.replace(':classID', param.classID)
      .replace(':problemSetID', param.problemSetID)
      .replace(':id', param.problem_id),
    method: 'post',
    data: formData
  })
}
