<template>
  <a-popover>
    <template slot="content">
      <a-avatar :src="avatar || undefined" >
        {{ user.nickname }}
      </a-avatar>
      <router-link :to="{name: 'user', params: {id: user.id}}">
        {{ `@${user.username}` }}
      </router-link>
      {{ user.nickname }}
    </template>
    <span>
      <router-link :to="{name: 'user', params: {id: user.id}}">
        {{ `@${user.username}` }}
      </router-link>
    </span>
  </a-popover>
</template>

<script>
import md5 from 'js-md5'
import request from '@/utils/request'

export default {
  name: 'UserName',
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
  computed: {
    // avatar () {
    //   if (this.user && this.user.email) {
    //     return 'https://www.gravatar.com/avatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=mp'
    //   } else {
    //     return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    //   }
    // }
  },
  mounted () {
    request({
      url: 'https://en.gravatar.com/' + md5(this.user.email.trim().toLowerCase()) + '.json',
      method: 'get'
    }).then(resp => {
      this.avatar = 'https://www.gravatar.com/avatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=mp'
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>

<style scoped>

</style>
