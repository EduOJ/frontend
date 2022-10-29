<template>
  <div>
    <a-comment v-for="item in comments" :key="item.uid">
      <span slot="actions">回复</span>
      <a slot="author">{{ item.userName }}</a>
      <a-avatar
        slot="avatar"
        :src="item.avatar"
        :alt="item.userName"
      />
      <p slot="content">
        {{ item.content }}
        {{ item.uid }}
      </p>
      <!-- <CommentBox
        class="comment"
        :userInfo="userInfo"
        :reply-info="replyInfo"
        :id="item.uid"
        @submit-box="submitBox"
        @cancel-box="cancelBox"></CommentBox> -->
      <CommentList :comments="item.reply"></CommentList>
    </a-comment>
  </div>
</template>
<script>
import CommentBox from './CommentBox.vue'
  export default {
      name: 'CommentList',
      props: ['comments'],
      components: {
            CommentBox
        },
      data () {
          return {}
      },
      methods: {
        // replyTo: function (item) {
        //   var lists = document.getElementsByClassName('comment')
        //   for (var i = 0; i < lists.length; i++) {
        //     lists[i].style.display = 'none'
        //   }
        //   // document.getElementById(uid).style.display = 'block'
        //   // this.replyInfo.replyUid = uid
        //   console.log(lists)
        //   console.log(item)
        //   console.log(document.getElementById('uid003'))
        // }
      }
    }
</script>
<style>
  .comment {
    display:none;
  }
</style>
