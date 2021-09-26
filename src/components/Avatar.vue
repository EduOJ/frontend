<template>
  <a-avatar :size="size" :src="avatar" :style="{verticalAlign: 'middle'}" :load-error="loadError" >
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
  methods: {
    loadError () {
      this.avatar = ''
    }
  }
}
</script>

<style scoped>

</style>
