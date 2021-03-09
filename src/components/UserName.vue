<template>
  <a-popover>
    <template slot="content">
      <avatar :user="user"></avatar>
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
import Avatar from '@/components/Avatar'
export default {
  name: 'UserName',
  components: {
    Avatar
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
