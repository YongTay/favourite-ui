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
let curPort

function initCurrentStorage() {
  const origin = window.location.origin
  log('初始化空对象')
  // 初始化空对象
  chrome.storage.sync.set({
    [origin]: {}
  })
}

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

function resetRule() {
  const origin = window.location.origin
  log('重置: {}')
  chrome.storage.sync.set({
    [origin]: {}
  })
}

function handleSave(jsonStr) {
  log(`保存数据：${jsonStr}`)
  const key = window.location.origin
  chrome.storage.sync.set({
    [key]: JSON.parse(jsonStr)
  })
  log('开始应用规则')
  applyRule()
}

function applyRule() {
  const origin = window.location.origin
  chrome.storage.sync.get(origin, res => {
    const rule = res[origin]
    // {"#id":{"display":"none"}}
    for(const selector in rule) {
      applyStyle(selector, rule[selector])
    }
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

function handleExport() {
  chrome.storage.sync.get((res) => {
    console.log(JSON.stringify(res))
  })
}

function handleImport(jsonStr) {
  const json = JSON.parse(jsonStr)
  for(const key in json) {
    chrome.storage.sync.set({
      [key]: json[key]
    })
  }
}


chrome.runtime.onConnect.addListener(port => {
  if(port.name !== 'my-content') return
  log = createLogger(port)
  curPort = port
  const origin = window.location.origin
  console.log(port)
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
      postRule()
    } else if(msg.export) {
      handleExport()
    } else if(msg.import) {
      handleImport(msg.import)
    }
  })
})

