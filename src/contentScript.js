// 脚本初始化时执行次数
let count = 50
let timer = setInterval(() => {
  if(count <= 1) {
    clearInterval(timer)
  }
  count -= 1
  applyRule()
}, 10)

/**
 * 日志记录
 * @param port
 * @returns {(function(*): void)|*}
 */
function createLogger(port) {
  return function (op) {
    port.postMessage({
      op
    })
  }
}
let log = () => {}

// 长久连接的通道
let curPort // 和界面通信

// 和background通信
const backgroundPort = chrome.runtime.connect({name: 'my-background'})
backgroundPort.postMessage({ping: 'ping'})
backgroundPort.onMessage.addListener(msg => {
  if(msg.error) {
    errorMessage(msg.error)
  } else if(msg.info) {
    infoMessage(msg.info)
  } else if(msg.success) {
    successMessage(msg.success)
  }
})
/**
 * 初始化
 */
function initCurrentStorage() {
  const origin = window.location.origin
  log('初始化空对象')
  // 初始化空对象
  chrome.storage.sync.set({
    [origin]: {}
  })
}

/**
 * 发送规则到面板
 * @param str
 */
function postRule(str) {
  if(!str) {
    chrome.storage.sync.get(origin, res => {
      const str = JSON.stringify(res[origin])
      if(!str) {
        initCurrentStorage()
      }
      postRule(str)
    })
  } else {
    log(`获取缓存数据: ${str}`)
    curPort.postMessage({
      rules: str
    })
  }
}

/**
 * 重置
 */
function resetRule() {
  // const origin = window.location.origin
  log('重置: {}')
  chrome.storage.sync.clear()
  // chrome.storage.sync.set({
  //   [origin]: {}
  // })
}

/**
 * 保存
 * @param jsonStr
 */
function handleSave(jsonStr) {
  log(`保存数据：${jsonStr}`)
  const key = window.location.origin
  chrome.storage.sync.set({
    [key]: JSON.parse(jsonStr)
  })
  log('开始应用规则')
  applyRule()
}

/**
 * 规则应用
 */
function applyRule() {
  const origin = window.location.origin
  chrome.storage.sync.get(origin, res => {
    if(!res[origin] || !res[origin].children) return
    const rule = res[origin].children || []
    rule.forEach(r => {
      if(r.apply) {
        applyStyle(r.selector, r.style)
      }
    })
  })
}

function applyStyle(selector, style) {
  let elms = document.querySelectorAll(selector) || []
  for(let i=0; i<elms.length;  i++) {
    const ele = elms[i]
    if(ele) {
      log(`${selector} -> 开始应用规则：${JSON.stringify(style)}`)
      setStyle(ele, style)
    } else {
      log(`${selector} -> 找不到元素`)
    }
  }
}

function setStyle(ele, props) {
  for(const prop in props) {
    ele.style[prop] = props[prop]
  }
}

/**
 * 数据导出到面板
 */
function handleExport() {
  chrome.storage.sync.get((res) => {
    curPort.postMessage({
      exportData: JSON.stringify(res)
    })
  })
}

/**
 * 数据导入
 * @param jsonStr
 */
function handleImport(jsonStr) {
  const json = JSON.parse(jsonStr)
  for(const key in json) {
    chrome.storage.sync.set({
      [key]: json[key]
    })
  }
  postRule()
  applyRule()
  log(`导入成功`)
  successMessage('导入成功')
}

/**
 * 同步网络配置
 */
function handleSyncRule () {
  backgroundPort.postMessage({webRule: true})
  backgroundPort.onMessage.addListener(msg => {
    handleImport(msg.data)
  })
}

function infoMessage(msg) {
  if(!curPort) return
  curPort.postMessage({
    info: msg
  })
}

function successMessage(msg) {
  if(!curPort) return
  curPort.postMessage({
    success: msg
  })
}

function errorMessage(msg) {
  if(!curPort) return
  curPort.postMessage({
    error: msg
  })
}

/**
 * 消息处理
 */
chrome.runtime.onConnect.addListener(port => {
  if(port.name !== 'my-content') return
  log = createLogger(port)
  curPort = port
  const origin = window.location.origin
  log('start...')
  applyRule()
  log('回传域名信息')
  // 回传域名信息
  port.postMessage({
    origin: window.location.origin
  })

  // 获取缓存的数据
  chrome.storage.sync.get(origin, res => {
    const str = JSON.stringify(res[origin])
    if(!str) {
      initCurrentStorage()
    }
    postRule(str)
  })

  // 消息监听
  port.onMessage.addListener(msg => {
    if(msg.save) {
      handleSave(msg.save)
    } else if(msg.reset) {
      resetRule()
    } else if(msg.export) {
      handleExport()
    } else if(msg.import) {
      handleImport(msg.import)
    } else if(msg.fresh) {
      postRule()
      applyRule()
    } else if(msg.syncRule) {
      handleSyncRule(msg.syncRule)
    }
  })
})

const injectScript = (file, node) => {
  const th = document.querySelector(node);
  const s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th.appendChild(s);
};
injectScript( chrome.runtime.getURL('ij.js'), 'body');
