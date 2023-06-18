
chrome.runtime.onConnect.addListener(port => {
  if(port.name !== 'my-background') return
})

