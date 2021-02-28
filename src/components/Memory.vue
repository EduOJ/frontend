<template>
  <span>
    {{ memory_pretty }}
  </span>
</template>

<script>
const unit = ['Bytes', 'KiB', 'MiB', 'GiB']
export default {
  name: 'Language',
  props: {
    memory: {
      type: Number,
      required: true
    }
  },
  computed: {
    memory_pretty () {
      let i = 0
      let m = this.memory
      while (m > 1024) {
        m /= 1024
        i++
      }
      console.log(i, m)
      return m.toFixed(2) + ' ' + unit[i]
    }
  }
}
</script>

<style scoped>

</style>
