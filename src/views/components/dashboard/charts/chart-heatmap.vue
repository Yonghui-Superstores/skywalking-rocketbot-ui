<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->

<template>
  <RkEcharts ref="chart" :option="option" />
</template>

<script lang="ts">
  import Vue from 'vue';
  import { Component, Prop } from 'vue-property-decorator';
  import { State } from 'vuex-class';
  import 'echarts/lib/component/visualMap';
  import moment from 'dayjs';

  @Component
  export default class ChartHeatmap extends Vue {
    @Prop() private title!: string;
    @Prop() private type!: string;
    @Prop() private data!: any;
    @Prop() private intervalTime!: any;
    @Prop() private item!: any;
    @State('rocketbot') private rocketGlobal: any;
    @State('rocketOption') private stateDashboardOption!: any;

    public resize() {
      const chart: any = this.$refs.chart;
      chart.myChart.resize();
    }
    get option() {
      const source = (this.data.nodes || []).map((d: number[]) => d[2]);
      const maxItem = Math.max(...source);
      const minItem = Math.min(...source);
      const colorBox = [
        '#fff',
        '#FDF0F0',
        '#FAE2E2',
        '#F8D3D3',
        '#F6C4C4',
        '#F4B5B5',
        '#F1A7A7',
        '#EF9898',
        '#E86C6C',
        '#E44E4E',
        '#E23F3F',
        '#DF3131',
        '#DD2222',
        '#CE2020',
        '#C01D1D',
        '#B11B1B',
        '#A21919',
        '#851414',
        '#761212',
        '#671010',
      ];
      return {
        tooltip: {
          position: 'top',
          formatter: (a: any) => `${a.data[1] * 100}${this.item.unit}  [ ${a.data[2]} ]`,
          textStyle: {
            fontSize: 13,
          },
        },
        grid: {
          top: 15,
          left: 0,
          right: 10,
          bottom: 5,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: this.intervalTime,
          axisTick: {
            lineStyle: { color: '#c1c5ca' },
            alignWithLabel: true,
          },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: 'rgba(0,0,0,0)' } },
          axisLabel: { color: '#9da5b2', fontSize: '11' },
        },
        visualMap: [
          {
            min: minItem,
            max: maxItem,
            show: false,
            type: 'piecewise',
            calculable: true,
            pieces: this.generatePieces(maxItem, colorBox, minItem),
          },
        ],
        yAxis: {
          type: 'category',
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: '#c1c5ca', type: 'dashed' } },
          axisLabel: { color: '#9da5b2', fontSize: '11' },
          data: this.data.buckets,
        },
        series: [
          {
            type: 'heatmap',
            data: this.data.nodes || [],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
    }
    private mounted() {
      const chart: any = this.$refs.chart;
      chart.myChart.on('click', (params: any) => {
        const data = params.data;
        if (data[2] > 0) {
          const { currentProject } = this.stateDashboardOption;
          const yIndex = data[1];
          const min = (yIndex * 100) + '';
          const max = (Number(min) + 100) + '';
          const step = this.rocketGlobal.durationRow.step;
          const [start, end] = this.getTimeRange(step, params);

          const query: any = {
            project: currentProject.label,
            projectKey: currentProject.key,
            min,
            start,
            end,
          };
          if (max !== '2100') {
            query.max = max;
          }
          const routeUrl = this.$router.resolve({path: '/trace', query});
          window.open(routeUrl.href, '_blank');
        }
      });
    }
    private generatePieces(maxValue: number, colorBox: string[], minItem: number) {
      const pieces = [];
      let quotient = 1;
      let temp = {} as any;
      temp.max = minItem;
      temp.min = minItem;
      temp.color = colorBox[0];
      pieces.push(temp);
      if (maxValue && maxValue >= 19) {
        quotient = Math.floor(maxValue / 19);
        for (let i = 1; i < 20; i++) {
          temp = {} as any;
          if (i === 1) {
            temp.min = minItem;
          } else {
            temp.min = quotient * (i - 1);
          }
          temp.max = quotient * i;
          temp.color = colorBox[i];
          pieces.push(temp);
        }
      }
      const length = pieces.length;
      if (length) {
        const item = pieces[length - 1];
        item.max = maxValue;
      }
      return pieces;
    }
    private getTimeRange(step: any, params: any) {
      const str = params.name;
      // 处理4种数据格式
      // 14:54
      // 11-27 ----- MINUTE

      // 11-27 09 ----- HOUR
      // 11-25 ----- DAY
      // 2019-11 ----- MONTH
      const year = new Date().getFullYear();
      let startDateObj = null;
      let endDateObj = null;
      if (step === 'MINUTE') {
        const timeArr = str.split(/\n/);
        startDateObj = moment(year + '-' + timeArr[1] + ' ' + timeArr[0] + ':00');
        endDateObj = startDateObj.add(59, 'second');
      }  else if (step === 'HOUR') {
        const timeArr = str.split(/\s/);
        startDateObj = moment(year + '-' + timeArr[0] + ' ' + timeArr[1] + ':00:00');
        endDateObj = startDateObj.add(1, 'hour').subtract(1, 'second');
      } else if (step === 'DAY') {
        startDateObj = moment(year + '-' + str + ' ' + '00:00:00');
        endDateObj = startDateObj.add(1, 'day').subtract(1, 'second');
      } else if ( step === 'MONTH') {
        startDateObj = moment(str + '-01' + ' ' + '00:00:00');
        endDateObj = startDateObj.add(1, 'month').subtract(1, 'second');
      }
      return [this.dateToString(startDateObj), this.dateToString(endDateObj)];
    }
    // 兼容Safari时间格式为YYYY/MM/DD HH:mm:ss,之前为YYYY-MM-DD HH:mm:ss
    private dateToString(obj: any) {
      return obj.format('YYYY/MM/DD HH:mm:ss');
    }
  }
</script>
