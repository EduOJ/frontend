import api from '@/api/api'

const submissionApi = {
  GetSubmissions: '/api/submissions',
  GetSubmission: '/api/submission/:id',
  GetSubmissionCode: '/api/submission/:id/code',
  GetRunOutput: '/api/submission/:id/run/:run_id/output',
  GetRunInput: '/api/submission/:id/run/:run_id/input',
  GetRunCompilerOutput: '/api/submission/:id/run/:run_id/compiler_output',
  GetRunComparerOutput: '/api/submission/:id/run/:run_id/comparer_output'
}

export function getSubmissions (req) {
  return api({
    url: submissionApi.GetSubmissions,
    method: 'get',
    params: req
  })
}

export function getSubmission (id, poll = false, before = null) {
  return api({
    url: submissionApi.GetSubmission.replace(':id', id),
    method: 'get',
    params: {
      poll: poll ? 1 : 0,
      before: before
    },
    timeout: poll ? -1 : 6000
  })
}
