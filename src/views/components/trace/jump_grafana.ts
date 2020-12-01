const jumpGrafana = (component: any) => {
  const hostName = document.location.hostname;
  const tag = buildTag(component);
  const url = 'http://monitor-prod.grafana-admin.gw.yonghui.cn/v1/rewriter/';
  let env = 'itwork-non-prod/';

  const group = window.localStorage.getItem('organizationCode');
  if (hostName.indexOf('devtrace') !== -1 ||
      hostName.indexOf('testtrace') !== -1 ||
      hostName.indexOf('uattrace') !== -1) {
    // 开发/测试环境
    // url = 'http://yhmonitor-test.grafana.sitgw.yonghui.cn/';
    env = 'itwork-non-prod/';
  }
  if (hostName.indexOf('prdtrace') !== -1) {
    // 开发/测试环境
    env = 'itwork-prod/';
  }

  window.open(url + env + group + '/' + tag, '_blank');
  };

function buildTag(component: any) {
  if (component.indexOf('mysql') !== -1) {
    component = 'mysql';
  }
  if (component.indexOf('kafka') !== -1) {
    component = 'kafka';
  }
  if (component.indexOf('elasticsearch') !== -1) {
    component = 'elasticsearch';
  }
  if (component.indexOf('mongoDB') !== -1) {
    component = 'mongoDB';
  }
  if (component.indexOf('redis') !== -1) {
    component = 'redis';
  }
  if (component.indexOf('rocketMQ') !== -1) {
    component = 'rocketMQ';
  }
  if (component.indexOf('telegraf') !== -1) {
    component = 'telegraf';
  }

  const tags = ['kafka', 'elasticsearch', 'mongoDB', 'redis', 'mysql', 'rocketMQ', 'telegraf'];
  let tag = 'kubernetes';

  if (tags.indexOf(component) !== -1) {
    tag = tags[tags.indexOf(component)];
  }
  return tag;
}

export default jumpGrafana;
