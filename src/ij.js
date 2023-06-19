
window.addEventListener('load', () => {
  if(window.location.origin === 'https://blog.csdn.net') {
    window.document.designMode = 'on'
    $('#content_views').unbind('copy')
  }
})
