/**
 * 获取在线配置
 * @param port
 */
function postWebRule(port) {
  fetch('https://raw.githubusercontent.com/YongTay/plugin-config/main/favourite-ui.config.json')
    .then(res => res.text())
    .then(res => {
      port.postMessage({
        data: res
      })
    })
    .catch(() => {
      port.postMessage({
        error: '配置同步失败'
      })
    })
}

// 消息处理
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'my-background') return
  port.onMessage.addListener(msg => {
    if (msg.webRule) {
      postWebRule(port)
    }
  })
})


