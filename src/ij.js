
window.addEventListener('load', () => {
  const origin = window.location.origin
  if(origin === 'https://blog.csdn.net') {
    window.document.designMode = 'on'
    $('#content_views').unbind('copy')
  } else if(origin === 'https://link.juejin.cn') {
    document.querySelector('.btn').click()
    createTip(
      document.querySelector('#app'),
      document.querySelector('.middle-page')
    )
  }
})

/**
 * 创建自动跳转提示信息
 * @param container
 * @param afterNode
 */
function createTip(container, afterNode) {
  const tip = document.createElement('div')
  tip.innerText = '自动跳转中...'
  tip.style.textAlign = 'center'
  tip.style.fontSize = '20px'
  tip.style.color = 'skyblue'
  container.insertBefore(tip, afterNode)
}
