/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = {
  devServer: {
    proxy: {
      '/graphql': {
        // target: 'http://10.67.85.171:12800/',
        
        target: 'http://10.251.112.3:22800/',

        // target: 'http://devtrace.itwork.yonghui.cn/',
        // target: `${process.env.SW_PROXY_TARGET || 'http://127.0.0.1:12800'}`,
        // target: 'http://122.112.182.72:12800/',
        changeOrigin: true,
      },
      '/user': {
        // target: 'http://10.67.85.171:8080/',
        
        target: 'http://10.251.112.3:8090/',
        
        // target: 'http://devtrace.itwork.yonghui.cn/',
        // target: 'http://122.112.182.72:8080/',
        changeOrigin: true,
      }
    },
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: '[name]',
      });
  },
};
