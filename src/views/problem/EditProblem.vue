<template>
  <a-row>
    <a-col :lg="{span:18,offset:3}">
      <a-card title="编辑题目">
        <a-form-model
          ref="form"
          :model="form"
          :rules="rules"
          @validate="onValidate"
        >
          <a-form-model-item ref="name" prop="name" label="题目名称" :help="validations.Name.help" :validate-status="validations.Name.validateStatus">
            <a-input
              size="large"
              v-model="form.name"
              placeholder="题目名称"
            >
              <a-icon slot="prefix" type="edit"/>
            </a-input>
          </a-form-model-item>
          <a-form-model-item ref="description" prop="description" label="题目描述" :help="validations.Description.help" :validate-status="validations.Description.validateStatus">
            <mark-down-editor ref="descriptionEditor" unique-id="description_markdown" v-model="form.description"/>
          </a-form-model-item>
          <a-form-model-item ref="public" prop="public" label="公开题目" :help="validations.Public.help" :validate-status="validations.Public.validateStatus">
            <a-switch size="large" v-model="form.public" />
          </a-form-model-item>
          <a-form-model-item
            ref="privacy"
            prop="privacy"
            label="隐私模式（暂不支持）"
            hidden
            :help="validations.Privacy.help"
            :validate-status="validations.Privacy.validateStatus">
            <a-switch size="large" v-model="form.privacy" disabled />
          </a-form-model-item>
          <a-form-model-item ref="tags" prop="tags" label="标签" :help="validations.Tags.help" :validate-status="validations.Tags.validateStatus">
            <a-select
              size="large"
              mode="tags"
              placeholder="标签"
              v-model="form.tags"
              style="width: 300px"
            >
            </a-select>
          </a-form-model-item>

          <a-form-model-item ref="any_language_allowed" prop="any_language_allowed" label="允许使用任何语言？" :help="validations.LanguageAllowAny.help" :validate-status="validations.LanguageAllowAny.validateStatus">
            <a-switch size="large" v-model="form.any_language_allowed"/>
          </a-form-model-item>

          <a-form-model-item ref="language_allowed" prop="language_allowed" label="允许使用的语言" :help="validations.LanguageAllowed.help" :validate-status="validations.LanguageAllowed.validateStatus">
            <a-select
              size="large"
              mode="multiple"
              placeholder="允许使用哪些语言？"
              v-model="form.language_allowed"
              style="width: 300px"
              :disabled="form.any_language_allowed"
            >
              <a-select-option v-for="(language, key) of languageConf" :key="key">
                {{ language.displayName }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item ref="memory_limit" prop="memory_limit" label="内存限制" :help="validations.MemoryLimit.help" :validate-status="validations.MemoryLimit.validateStatus">
            <a-input-group compact>
              <a-input size="large" v-model="form.memory_limit" style="width: 200px"/>
              <a-select size="large" v-model="form.memory_limit_unit" style="width: 100px">
                <a-select-option key="KiB" value="KiB">
                  KiB
                </a-select-option>
                <a-select-option key="MiB" value="MiB">
                  MiB
                </a-select-option>
                <a-select-option key="GiB" value="GiB">
                  GiB
                </a-select-option>
              </a-select>
            </a-input-group>
          </a-form-model-item>

          <a-form-model-item ref="time_limit" prop="time_limit" label="时间限制" :help="validations.TimeLimit.help" :validate-status="validations.TimeLimit.validateStatus">
            <a-input size="large" v-model="form.time_limit" style="width: 300px" suffix="ms"/>
          </a-form-model-item>

          <a-form-model-item ref="build_arg" prop="build_arg" label="编译选项" :help="validations.BuildArg.help" :validate-status="validations.BuildArg.validateStatus">
            <a-input size="large" v-model="form.build_arg" style="width: 300px" placeholder="一般不需要填写"/>
          </a-form-model-item>

          <a-form-model-item ref="compare_script_name" prop="compare_script_name" label="评测脚本" :help="validations.CompareScriptName.help" :validate-status="validations.CompareScriptName.validateStatus">
            <a-select
              size="large"
              v-model="form.compare_script_name"
              style="width: 300px"
            >
              <a-select-option v-for="k in comparerConf.keys" :key="k">
                {{ comparerConf[k].name }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item ref="attachment_file" prop="attachment_file" label="题目附件">
            <a-upload :file-list="form.attachment_file" :before-upload="beforeUpload(form, 'attachment_file')" :remove="_ => {this.form.attachment_file = []}">
              <a-button> <a-icon type="upload" /> 选择附件 </a-button>
            </a-upload>
          </a-form-model-item>
          <a-space direction="vertical">
            <a-space>
              <a-button-group>
                <a-button @click="addTestCase">
                  <a-icon type="plus" />增加测试用例
                </a-button>
                <a-button type="danger" @click="removeAllTestCase">
                  <a-icon type="delete" />全部删除
                </a-button>
              </a-button-group>
              <a-button-group>
                <a-upload
                  :file-list="bulkAddTestCaseDummy"
                  :before-upload="bulkCreateTestCasePickFile"
                  style="display: inline-block;"
                  directory
                >
                  <a-button :file-list="[]" :before-upload="bulkCreateTestCasePickFile">
                    <a-icon type="copy" /> {{ bulkAddTestCase.length === 0 ? "选择文件" : "已选择" }}
                  </a-button>
                </a-upload>
                <a-button @click="bulkCreateTestCase()">
                  <a-icon type="plus" /> 批量新建（会覆盖当前所有测试用例！）
                </a-button>
              </a-button-group>
            </a-space>
            <a-card v-for="t in form.test_cases" :key="t.id">
              <span slot="title">
                {{ testCaseTitle(t) }}
                <a-switch
                  checked-children="样例"
                  un-checked-children="私密"
                  v-model="t.sample"
                  @change="changed(t)"
                  :disabled="t.deleted" />
              </span>
              <span slot="extra" v-if="t.newly_created === false">
                <a-button type="danger" @click="_ => {t.deleted = true}" v-if="t.deleted === false">
                  <a-icon type="delete"></a-icon> 删除
                </a-button>
                <a-button type="danger" @click="_ => {t.deleted = false}" v-else>
                  <a-icon type="rollback"></a-icon> 撤销
                </a-button>
              </span>
              <span slot="extra" v-else>
                <a-button type="danger" @click="_ => {form.test_cases.splice(form.test_cases.indexOf(t), 1)}">
                  <a-icon type="delete"></a-icon> 删除
                </a-button>
              </span>
              <a-row :gutter="16">
                <a-col :lg="8">
                  <a-form-model-item :ref="t.id + '_score'" :prop="t.id + '_score'" label="分数（ 0 代表 100 / 测试点数量）" @change="changed(t)">
                    <a-input
                      size="large"
                      v-model="t.score"
                      placeholder="分数（ 0 代表 100 / 测试点数量）"
                      :disabled="t.deleted"
                    >
                      <a-icon slot="prefix" type="edit"/>
                    </a-input>
                  </a-form-model-item>
                </a-col>
                <a-col :lg="8">
                  <a-form-model-item :ref="t.id + '_input_file'" :prop="t.id + '_input_file'" label="输入文件">
                    <a-upload
                      :disabled="t.deleted"
                      :file-list="t.input_file"
                      :before-upload="beforeUpload(t, 'input_file', true)"
                      :remove="_ => {t.input_file = []}" >
                      <a-button> <a-icon type="upload" /> 输入文件 </a-button>
                    </a-upload>
                  </a-form-model-item>
                </a-col>
                <a-col :lg="8">
                  <a-form-model-item :ref="t.id + '_output_file'" :prop="t.id + '_output_file'" label="输出文件">
                    <a-upload
                      :disabled="t.deleted"
                      :file-list="t.output_file"
                      :before-upload="beforeUpload(t, 'output_file', true)"
                      :remove="_ => {t.output_file = []}">
                      <a-button> <a-icon type="upload" /> 输出文件 </a-button>
                    </a-upload>
                  </a-form-model-item>
                </a-col>
              </a-row>
            </a-card>
            <a-form-model-item :wrapper-col="{ span: 18, offset: 6 }">
              <a-space>
                <a-button
                  type="primary"
                  @click="onSubmit"
                  class="register-button"
                  :loading="submitBtnLoading"
                  :disabled="submitBtnLoading"
                  size="large">
                  保存
                </a-button>
                <a-button
                  type="secondary"
                  @click="$router.go(-1)"
                  size="large">
                  返回
                </a-button>
              </a-space>
            </a-form-model-item>
          </a-space>
        </a-form-model>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { getProblem, updateProblem, createTestCase, updateTestCase, deleteTestCase, deleteAllTestCase } from '@/api/problem'
import MarkDownEditor from '@/components/Editor/MarkdownEditor'
import { v4 as uuid } from 'uuid'
import languageConf from '@/config/languageConf'
import comparerConf from '@/config/comparerConf'

export default {
  components: {
    MarkDownEditor
  },
  data () {
    return {
      comparerConf,
      languageConf,
      submitBtnLoading: false,
      defaultFileList: [],
      form: {
        name: '',
        description: '',
        public: true,
        privacy: false,
        memory_limit: 0,
        memory_limit_unit: 'MiB',
        time_limit: 0,
        language_allowed: [],
        build_arg: '',
        compare_script_name: '',
        attachment_file: [],
        deleteAllTestCase: false,
        any_language_allowed: false
      },
      bulkAddTestCase: [],
      bulkAddTestCaseDummy: [],
      rules: {
        name: [
          { required: true, message: '请输入题目名称', trigger: 'blur' },
          { max: 255, message: '题目名称最长为255个字符', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入题目描述', trigger: 'blur' }
        ],
        public: [
          { required: true, message: '请选择是否公开', trigger: 'blur' }
        ],
        privacy: [
          { required: true, message: '请选择隐私模式', trigger: 'blur' }
        ],
        memory_limit: [
          { required: true, message: '请输入内存限制', trigger: 'blur' }
        ],
        language_allowed: [
          { required: true, message: '请选择允许的语言', trigger: 'blur' }
        ],
        time_limit: [
          { required: true, message: '请输入时间限制', trigger: 'blur' }
        ],
        build_arg: [
          { max: 255, message: '编译选项最长为255个字符', trigger: 'blur' }
        ],
        compare_script_name: [
          { required: true, message: '请选择评测脚本', trigger: 'blur' }
        ],
        any_language_allowed: [
          { required: true, message: '请选择是否允许所有语言', trigger: 'blur' }
        ]
      },
      validations: {
        Name: {
          help: '',
          validateStatus: ''
        },
        Description: {
          help: '',
          validateStatus: ''
        },
        Public: {
          help: '',
          validateStatus: ''
        },
        Privacy: {
          help: '',
          validateStatus: ''
        },
        MemoryLimit: {
          help: '',
          validateStatus: ''
        },
        Tags: {
          help: '',
          validateStatus: ''
        },
        TimeLimit: {
          help: '',
          validateStatus: ''
        },
        LanguageAllowed: {
          help: '',
          validateStatus: ''
        },
        BuildArg: {
          help: '',
          validateStatus: ''
        },
        CompareScriptName: {
          help: '',
          validateStatus: ''
        },
        LanguageAllowAny: {
          help: '',
          validateStatus: ''
        }
      }
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
      getProblem(this.$route.params.id).then(data => {
        this.form = Object.assign({}, this.form, data.problem)
        if (data.problem.memory_limit > 1024 * 1024 * 1024) {
          this.form.memory_limit = data.problem.memory_limit / (1024 * 1024 * 1024)
          this.form.memory_limit_unit = 'GiB'
        } else if (data.problem.memory_limit > 1024 * 1024) {
          this.form.memory_limit = data.problem.memory_limit / (1024 * 1024)
          this.form.memory_limit_unit = 'MiB'
        } else {
          this.form.memory_limit = data.problem.memory_limit / (1024)
          this.form.memory_limit_unit = 'KiB'
        }
        if (data.problem.attachment_file_name) {
          this.$set(this.form.attachment_file, 0, {
              uid: '1',
              name: data.problem.attachment_file_name,
              status: 'done'
            }
          )
        }
        this.form.any_language_allowed = data.problem.language_allowed.includes('any')
        this.form.language_allowed = data.problem.language_allowed.filter(v => v !== 'any')
        this.form.test_cases.forEach((v) => {
          this.$set(v, 'newly_created', false)
          this.$set(v, 'deleted', false)
          this.$set(v, 'changed', false)
          this.$set(v, 'input_file', [
            { 'uid': '1', 'name': v.input_file_name, 'status': 'done' }
          ])
          this.$set(v, 'output_file', [
            { 'uid': '1', 'name': v.output_file_name, 'status': 'done' }
          ])
        })
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.$error({
          'title': '获取题目信息失败',
          'content': {
            'NOT_FOUND': '题目不存在'
          }[err]
        })
      })
    },
    changed (t) {
      t.changed = true
    },
    addTestCase () {
      this.form.test_cases.push({
        id: uuid(),
        'problem_id': this.form.id,
        'score': 0,
        'sample': false,
        'newly_created': true,
        'input_file': [],
        'output_file': []
      })
    },
    removeAllTestCase () {
      this.form.deleteAllTestCase = true
      this.form.test_cases = []
    },
    testCaseTitle (t) {
      if (t.newly_created) {
        return '新测试用例'
      }
      return '测试用例 ' + t.id
    },
    onValidate (prop, passed, help) {
      if (passed) {
        switch (prop) {
          case 'name':
            this.validations.Name.help = ''
            break
          case 'description':
            this.validations.Description.help = ''
            break
          case 'public':
            this.validations.Public.help = ''
            break
          case 'privacy':
            this.validations.Privacy.help = ''
            break
          case 'memory_limit':
            this.validations.MemoryLimit.help = ''
            break
          case 'time_limit':
            this.validations.TimeLimit.help = ''
            break
          case 'compare_script_name':
            this.validations.CompareScriptName.help = ''
            break
          case 'language_allowed':
            this.validations.LanguageAllowed.help = ''
            break
          case 'any_language_allowed':
            this.validations.LanguageAllowAny.help = ''
            break
          case 'build_arg':
            this.validations.BuildArg.help = ''
            break
        }
      }
    },
    beforeUpload (value, field, markChanged = false) {
      return (file) => {
        if (markChanged) {
          value.changed = true
        }
        value[field] = [ file ]
        return false
      }
    },
    bulkCreateTestCasePickFile (file) {
      this.bulkAddTestCase.push(file)
      return false
    },
    bulkCreateTestCase () {
      this.removeAllTestCase()
      if (this.bulkAddTestCase.length === 0) {
        this.$error({
          content: '请先选择文件'
        })
        return
      }
      const files = {}
      for (const f of this.bulkAddTestCase) {
        files[f.name] = f
      }
      let message = ''
      let success = true
      for (const file in files) {
        if (file.endsWith('.in')) {
          // is a valid input file
          let outputFile = ''
          let sample = false
          if (file.replace('.in', '.ans') in files) {
            outputFile = file.replace('.in', '.ans')
          }
          if (file.replace('.in', '.out') in files) {
            outputFile = file.replace('.in', '.out')
          }
          if (file.search('sample') !== -1) {
            sample = true
          }
          if (outputFile === '') {
            success = false
            message += `文件${file}不存在对应的输出文件！\n`
            continue
          }
          this.form.test_cases.push({
            id: uuid(),
            'problem_id': this.form.id,
            'score': 0,
            'sample': sample,
            'newly_created': true,
            'input_file': [files[file]],
            'output_file': [files[outputFile]]
          })
          message += `增加了${sample ? '样例数据' : '私密数据'} ${file},${outputFile}\n`
          continue
        }
        if (file.search('ans') === -1 && file.search('out') === -1) {
          message += `忽略了${file}\n`
        }
      }
      if (success) {
        message += '不要忘了点击最下面的保存哦！'
        message = message.split('\n').map(m => {
          return (<p style="margin-block-end: 0;"> {m} </p>)
        })
        this.$success({
          title: '添加成功！',
          content: (h) => {
            return (
              <div>
                {message}
              </div>
            )
          }
        })
      } else {
        message = message.split('\n').map(m => {
          return (<p style="margin-block-end: 0;"> {m} </p>)
        })
        this.$error({
          content: (h) => {
            return (
              <div>
                {message}
              </div>
            )
          }
        })
      }
      console.log(files)
    },
    onSubmit () {
      this.submitBtnLoading = true
      this.$refs.form.validate(valid => {
        if (valid) {
          let attachmentFile = null
          if (this.form.attachment_file.length !== 0) {
            if (this.form.attachment_file[0] instanceof File) {
              attachmentFile = this.form.attachment_file[0]
            }
          }
          for (const t of this.form.test_cases) {
            if (t.newly_created) {
              if (t.input_file.length === 0 || t.output_file.length === 0) {
                this.$error({
                  title: '错误',
                  content: '新建的测试用例需要输入/输出文件'
                })
                return
              }
            }
          }
          const promises = [updateProblem(this.$route.params.id, {
            name: this.form.name,
            description: this.form.description,
            public: this.form.public,
            privacy: this.form.privacy,
            memory_limit: this.form.memory_limit * {
              KiB: 1024,
              MiB: 1024 * 1024,
              GiB: 1024 * 1024 * 1024
            }[this.form.memory_limit_unit],
            time_limit: this.form.time_limit,
            language_allowed: this.form.any_language_allowed ? 'any' : this.form.language_allowed.join(','),
            build_arg: this.form.build_arg,
            compare_script_name: this.form.compare_script_name,
            attachment_file: attachmentFile,
            tags: this.form.tags
          })]
          if (this.form.deleteAllTestCase) {
            promises.push(deleteAllTestCase(this.form.id))
          }
          for (const t of this.form.test_cases) {
            if (t.newly_created) {
              promises.push(createTestCase({
                problem_id: t.problem_id,
                score: t.score,
                sample: t.sample,
                input_file: t.input_file[0],
                output_file: t.output_file[0]
              }))
            } else {
              if (t.deleted) {
                promises.push(deleteTestCase(t))
              } else if (t.changed) {
                let inputFile = null
                let outputFile = null
                if (t.input_file[0] instanceof File) {
                  inputFile = t.input_file[0]
                }
                if (t.output_file[0] instanceof File) {
                  outputFile = t.output_file[0]
                }
                promises.push(updateTestCase({
                  problem_id: t.problem_id,
                  id: t.id,
                  score: t.score,
                  sample: t.sample,
                  input_file: inputFile,
                  output_file: outputFile
                }))
              }
            }
          }
          Promise.allSettled(promises).then(result => {
            this.submitBtnLoading = false
            let rejected = false
            for (const r of result) {
              if (r.status === 'rejected') {
                rejected = true
                if (r.reason.message === 'VALIDATION_ERROR') {
                  r.reason.response.error.forEach(v => {
                    this.validations[v.field].help = v.translation
                    this.validations[v.field].validateStatus = 'error'
                  })
                } else if (r.reason.message === 'INTERNAL_ERROR') {
                  this.$notification['error']({
                    message: '错误',
                    description: '服务器内部错误，请稍后再试',
                    duration: 4
                  })
                } else {
                  this.$error({
                    title: '错误',
                    content: ({
                      INVALID_FILE: '非法的文件'
                    }[r.reason.message] || r.reason.message) || '请求出现错误，请稍后再试'
                  })
                }
              }
            }
            if (!rejected) {
              this.fetch()
              this.$confirm({
                title: '成功',
                content: '编辑成功',
                cancelText: '返回',
                okText: '继续编辑',
                icon: () => <a-icon type="check-circle" style="color: #52c41a !important;"/>,
                onCancel: () => {
                  this.$router.go(-1)
                }
              })
            }
          })
        } else {
          this.submitBtnLoading = false
          return false
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.ant-space.ant-space-vertical
  width: 100%
</style>
