<template>
  <a-row>
    <a-col :lg="16" :md="24">
      <a-card title="课程作业">
        <a-timeline>
          <a-timeline-item v-for="p in klass.problem_sets" :key="p.id" :color="color(p)">
            <router-link :to="{name: 'class.problemSet.problems', params: {classID: klass.id, problemSetID: p.id}}" v-if="started(p)">
              <div class="toolbar-row">
                <div class="problem-set-name">
                  {{ p.name }}
                </div>
                <div class="space">
                </div>
                <div>
                  {{ p.start_time.format("lll") }} ~ {{ p.end_time.format("lll") }}
                </div>
              </div>
            </router-link>
            <div class="toolbar-row" v-else>
              <div class="problem-set-name">
                {{ p.name }}
              </div>
              <div class="space">
              </div>
              <div>
                {{ p.start_time.format("lll") }} ~ {{ p.end_time.format("lll") }}
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'Dashboard',
  data () {
    return {
      klass: {}
    }
  },
  methods: {
    started (p) {
      return p.start_time.isBefore(moment())
    },
    available (p) {
      return p.end_time.isAfter(moment()) && p.start_time.isBefore(moment())
    },
    color (p) {
      if (p.end_time.isBefore(moment())) {
        return 'blue'
      } else if (p.end_time.isAfter(moment()) && p.start_time.isBefore(moment())) {
        return 'green'
      }
      return 'grey'
    }
  },
  watch: {
    storeClass: {
      handler (val) {
        if (val) {
          this.loading = false
          this.klass = val
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters({
      storeClass: 'class'
    })
  }
}
</script>

<style scoped lang="sass">
.toolbar-row
  display: flex
  width: 100%
  .problem-set-name
    font-size: 1.2em
    font-weight: bold
  :not(:last-child)
    margin-right: 5px
  .space
    flex: 1
</style>
