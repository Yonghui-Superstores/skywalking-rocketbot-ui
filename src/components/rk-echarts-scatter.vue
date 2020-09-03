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
  <div class="echarts" :style="`height:${height};width:${width};`"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import echarts from 'echarts/index.js';
import { Action, State, Mutation } from 'vuex-class';
import { changeTimeFormat } from '@/utils/scatterTimeUtils';

@Component
export default class RkEcharts extends Vue {
  @Prop() private option: any;
  @Prop() private xAxisData: any;
  @Prop({ default: false }) private uncombine!: boolean;
  @Prop({ default: '100%' }) private height!: string;
  @Prop({default: '100%' }) private width!: string;
  @State('rocketOption') private stateDashboardOption!: any;
  @State('scatterData') private scatterData: any;
  @Action('CLEAR_CHARTS') private CLEAR_CHARTS: any;
  @Mutation('STOP_REAL_TIME') private STOP_REAL_TIME: any;
  private myChart: any = {};
  private isJump: boolean = true;
  private min: any = '';
  private max: any = '';
  private start: any = '';
  private end: any = '';
  private query: any = {
    min: '',
    max: '',
    start: '',
    end: '',
    service: '',
    serviceKey: '',
    traceState: 'ALL',
  };

  private mounted(): void {
    this.drawEcharts();
    window.addEventListener('resize', this.myChart.resize);
  }
  private beforeDestroy(): void {
    window.removeEventListener('resize', this.myChart.resize);
  }

  @Watch('option', { deep: true })
  private onoptionChanged(newVal: any, oldVal: any): void {
    if (this.myChart) {
      if (newVal) {
        this.myChart.setOption(newVal);
      } else {
        this.myChart.setOption(oldVal);
      }
    } else {
      this.drawEcharts();
    }
  }
  private drawEcharts(): void {
    const el: any = this.$el;
    this.myChart = echarts.init(el, '');
    this.myChart.on('legendselectchanged', (v: any) => {
      if (v.selected.Success) {
        this.query.traceState = 'SUCCESS';
      }
      if (v.selected.Error) {
        this.query.traceState = 'ERROR';
      }
      if (v.selected.Success && v.selected.Error) {
        this.query.traceState = 'ALL';
      }
      if (!v.selected.Success && !v.selected.Error) {
        this.query.traceState = 'Invalid';
      }
      this.myChart.dispatchAction({
           type: 'brush',
           xAxisIndex: 'all',
           areas: [],
       });
      this.isJump = false;
    });

    this.myChart.setOption(this.option);
    this.myChart.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: {
          brushType: 'rect',
      },
    });
    // 框选获取横纵坐标
    this.myChart.on('brushSelected', this.setQueryData);
  }
  private setQueryData(params: any) {
    if (params.batch[0].areas.length > 0) {
      // 获取XY轴数据
      this.getAxisData(params);
      // set查询Query参数
      this.setQueryParams();
      // 页面跳转
      if (this.checkData()) {
        const routeUrl = this.$router.resolve({path: '/trace', query: this.query});
        window.open(routeUrl.href, '_blank');
        this.clearParams();
      }
    }
  }
  private getAxisData(params: any) {
    const minIndex = params.batch[0].areas[0].coordRange[1][0];
    const maxIndex = params.batch[0].areas[0].coordRange[1][1];
    const startIndex = params.batch[0].areas[0].coordRange[0][0];
    const endIndex = params.batch[0].areas[0].coordRange[0][1];
    // y轴数据
    this.min = this.scatterData.yAxisData[minIndex];
    this.max = this.scatterData.yAxisData[maxIndex];
    // x轴数据
    this.start = this.scatterData.xAxisData[startIndex];
    this.end = this.scatterData.xAxisData[endIndex];
  }
  private setQueryParams() {
    const { currentProject, currentService } = this.stateDashboardOption;
    this.query.min = this.min < 0 ? 0 : this.min;
    this.query.max = this.max >= 10000 ? '' : this.max;
    this.query.start = changeTimeFormat(this.start);
    this.query.end = changeTimeFormat(this.end);
    this.query.project = currentProject.label,
    this.query.projectKey = currentProject.key,
    this.query.service = currentService.label,
    this.query.serviceKey = currentService.key;
  }
  private checkData = () => {
    if (this.query.traceState === 'Invalid') {
      return false;
    }
    if (this.query.min === this.query.max) {
      return false;
    }
    if (this.query.start === this.query.end) {
      return false;
    }
    return true;
  }
  private clearParams() {
    this.query.min = 0;
    this.query.max = 0;
    this.myChart.dispatchAction({
        type: 'axisAreaSelect',
        intervals: [],
    });
    this.myChart.dispatchAction({
        type: 'brush',
        command: 'clear',
        areas: [],
    });
  }
}
</script>
<style>
</style>
