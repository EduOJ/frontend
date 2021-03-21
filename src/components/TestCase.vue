<template>
  <a-card size="small" class="card">
    <span slot="title">
      {{ title }}
      <a-tag v-if="t.sample" color="orange">
        样例
      </a-tag>
      <a-tag v-else color="red">
        私密
      </a-tag>
    </span>
    <a-row :gutter="10" v-if="detailed">
      <a-col span="12">
        Input:
        <Code
          height="100px"
          :lazy-load="!t.sample"
          language="text"
          :filename="t.input_file_name"
          :url="config.apiUrl + '/api/problem/' + t.problem_id + '/test_case/' + t.id + '/input_file'"/>
      </a-col>
      <a-col span="12">
        Output:
        <Code
          height="100px"
          :lazy-load="!t.sample"
          language="text"
          :filename="t.output_file_name"
          :url="config.apiUrl + '/api/problem/' + t.problem_id + '/test_case/' + t.id + '/output_file'"/>
      </a-col>
    </a-row>
    <div v-else class="locked">
      <a-icon type="lock" />
      不可查看此数据点
    </div>
  </a-card>
</template>

<script>
import config from '@/config/config'
import Code from '@/components/Code'

export default {
  name: 'TestCase',
  components: {
    Code
  },
  props: {
    t: {
      type: Object,
      required: true
    },
    canReadSecret: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      config: config
    }
  },
  computed: {
    detailed () {
      return this.t.sample || this.canReadSecret
    },
    title () {
      if (this.t.score === 0) {
        return '测试用例 ' + this.t.id
      } else {
        return `测试用例 ${this.t.id} | ${this.t.score} 分`
      }
    }
  }
}
</script>

<style scoped lang="sass">
.card
  margin-top: 10px
.locked
  display: flex
  align-items: center
  height: 100px
  justify-content: center
  i
    font-size: 40px
  font-size: 20px
</style>
