
<template>
  <div style="width: 300px">
    <div class="panel-header">
      <p class="test">勾选生效</p>
      <div>
        <el-button :icon="RefreshRight" size="small" circle @click="onRefresh" />
        <el-button type="primary" :icon="Plus" size="small" circle @click="onShowAddItem()" />
        <el-button type="danger" :icon="Delete" size="small" circle @click="onRemove" />
      </div>
    </div>
    <div style="height: 300px; border: 1px solid gray">
      <el-tree
        ref="refTree"
        :data="treeData"
        :props="{label: 'label', children: 'children' }"
        node-key="selector"
        :default-checked-keys="defaultChecked"
        show-checkbox
        default-expand-all
        @check-change="onCheckChange"
      >
        <template #default="{ node, data }">
          <p v-if="data.children">{{ data.label }}</p>
          <el-link v-else @click="onShowAddItem(data)">{{ data.label }}</el-link>
        </template>
      </el-tree>
    </div>
    <el-row style="margin-top: 10px">
      <el-input v-model="ioData" placeholder="导入导出的数据在这"/>
    </el-row>
    <el-row style="margin-top: 10px">
      <el-button @click="onReset" size="small">重置</el-button>
      <el-button @click="onExport" size="small">导出</el-button>
      <el-button @click="onImport" size="small">导入</el-button>
    </el-row>

    <el-row v-if="false">
      <el-input v-model="history" type="textarea" rows="8"></el-input>
    </el-row>
    <AddItem v-model="addVisible" @save="onAddItem" :editData="editData" />
  </div>
</template>

<script setup>
import { Delete, Plus, RefreshRight } from '@element-plus/icons-vue'
import AddItem from '@/components/AddItem.vue'

import {computed, onMounted, reactive, ref, watch} from 'vue'

const origin = ref('http://127.0.0.1')
const history = ref('')
const addVisible = ref(false)
const ioData = ref('')
const editData = ref('')
const refTree = ref(null)
let port = null
const data = reactive({
  label: origin.value,
  selector: origin.value,
  apply: true,
  children: []
})
watch(origin, v => {
  data.label = v
  data.selector = v
})
const treeData = computed(() => [data])
const defaultChecked = computed(() => data.children.filter(o => o.apply).map(o => o.selector))
const onRemove = () => {
  let checked = refTree.value.getCheckedNodes()
  checked.forEach(item => {
    const delIndex = data.children.findIndex(o => item.selector === o.selector)
    if(delIndex > -1) {
      data.children.splice(delIndex, 1)
    }
  })
  onSave()
}

const onCheckChange = () => {
  let checked = refTree.value.getCheckedNodes()
  const checkedMap = {}
  checked.forEach(i => checkedMap[i.selector] = true)
  data.children.forEach(item => {
    item.apply = !!checkedMap[item.selector];
  })
  onSave()
}

const onShowAddItem = (data) => {
  addVisible.value = true
  if(data) {
    editData.value = JSON.stringify(data)
  } else {
    editData.value = JSON.stringify({
      label: '',
      selector: '',
      apply: true,
      style: {}
    })
  }
}

const onAddItem = (item) => {
  try {
    if(item === '{}') return
    let dataItem = JSON.parse(item)
    let selector = dataItem.selector
    if(selector === data.selector) {
      return;
    }
    let tar = data.children.find(o => o.selector === selector)
    if(tar) {
      Object.assign(tar, dataItem)
    } else {
      data.children.push(dataItem)
    }
    onSave()
   } catch (e) {}
}

const onRefresh = () => {
  if(import.meta.env.MODE === 'development') return
  port.postMessage({
    fresh: true
  })
}
const onSave = () => {
  if(import.meta.env.MODE === 'development') return
  port.postMessage({
    save: JSON.stringify(data)
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
    import: ioData.value
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
      } else if(msg.origin) {
        origin.value = msg.origin
      } else if(msg.rules) {
        Object.assign(data, JSON.parse(msg.rules))
      } else if(msg.exportData) {
        ioData.value = msg.exportData
      }
    })
  })
})
</script>

<style scoped>
.panel-header {
    display: flex;
    justify-content: space-between;
}
.panel-header > p {
  margin: 5px 0;
}
</style>
