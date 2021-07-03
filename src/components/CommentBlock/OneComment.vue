<template>
  <a-comment>
   <div>
   <a-spin :spinning="loading">
    <a-skeleton active :loading="loading">
    <div :style="{'--coll': this.coll}" class="basic" >
    <div>
    <div style="margin-up:5pt; margin-left:2pt">
    <a-row  justify="space-between">
        <span><avatar size="large" :user="this.writer"></avatar></span>
        <span>{{ this.comment.User.nickname }}</span> <span v-if="this.comment.User.nickname===this.$store.state.user.info.nickname">(你)</span> <span> #{{ this.comment.ID }}</span>
    </a-row>
    <br>
    <a-row >
            <markdown v-model="this.comment.Content"> </markdown>
            <br>
        <div style="margin-right:20pt">
            <span key="comment-basic-like">
              <a-tooltip title="Like">
                <a-icon type="like" :theme="this.actions['👍'] === 1 ? 'filled' : 'outlined'" @click="active('👍')" />
              </a-tooltip>
              <span style="padding-left: '8px'; cursor: 'auto'">
                :{{actionCount['👍']}}
              </span>
            </span>
            <span key="comment-basic-dislike">
              <a-tooltip title="Dislike">
                <a-icon type="dislike" :theme="this.actions['👎'] === 1 ? 'filled' : 'outlined'" @click="active('👎')" />
              </a-tooltip>
              <span style="padding-left: '8px'; cursor: 'auto'">
                :{{actionCount['👎']}}
              </span>
            </span>
            <span><a-button @click="reply()" > Reply to</a-button></span>
          <span style="float:right">
              <a-tooltip slot="datetime" :title="moment(this.comment.created_at).format('YYYY-MM-DD HH:mm:ss')">
                    <span>{{ moment(this.comment.created_at).fromNow() }}</span>
                </a-tooltip>
          </span>
        </div>
        <div v-if="this.canEdit">
            <span><avatar size="large" :user="this.$store.state.user.info"></avatar></span>
            <span> 你的发言</span>
            <div slot="content">
            <a-form-item>
                <mark-down-editor v-model="description"/>
            </a-form-item>
            <a-form-item>
            <div style="margin-left:20pt; margin-right:20pt">
            <span><a-button html-type="submit" :loading="submitting" type="primary" @click="handleCancel()">
                取消
            </a-button></span>
            <span style="float:right"><a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit()">
                提交
            </a-button></span>
            </div>
            </a-form-item>
      </div>
        </div>
        <div v-for="keyID in this.children" :key="keyID" >
            <div style="margin-left:20pt; margin-top:5pt; margin-right:5pt" >
            <oneComment
            :depth="depth + 1"
            :comment="jsonStr[keyID]['data']"
            :jsonStr="jsonStr[keyID]"></oneComment>
            </div>
        </div>
    </a-row>
    </div>
    </div>
    </div>
    </a-skeleton>
    </a-spin>
  </div>
  </a-comment>
</template>

<script>
import Markdown from '@/components/Editor/Markdown'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'
import { AddReaction, createComment } from '@/api/comment'
import Avatar from '@/components/Avatar'
import OneComment from '@/components/CommentBlock/OneComment'
import config from '@/config/config'
import languageConf from '@/config/languageConf'
import comparerConf from '@/config/comparerConf'
import moment from 'moment'

export default {
  name: 'oneComment',
  components: {
    Markdown,
    Avatar,
    OneComment,
    MarkDownEditor
  },
  data () {
    return {
      comparerConf,
      languageConf,
      config,
      moment,
      loading: true,
      canEdit: false,
      description: '',
      coll: '#FFFFFF',
      actions: {},
      emojis: ['👍', '👎'],
      children: [],
      actionMap: {},
      actionCount: {}
    }
  },
  props: ['depth', 'comment', 'jsonStr'],
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
        this.loading = true
        if (this.comment.Reaction.Details !== '') {
            this.actionMap = JSON.parse(this.comment.Reaction.Details)
            for (var i = 0; i < this.emojis.length; i++) {
                // for all actions
                this.actions[this.emojis[i]] = 0
                if (!this.actionMap.hasOwnProperty(this.emojis[i])) {
                    this.actionCount[this.emojis[i]] = 0
                } else {
                    // this action not 0, find if you have done that
                    // the first index stands for length
                    this.actionCount[this.emojis[i]] = this.actionMap[this.emojis[i]][0]
                    for (var j = 1; j < this.actionMap[this.emojis[i]].length; j++) {
                        if (this.actionMap[this.emojis[i]][j] === this.$store.state.user.info.id) {
                            this.actions[this.emojis[i]] = 1
                            break
                        }
                    }
                }
            }
        } else {
            for (j = 0; j < this.emojis.length; j++) {
                this.actionCount[this.emojis[j]] = 0
                this.actions[this.emojis[j]] = 0
            }
        }

        for (var key in this.jsonStr) {
            if (key !== 'data') {
                this.children.push(key.toString())
            }
        }

        var tempCol = ['D9FFFD', 'C5E1E8', 'E5F3FF', 'C5CFE8', 'D9D9FF']
        this.depth = Number(this.depth)

        if (this.depth < 5) {
            this.coll = '#' + tempCol[this.depth]
        } else {
            this.coll = '#' + tempCol[4]
        }
        this.loading = false
    },
    active (typeNum) {
      AddReaction({
        reaction_id: this.comment.Reaction.ID,
        emoji_type: typeNum,
        if_add_action: Boolean(1 - this.actions[typeNum])
        }).then(
            this.actionCount[typeNum] += 1 - 2 * this.actions[typeNum],
            this.actions[typeNum] = 1 - this.actions[typeNum],
            this.$forceUpdate()
        ).catch(err => {
        this.$error({
          content: '遇到错误：' + err.message
        })
        console.error(err)
      })
    },
    reply () {
        this.canEdit = true
    },
    handleCancel () {
        this.canEdit = false
    },
    handleSubmit () {
      if (this.description.length < 2) {
        this.$error({
          content: '评论长度过短'
        })
      } else {
        createComment({
            father_id: this.comment.ID,
            target_type: '0',
            target_id: '0',
            content: this.description
        }).then(
            this.$forceUpdate()
        ).catch(err => {
            this.$error({
            content: '遇到错误：' + err.message
            })
            console.error(err)
        })
      }
    }
  }
}
</script>

<style scoped lang="sass">
.ps
    height: 300px
</style>
<style lang="sass">
.submission_card
.ant-card-body
    padding: 0
.ant-list
    border: 0
.problem_spin
    height: 100%
.ant-spin-container
    height: 100%
</style>
<style lang="scss">
.basic {
    border-style: solid;
    border-width: 1px;
    border-color: #000000;
    background-color: var(--coll);
}
</style>
