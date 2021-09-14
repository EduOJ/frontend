<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      <a href="https://www.github.com/Eduoj/frontend" target="_blank">EduOJ / frontend</a>
      <a href="https://www.github.com/Eduoj/" target="_blank">@EduOJ</a>
    </template>
    <template v-slot:copyright>
      Made with ❤️️ by <a href="https://github.com/orgs/EduOJ/people" target="_blank">EduOJ developers</a>
    </template>
  </global-footer>
</template>

<script>
import { GlobalFooter } from '@ant-design-vue/pro-layout'

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  }
}
</script>
