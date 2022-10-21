<template>
  <a-list item-layout="vertical" size="large" :data-source="solutions">
    <!-- <a-spin :spinning="solution_loading" class="solution_spin"> -->
    <a-list-item slot="renderItem" slot-scope="item">
      <a-row :gutter="[16,16]" style="height: 100%">
        <a-col :xl="{span:14, offset:2}" :lg="{span:16}" style="height: 100%">
          <a-card :title="item.name" style="height: 100%">
            <a-skeleton active :loading="solution_loading">
              <markdown v-model="item.description">
              </markdown>
            </a-skeleton>
          </a-card>
        </a-col>
        <a-col :xl="{span:6}" :lg="{span:8}" >
          <a-card
            title="高人指点"
            :column="3">
            <CommentArea :commentList="commentList"/>
          </a-card>
        </a-col>
      </a-row>
    </a-list-item>
    <!-- </a-spin> -->
  </a-list>
</template>

<script>
import { getSolutions } from '@/api/solution'
import Markdown from '@/components/Editor/Markdown'
import CommentArea from '@/components/CommentArea/CommentArea'

export default {
  name: 'Solution',
  components: {
    Markdown,
    CommentArea
  },
  data () {
    return {
      problemID: this.$route.params.id,
      problem_loading: false,
      solutions: [],
      // solutions: [{
      //   name: '',
      //   description: '',
      //   author: '',
      //   likes: 1
      // },
      // {
      //   name: '',
      //   description: '',
      //   author: '',
      //   likes: 1
      // }],
      commentList: [
        {
          // actions: ['回复'],
          author: 'Han Solo',
          avatar: '',
          content:
            'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.'
        },
        {
          // actions: ['回复'],
          author: 'Han Solo',
          avatar: '',
          content:
            'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.'
        }
      ]
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
      // this.solution_loading = true
      getSolutions(this.problemID).then(data => {
        this.solution_loading = false
        this.solutions = data.solutions
      }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
      // for (let i = 1; i <= this.solutions.length; i++) {

      // }
    }
  }
}

</script>

<style scoped lang="sass">
.ps
  height: 300px
</style>
<style lang="sass">
.solution_spin
  height: 100%
  .ant-spin-container
    height: 100%
</style>
