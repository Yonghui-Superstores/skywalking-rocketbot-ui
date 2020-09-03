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

<template>
  <RkEchartsScatter ref="chart" :option="option" :xAxisData="this.scatterData.xAxisData" :autoResize="true"/>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Action, Getter, State, Mutation } from 'vuex-class';
import Axios, { AxiosResponse } from 'axios';

@Component
export default class Request extends Vue {
  @State('scatterData') private scatterData: any;
  @Prop() private data!: any;

  get option() {
      return {
          animation: false,
          legend: {
              top: 0,
              right: 0,
              data: ['Success', 'Error'],
              itemWidth: 10,
              itemHeight: 10,
              textStyle: {
                  color: '#000',
                  fontSize: 10,
              },
          },
          grid: {
              top: 20,
              left: 3,
              right: 0,
              bottom: 5,
              containLabel: true,
          },
          toolbox: {
            show: false,
          },
          tooltip: {
              trigger: 'none',
              axisPointer: {
                type: 'cross',
              },
            },
          brush: {
              toolbox: ['rect'],
              xAxisIndex: 'all',
              throttleType: 'debounce',   // 开启选中延迟后调用回调延迟
              throttleDelay: 1000,        // 选中延迟后调用回调延迟时间
          },
          xAxis: [{
              type: 'category',
              scale: true,
              data: this.scatterData.xAxisData,
              nameTextStyle: {
                  color: '#3259B8',
                  fontSize: 14,
              },
              axisTick: {
              lineStyle: { color: '#c1c5ca41' },
              alignWithLabel: true,
              },
              axisLine: {
                  lineStyle: {
                    color: '#3259B8',
                  },
              },
              axisLabel: { color: '#9da5b2', fontSize: '11' },
              splitLine: {
                show: false,
              },
          }],
          yAxis: [{
              axisTick: { show: false },
              splitLine: { lineStyle: { color: '#c1c5ca', type: 'dashed' } },
              axisLabel: { color: '#9da5b2', fontSize: '11' },
              data: this.scatterData.yAxisData,
              nameTextStyle: {
                color: '#3259B8',
                fontSize: 14,
              },
              axisPointer: {
                axisPointer: {
                  type: 'cross',
                },
              },
              axisLine: {
                lineStyle: {
                  color: '#3259B8',
                },
              },
            }],
          series: [{
            name: 'Success',
            type: 'scatter',
            color: '#24b7f2',
            data: this.scatterData.successData,
            symbolSize: 2,
            large: true,
            largeThreshold: 1000,
            progressive: 80000,
            progressiveThreshold: 80000,
          },
          {
            name: 'Error',
            type: 'scatter',
            color: '#FF6347',
            data: this.scatterData.failureData,
            symbolSize: 2,
            large: true,
            largeThreshold: 1000,
            progressive: 80000,
            progressiveThreshold: 80000,
          }],
      };
  }
}
</script>
