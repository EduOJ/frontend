<template>
  <a-spin :spinning="blockLoading">
  <a-skeleton active :loading="blockLoading">
  <ul v-for="comment in this.comments" :key="comment.ID">
    <one-comment :depth="0" :comment="comment" :jsonStr="jsonTree[comment.ID.toString()]"></one-comment>
  </ul>
  <a-pagination v-model="pagination.current" :total="50" show-less-items />
  <div>
    <span><avatar size="large" :user="this.$store.state.user.info"></avatar></span>
    <span> 对本题留言</span>
    <div slot="content">
      <a-form-item> </a-form-item>
      <mark-down-editor unique-id="description_markdown" v-model="commentDescription" :dealAt="dealAt" :dealHashTag="dealHashTag"/>
      <a-form-item>
        <div style="margin-left: 20pt; margin-right: 20pt">
          <span
            ><a-button html-type="submit" :loading="submitting" type="primary" @click="handleCancel()">
              取消
            </a-button></span
          >
          <span
          style="float: right">
          <a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit()">
              提交
            </a-button></span
          >
        </div>
      </a-form-item>
    </div>
  </div>
  </a-skeleton>
    </a-spin>
</template>

<script>
import { createComment, getComment } from '@/api/comment'
import { getUsers } from '@/api/user'
import { getProblems } from '@/api/problem'
import Markdown from '@/components/Editor/Markdown'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'
import OneComment from '@/components/CommentBlock/OneComment'

export default {
  name: 'CommentBlocks',
  components: {
    Markdown,
    MarkDownEditor,
    OneComment
  },
  props: ['targetType', 'targetID'],
  data () {
    return {
      blockLoading: true,
      canEdit: false,
      comments: [],
      commentsNoneRoot: [],
      jsonTree: {},
      jsonChildren: {}, // children of all the nodes
      commentsMap: {},
      commentDescription: '',
      pagination: {
        current: 1,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['20', '50', '100'],
        pageSize: 50,
        showTotal: (total, range) => `共 ${total} 条数据, 正在显示 ${range[0]} - ${range[1]} 条`
      }
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
      getComment({
        target_type: this.targetType,
        target_id: Number(this.targetID),
        limit: 5,
        offset: 0
      })
        .then((data) => {
          this.comments = data.RootComments
          this.commentsNoneRoot = data.NotRootComments
          this.parseJson()
          this.pagination.current = data.Current
          this.blockLoading = false
        })
        .catch((err) => {
          this.$error({
            content: '遇到错误：' + err.message
          })
          console.error(err)
        })
    },
    parseRecur (fatherID) {
      var len = this.jsonChildren[fatherID.toString()].length
      if (len === 0) return { 'data': this.commentsMap[fatherID.toString()] }
      var temp = {}
      for (var i = 0; i < len; i++) {
        temp[this.jsonChildren[fatherID.toString()][i]] = this.parseRecur(this.jsonChildren[fatherID.toString()][i])
      }
      temp['data'] = this.commentsMap[fatherID.toString()]
      return temp
    },
    parseJson () {
      var len = this.comments.length
      var len2 = this.commentsNoneRoot.length

      for (var j = 0; j < len; j++) {
        this.jsonChildren[(this.comments[j].ID).toString()] = []
        this.commentsMap[(this.comments[j].ID).toString()] = this.comments[j]
      }
      for (var j2 = 0; j2 < len2; j2++) {
        this.jsonChildren[(this.commentsNoneRoot[j2].ID).toString()] = []
        this.commentsMap[(this.commentsNoneRoot[j2].ID).toString()] = this.commentsNoneRoot[j2]
      }

      for (var i = 0; i < len2; i++) {
        this.jsonChildren[this.commentsNoneRoot[i].FatherID.toString()].push(this.commentsNoneRoot[i].ID)
      }

      for (var k = 0; k < len; k++) {
        this.jsonTree[(this.comments[k].ID).toString()] = this.parseRecur(this.comments[k].ID)
      }
    },
    handleSubmit () {
      if (this.commentDescription.length < 2) {
        this.$error({
          content: '评论长度过短'
        })
      } else {
        createComment({
        father_id: 0,
        target_id: this.$route.params.problemID,
        target_type: 'problem',
        content: this.commentDescription
        }).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
      }
    },
    handleCancel () {
      this.commentDescription = ''
      this.$forceUpdate()
    },
    dealAt: function (val) {
        getUsers({
            offset: 0,
            search: val
        }).then(data => {
            this.userSearchResult = data.users.map((v) => {
                return {
                    value: '  @' + v.username + '  ',
                    html: `#${v.id} ${v.username} ${v.nickname}`
                }
            })
        })
        return this.userSearchResult
    },
    dealHashTag: function (val) {
        getProblems({
            offset: 0,
            search: val
        }).then(data => {
            this.hashSearchResult = data.problems.map((v) => {
                return {
                    value: '  #' + v.name + '  ',
                    html: `#${v.id} ${v.name} `
                }
            })
        })
        return this.hashSearchResult
    }
  }
}
</script>
