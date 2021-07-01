<!--<template>
    <article class="timeline-comment">
        <avatar size="large" :user="user">
        <div class="comment">
          <header class="comment-header">
            <span class="comment-meta">
                this is header
            </span>
          </header>
          <article class="markdown-body" md>
            <markdown v-model="problem.description">
            </markdown>
          </article>
        </div>
    </article>
</template> -->

<!--<template>
    <a-spin :spinning="comment_loading" :class="problem_spin">
    <a-row :gutter="[16,16]" style="height: 100%">
    <a-col :xl="{span:1, offset:0}" :lg="{span:24}" style="height: 100%">
    <avatar size="large" :user="writer"></avatar>
    </a-col>
    <a-col :xl="{span:14}" :lg="{span:20}" style="height: 100%">
        <a-card :title="id" style="height: 100%">
            <a-skeleton active :loading="comment_loading">
                <markdown v-model="this.content">
                </markdown>
            </a-skeleton>
        </a-card>
    </a-col>
    <a-col>
        <a-comment :content="this.content"/>
    </a-col>
    </a-row>
    </a-spin>
</template>-->
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
        <span>{{ this.writer.nickname }}</span> <span v-if="this.writer.nickname===this.$store.state.user.info.nickname">(你)</span> <span> #{{ this.comment_id }}</span>
    </a-row>
    <br>
    <a-row >
            <markdown v-model="this.content"> </markdown>
            <br>
        <div style="margin-right:20pt">
            <span key="comment-basic-like">
              <a-tooltip title="Like">
                <a-icon type="like" :theme="this.actions[0] === 1 ? 'filled' : 'outlined'" @click="active('0')" />
              </a-tooltip>
              <span style="padding-left: '8px'; cursor: 'auto'">
                :{{actionCount['0']}}
              </span>
            </span>
            <span key="comment-basic-dislike">
              <a-tooltip title="Dislike">
                <a-icon type="dislike" :theme="this.actions[1] === 1 ? 'filled' : 'outlined'" @click="active('1')" />
              </a-tooltip>
              <span style="padding-left: '8px'; cursor: 'auto'">
                :{{actionCount['1']}}
              </span>
            </span>
            <span><a-button @click="reply()" > Reply to</a-button></span>
          <span style="float:right">
              <a-tooltip slot="datetime" :title="moment(this.times).format('YYYY-MM-DD HH:mm:ss')">
                    <span>{{ moment(this.times).fromNow() }}</span>
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
            :detail="jsonStr[keyID]['data'].Detail"
            :comment_id="jsonStr[keyID]['data'].ID"
            :times="jsonStr[keyID]['data'].created_at"
            :writer="jsonStr[keyID]['data'].Writer"
            :jsonStr="jsonStr[keyID]"
            :content="jsonStr[keyID]['data'].Content" ></oneComment>
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
      actions: [0, 0],
      loading: true,
      canEdit: false,
      description: '',
      coll: '#FFFFFF',
      children: [],
      actionMap: {},
      actionCount: {}
    }
  },
  props: ['writer', 'jsonStr', 'content', 'times', 'comment_id', 'detail', 'depth'],
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
        this.id = Number(this.id)
        if (this.detail !== '') {
            this.actionMap = JSON.parse(this.detail)
            for (var i = 0; i <= 1; i++) {
                // for all actions
                if (!this.actionMap.hasOwnProperty(i.toString())) {
                    this.actionCount[i.toString()] = 0
                } else {
                    // this action not 0, find if you have done that
                    this.actionCount[i.toString()] = this.actionMap[i].length
                    for (var j = 0; j < this.actionMap[i].length; j++) {
                        if (this.actionMap[i][j] === this.$store.state.user.info.id) {
                            this.actions[i] = 1
                            break
                        }
                    }
                }
            }
        } else {
            for (j = 0; j <= 1; j++) {
                this.actionMap[j.toString()] = 0
                this.actionCount[j.toString()] = 0
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
        comment_id: this.comment_id,
        type_id: typeNum,
        if_add_action: 1 - this.actions[Number(typeNum)]
        }).then(
            this.actionCount[typeNum] += 1 - 2 * this.actions[Number(typeNum)],
            this.actions[Number(typeNum)] = 1 - this.actions[Number(typeNum)],
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
            father_id: this.comment_id,
            first_id: '0',
            first_type: '0',
            father_type: 'comment',
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
