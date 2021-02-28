<template>
  <a-tag
    :color="{
      'c': 'green',
      'cpp': 'cyan'
    }[language]">
    {{ language }}
  </a-tag>
</template>

<script>
export default {
  name: 'Language',
  props: {
    language: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
