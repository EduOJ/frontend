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
            <CommentList :comments="comments" />
            <Reply solutionId="1" fatherNode="2" label="我就是高人" />
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
import CommentList from '@/components/CommentList/CommentList'
import Reply from '@/components/CommentList/Reply.vue'

export default {
  name: 'Solution',
  components: {
    Markdown,
    CommentList,
    Reply
  },
  data () {
    return {
      problemID: this.$route.params.id,
      problem_loading: false,
      solutions: [],
      comments: [
        {
          uid: 'uid000',
          userName: '陌溪',
          content: '我是一级评论',
          reply: [
            {
              uid: 'uid001',
              userName: '陌溪',
              content: '我是二级评论',
              reply: [
                {
                  uid: 'uid002',
                  userName: '陌溪',
                  content: '我是三级评论',
                  reply: []
                }
              ]
            }, {
              uid: 'uid003',
              userName: '陌溪',
              content: '我是二级评论',
              reply: []
            }
          ]
        }
      ]
      // id: this.$route.params.id,
      // problem_loading: false
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
