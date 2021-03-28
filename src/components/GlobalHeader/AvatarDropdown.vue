<template>
  <a-dropdown v-if="user && user.nickname" placement="bottomRight">
    <span class="ant-pro-account-avatar">
      <a-avatar size="small" :src="avatar" class="antd-pro-global-header-index-avatar" />
      <span>{{ user.nickname }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu v-if="!user.isGuest" class="ant-pro-drop-down menu" :selected-keys="[]">
        <a-menu-item key="center">
          <router-link :to="{name:'' }">
            <a-icon type="user" />
            个人中心
          </router-link>
        </a-menu-item>
        <a-menu-item key="settings">
          <router-link :to="{name:'settings' }">
            <a-icon type="setting" />
            个人设置
          </router-link>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="logout" @click="handleLogout">
          <a-icon type="logout" />
          退出登录
        </a-menu-item>
      </a-menu>
      <a-menu v-else class="ant-pro-drop-down menu" :selected-keys="[]">
        <a-menu-item key="login">
          <router-link :to="{name: 'login'}">
            <a-icon type="login" />
            登录
          </router-link>
        </a-menu-item>
        <a-menu-item key="register">
          <router-link :to="{name: 'register'}">
            <a-icon type="user-add" />
            注册
          </router-link>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
  </span>
</template>

<script>
import { Modal } from 'ant-design-vue'
import md5 from 'js-md5'

export default {
  name: 'AvatarDropdown',
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  computed: {
    avatar () {
      if (this.user && this.user.email) {
        return 'https://cdn.v2ex.com/gravatar/' + md5(this.user.email.trim().toLowerCase()) + '?d=mp'
      } else {
        return 'https://cdn.v2ex.com/gravatar/00000000000000000000000000000000?d=mp&f=y'
      }
    }
  },
  methods: {
    handleLogout (e) {
      Modal.confirm({
        title: this.$t('layouts.usermenu.dialog.title'),
        content: this.$t('layouts.usermenu.dialog.content'),
        onOk: () => {
          this.$store.dispatch('Logout')
        },
        onCancel () {}
      })
    }
  }
}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
</style>
