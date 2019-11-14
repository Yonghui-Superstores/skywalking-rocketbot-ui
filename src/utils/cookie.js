export default () => {
  let proId =  document.cookie.replace(/(?:(?:^|.*;\s*)externalProjectId\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  console.log('当前cookie中的ID是：',  proId)
  return proId
};