<template>
  <a-avatar :src="avatar || undefined" >
    {{ user.nickname }}
  </a-avatar>
</template>

<script>
import request from '@/utils/request'
import md5 from 'js-md5'

export default {
  name: 'Avatar',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      avatar: ''
    }
  },
  mounted () {
    if (window.localStorage.getItem(`users.${this.user.email}.avatar`)) {
      this.avatar = window.localStorage.getItem(`users.${this.user.email}.avatar`)
    } else {
      request({
        url: 'https://en.gravatar.com/' + md5(this.user.email.trim().toLowerCase()) + '.json',
        method: 'get',
        validateStatus: () => true
      }).then(resp => {
        window.localStorage.setItem(`users.${this.user.email}.avatar`, 'https://www.gravatar.com/avatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=mp')
        this.avatar = 'https://www.gravatar.com/avatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=mp'
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
