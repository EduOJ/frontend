<template>
  <page-header-wrapper>
    <mark-down-editor unique-id="todo_markdown" v-model="value"/>
  </page-header-wrapper>
</template>

<script>
  import MarkDownEditor from '@/components/Editor/MarkdownEditor'
  export default {
    name: 'Todo',
    components: { MarkDownEditor },
    data () {
      return {
        value: 'test'
      }
    }
  }
</script>

<style scoped>

</style>
