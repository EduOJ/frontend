<template>
  <div class="account-settings-info-view">
    <a-button type="primary" @click="start" :loading="loading">
      开始配置
    </a-button>
  </div>
</template>

<script>

import { beginRegister, finishRegister } from '@/api/webauthn'
import base64url from 'base64-url'

export default {
  components: {
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    start () {
      this.loading = true
      beginRegister().then(resp => {
        this.loading = false
        resp.publicKey.challenge = Buffer.from(unescape(base64url.unescape(resp.publicKey.challenge)), 'base64')
        resp.publicKey.user.id = Buffer.from(unescape(base64url.unescape(resp.publicKey.user.id)), 'base64')
        navigator.credentials.create(resp).then(data => {
          const p = {
            id: data.id,
            type: data.type,
            rawId: base64url.encode(data.rawId),
            response: {
              clientDataJSON: base64url.encode(data.response.clientDataJSON),
              attestationObject: base64url.encode(data.response.attestationObject)
            }
          }
          finishRegister(p).then(resp => {
            this.$success({
              content: '安全密钥配对成功'
            })
          }).catch(err => {
            if (err.message === 'INTERNAL_ERROR') {
              this.$error({
                content: '内部错误' + err.response.error
              })
            }
          })
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        this.loading = false
        if (err.message === 'INTERNAL_ERROR') {
          this.$error({
            content: '内部错误' + err.response.error
          })
        }
      })
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
