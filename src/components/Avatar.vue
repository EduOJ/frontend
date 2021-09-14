<template>
  <a-avatar :size="size" :setSrc="avatar" :style="{verticalAlign: 'middle'}" >
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
    },
    size: {
      validator: function validator (val) {
        return typeof val === 'number' || ['small', 'large', 'default'].includes(val)
      },
      default: 'default'
    }
  },
  data () {
    return {
      avatar: 'https://gravatar.loli.net/avatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=404'
    }
  },
  mounted () {}
}
</script>

<style scoped>

</style>
