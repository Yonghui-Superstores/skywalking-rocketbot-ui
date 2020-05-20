export default () => {
  // let proId =  document.cookie.replace(/(?:(?:^|.*;\s*)externalProjectId\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  let proId = window.localStorage.getItem('externalProjectId')
  // console.log('当前storage中的Project-ID是：',  proId)
  return proId
};