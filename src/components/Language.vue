<template>
  <a-tag
    :color="languageConf[language].color">
    {{ languageConf[language].displayName }}
  </a-tag>
</template>

<script>
import languageConf from '@/config/languageConf'
export default {
  name: 'Language',
  props: {
    language: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      languageConf
    }
  }
}
</script>

<style scoped>

</style>
