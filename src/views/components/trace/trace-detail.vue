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
  <div class="rk-trace-detail flex-v position-relative">
    {{loadingDisplay}}
    <div class="rk-trace-detail-wrapper clear"  v-if="current.endpointNames">
      <h5 class="mb-5 mt-0">
        <svg v-if="current.isError" class="icon red vm mr-5 sm">
          <use xlink:href="#clear"></use>
        </svg>
        <span class="vm">{{current.endpointNames[0]}}</span>
      </h5>
      <div class="mb-5 blue sm">
        <select class="rk-trace-detail-ids" @change="GET_TRACE_SPANS({traceId: i})">
          <option v-for="i in current.traceIds" :value="i" :key="i">{{i}}</option>
        </select>
        <svg class="icon vm grey link-hover cp ml-5" @click="handleClick(current.traceIds)">
          <use xlink:href="#review-list"></use>
        </svg>
      </div>

      <a class="rk-btn mr-5 sm r" :class="{'ghost':displayMode !== 'table'}" @click="displayMode = 'table'">
         <svg class="icon vm sm rk-trace-table_svg-icon">
          <use xlink:href="#table"></use>
        </svg>
        {{$t('table')}}</a>          
      <a class="rk-btn mr-5 sm r" :class="{'ghost':displayMode !== 'tree'}" @click="displayMode = 'tree'">
        <svg class="icon vm sm">
          <use xlink:href="#issue-child"></use>
        </svg>
        {{$t('tree')}}</a>
      <a class="rk-btn mr-5 sm r" :class="{'ghost':displayMode !== 'list'}" @click="displayMode = 'list'">
         <svg class="icon vm sm">
          <use xlink:href="#list-bulleted"></use>
        </svg>
        {{$t('list')}}</a>

            
      <div class="rk-tag mr-5">{{this.$t('start')}}</div><span class="mr-15 sm">{{parseInt(current.start) | dateformat}}</span>
      <div class="rk-tag mr-5">{{this.$t('duration')}}</div><span class="mr-15 sm">{{current.duration}} ms</span>
      <div class="rk-tag mr-5">{{this.$t('spans')}}</div><span class="sm">{{spans.length}}</span>
    </div>
    <TraceDetailChartList :isAlteringDisplayMode="isAlteringDisplayMode" v-if="displayMode == 'list'&&current.endpointNames" :data="spans" :traceId="current.traceIds[0]"/>
    <TraceDetailChartTree :isAlteringDisplayMode="isAlteringDisplayMode" v-if="displayMode == 'tree'&&current.endpointNames" :data="spans" :traceId="current.traceIds[0]"/>    
    <TraceDetailChartTable :isAlteringDisplayMode="isAlteringDisplayMode" v-if="displayMode == 'table'&&current.endpointNames" :data="spans" :traceId="current.traceIds[0]"/>    

    <div v-if="!current.endpointNames" class="flex-h container">
      <svg class="icon rk-icon-trace">
        <use xlink:href="#unlink"></use>
      </svg>
    </div>

    <div class="rk-trace-detail-loading" v-show="loadingDisplay">
      <!-- <svg class="icon loading">
        <use xlink:href="#spinner"></use>
      </svg> -->
      <LoadingIcon />
    </div>   
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import TraceDetailChartList from './trace-detail-chart-list.vue';
import TraceDetailChartTree from './trace-detail-chart-tree.vue';
import TraceDetailChartTable from './trace-detail-chart-table.vue';
import LoadingIcon from '@/components/loading-icon.vue';

import { Trace, Span } from '@/types/trace';
import { Action, State } from 'vuex-class';

@Component({ components: { TraceDetailChartList, TraceDetailChartTree, TraceDetailChartTable, LoadingIcon } })
export default class Header extends Vue {
  @State('rocketbot') private rocketbot: any;
  @Action('rocketTrace/GET_TRACE_SPANS') private GET_TRACE_SPANS: any;
  @Prop() private spans!: Span[];
  @Prop() private current!: Trace;
  private isAlteringDisplayMode:boolean = false; // 这个标记给子组件，data没有变化的情况，在mounted里面判断这个标记，如果有，则隐藏loading
  private mode: boolean = true;
  private displayMode: string = 'list';
  private loadingDisplay: boolean = true; // 监听数据变化需要控制的loading, 外层切换或者第一次加载traceData，显示loading
  @Watch('spans')
  private spansChange() {
    this.loadingDisplay = true
  }
  // 切换显示方式
  @Watch('displayMode')
  private displayModeChange() {
    this.loadingDisplay = true
    setTimeout(() => {
      this.isAlteringDisplayMode = true      
    }, 200);
  }
  get eventHub() {
    return this.$store.getters.globalEventHub;
  }
  private created() {
    this.eventHub.$on('SET_TRACE_DETAIL_STATUS', (flag: any) => {
      this.loadingDisplay = flag;
      if (flag == false) {
        this.isAlteringDisplayMode = false
      }
    })
  }
  private beforeDestroy() {
    this.eventHub.$off('SET_TRACE_DETAIL_STATUS')
  }
  private handleClick(ids: any) {
    const input = document.createElement('input');
    let copyValue = null;
    if (ids.length === 1) {
      copyValue = ids[0];
    } else {
      copyValue = ids.join(',');
    }
    input.value = copyValue;
    document.body.appendChild(input);
    input.select();
    if (document.execCommand('Copy')) {
        document.execCommand('Copy');
    }
    input.remove();
    Vue.prototype.$noty.success('Copied!', {timeout: 500});
  }
}
</script>

<style lang="scss" scoped>
.position-relative {
  position: relative;
}
.rk-trace-detail-loading {
  position:absolute;
  top: 100px;
  left: 0;
  right:0;
  text-align: center;
}
.rk-trace-detail {
  flex-shrink: 0;
  height: 100%;
  width: 75%;
  overflow-y:auto;
  min-height: 500px;
}
.rk-trace-detail-wrapper {
  padding: 8px 30px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
.rk-trace-detail-ids{
  background-color: rgba(0, 0, 0, 0);
  outline: 0;
  border-style: unset;
  color: inherit;
  border: 1px solid;
  border-radius: 4px;
}
.rk-tag{
  display: inline-block;
  border-radius: 4px;
  padding: 0px 7px;
  background-color: #40454e;
  color: #eee;
}
.rk-icon-trace{
  width:100px;
  height:100px;
  margin: 0 auto;
  fill: rgba(46, 47, 51, 0.15);
}
.rk-trace-table_svg-icon {
  width: 11px;
  height: 11px;
}
</style>
