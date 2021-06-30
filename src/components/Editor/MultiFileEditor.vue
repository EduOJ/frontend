<template>
  <a-card>
    <a-directory-tree
      @select="onNodeSelect"
      :load-data="onLoadData"
      :replace-fields="replaceFields"
      :tree-data="treeData">
    </a-directory-tree>
  </a-card>
</template>

<script>
export default {
  name: 'MultiFileEditor'
}
</script>

<style scoped>

</style>
