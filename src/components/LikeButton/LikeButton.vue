<template>
  <div :count="count" :isLike="isLike" >
    <a-tooltip title="Like">
      <a-icon type="like" :theme="isLike === true ? 'filled' : 'outlined'" @click="like" />
    </a-tooltip>
    <span style="padding-left: '8px' cursor: 'auto'">
      {{ this.count }}
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getLikes, like } from '@/api/solution'

export default {
  name: 'LikeButton',
  props: {
    solutionId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      count: 0,
      isLike: false
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.user.info
    })
  },
  methods: {
    fetch () {
      getLikes({
        solutionId: this.solutionId,
        userId: this.user.id
      }).then(resp => {
        console.log(resp)
        // this.count = resp.count
        // this.isLike = resp.islike
      }).catch(err => {
        console.log(err)
      })
    },

    like () {
      // console.log(this.user.id)
      if (!this.isLike) {
        // console.log('before', this.isLike)
        this.count += 1
        this.isLike = true
        like({
          solutionId: this.solutionId,
          userId: this.user.id,
          isLike: this.isLike
        })
        // console.log('after', this.isLike)
      } else {
        this.count -= 1
        this.isLike = false
        like({
          solutionId: this.solutionId,
          userId: this.user.id,
          isLike: this.isLike
        })
        // console.log('cancel', this.isLike)
      }
    }
  },
  mounted () {
    // this.fatch()
    // this.render()
  }
}

</script>
