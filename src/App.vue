
<template>
  <div style="width: 300px">
    <p>{{ origin }}</p>
    <el-row>
      <el-button @click="onFmtJSON" circle>{ }</el-button>
    </el-row>
<!--    <el-row>-->
<!--      <el-input v-model="rules" type="textarea" rows="8"></el-input>-->
<!--    </el-row>-->
    <v-ace-editor
      v-model:value="rules"
      lang="json"
      theme="chrome"
      style="height: 300px; border: 1px solid gray"
      :readonly="false"
      :options="options"
    />
    <el-row style="margin-top: 10px">
      <el-button @click="onSave">保存</el-button>
      <el-button @click="onReset">重置</el-button>
      <el-button @click="onExport">导出</el-button>
      <el-button @click="onImport">导入</el-button>
    </el-row>

    <el-row v-if="false">
      <el-input v-model="history" type="textarea" rows="8"></el-input>
    </el-row>

  </div>
</template>

<script setup>
import { VAceEditor } from 'vue3-ace-editor'
import {onMounted, ref } from 'vue'

const origin = ref('')
const rules = ref('')
const history = ref('')
let port = null

const options = {
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  tabSize: 2,
  showPrintMargin: false,
  fontSize: 13
}

const onFmtJSON = () => {
  rules.value = JSON.stringify(JSON.parse(rules.value), null, 2)
}

const onSave = () => {
  if(import.meta.env.MODE === 'development') return
  port.postMessage({
    save: rules.value
  })
}
const onReset = () => {
  if(import.meta.env.MODE === 'development') return
  port.postMessage({
    reset: true
  })
}

const onExport = () => {
  if(import.meta.env.MODE === 'development') return
  port.postMessage({
    export: true
  })
}

const onImport = () => {
  if(import.meta.env.MODE === 'development') return
  port.postMessage({
    import: rules.value
  })
}

onMounted(() => {
  if(import.meta.env.MODE === 'development') return
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0]
    port = chrome.tabs.connect(tab.id, {name: 'my-content'})
    // 发送一个空消息去触发返回的消息信息
    port.postMessage({tabId: tab.id})
    port.onMessage.addListener((msg) => {
      if(msg.op) {
        history.value += msg.op + '\n'
      }
      if(msg.origin) {
        origin.value = msg.origin
      }
      if(msg.rules) {
        rules.value = JSON.stringify(JSON.parse(msg.rules), null, 2)
      }
    })
  })
})
</script>

<style scoped>
</style>
