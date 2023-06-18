<template>
  <el-drawer
    v-model="props.modelValue"
    direction="btt"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :with-header="false"
    size="50%"
    @close="onClose"
  >
    <template #default>
      <VAceEditor
        v-model:value="data"
        lang="json"
        theme="chrome"
        style="height: 200px; border: 1px solid gray"
        :readonly="false"
        :options="options"
      />
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-text type="danger">{{ info }}</el-text>
        <el-button size="small" @click="onFormat">格式化</el-button>
        <el-button size="small" @click="onSave">保存</el-button>
        <el-button size="small" @click="onClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { VAceEditor } from 'vue3-ace-editor'
import {ref, defineProps, defineEmits, watch} from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editData: {
    type: String,
    default: ''
  }
})

const emits = defineEmits('update:modelValue', 'save')

const options = {
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  tabSize: 2,
  showPrintMargin: false,
  fontSize: 13
}
const data = ref('{}')
const info = ref('')

watch(
  () => props.modelValue,
  val => {
    data.value = props.editData
    onFormat()
})

const onClose = () => {
  data.value = '{}'
  emits('update:modelValue', false)
}

const checkField = () => {
  const dataVal = JSON.parse(data.value)
  info.value = ''
  if(!dataVal.label) {
    info.value = 'label 不能为空'
    return false
  }
  if(!dataVal.selector) {
    info.value = 'selector 不能为空'
    return false
  }
  if(!dataVal.style) {
    info.value = 'style 不能为空'
    return false
  }
  return true
}
const onSave = () => {
  if(checkField()) {
    emits('save', data.value)
    emits('update:modelValue', false)
  }
}

const onFormat = () => {
  data.value = JSON.stringify(JSON.parse(data.value), null, 2)
}

</script>
