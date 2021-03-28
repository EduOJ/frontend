<template>
  <a-avatar :src="avatar || undefined" >
    {{ user.nickname }}
  </a-avatar>
</template>

<script>
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
      avatar: 'https://cdn.v2ex.com/gravatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=404'
    }
  },
  mounted () {}
}
</script>

<style scoped>

</style>
