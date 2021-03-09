const Class = {
  state: {
    info: {
      id: '',
      name: '',
      course_name: '',
      description: '',
      invite_code: '',
      managers: [],
      students: [],
      problem_sets: []
    }
  },
  mutations: {
    SET_CLASS: (state, Class) => {
      state.info = Object.assign({}, state.info, Class)
    }
  },
  getters: {
    class: state => state.info
  }
}

export default Class
