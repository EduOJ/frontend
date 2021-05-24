<template>
  <div class="account-settings-info-view">
    禁用编程连字符：<a-switch size="large" v-model="non_ligature" @change="onChange" /><br>
    示例：
    <codemirror
      ref="demo_code"
      v-model="demo_code"
      :options="{
        lineNumbers: true,
        theme: 'darcula',
        mode: 'text/html',
        line: true,
        viewportMargin: Infinity,
        readOnly: true,
      }"/>
  </div>
</template>

<script>
import codemirror from '@/components/codemirror/codemirror'
export default {
  components: {
    codemirror
  },
  data () {
    console.log(localStorage.getItem('non_ligrature'))
    return {
      non_ligature: localStorage.getItem('non_ligrature') === 'true',
      demo_code: `>= <= != == === >> << && || `
    }
  },
  methods: {
    onChange (nonLigrature) {
      this.non_ligrature = nonLigrature
      localStorage.setItem('non_ligrature', nonLigrature)
      this.$refs.demo_code.setNonLigature(nonLigrature)
    }
  }
}
</script>

<style lang="less" scoped>

.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0,0,0,0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img, .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
