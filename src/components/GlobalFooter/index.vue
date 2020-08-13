<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      <a href="https://www.github.com/leoleoasd/EduOJBackend" target="_blank">EduOJ</a>
      <a href="https://www.github.com/leoleoasd/" target="_blank">@leoleoasd</a>
    </template>
    <template v-slot:copyright>
      <a href="https://github.com/leoleoasd" target="_blank">&copy; leoleoasd</a>
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
