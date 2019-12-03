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
  <nav class="rk-alarm-tool flex-h">
    <AlarmSelect :title="this.$t('filterScope')" :value="alarmScope" @input="handleFilter" :data="alarmOptions"/>
    <div class="mr-10" style="padding: 3px 15px 0">
      <div class="sm grey">{{this.$t('searchKeyword')}}</div>
      <!-- <input type="text" v-model="keyword" class="rk-alarm-tool-input" @input="handleRefresh(1)"> -->
      <input type="text" v-model="keyword" class="rk-alarm-tool-input" @input="debounceSearch">
    </div>
    <RkPage class="mt-15" :currentSize="20" :currentPage="pageNum" @changePage="handlePage" :total="total"/>
  <!-- <RkFooter :propClass="'alerm-time'" :position="'bottom'" ref="footer"/> -->
<!--   
    <div class="rk-alerm-t-loading" v-show="loading">
      <svg class="icon loading">
        <use xlink:href="#spinner"></use>
      </svg>
    </div> -->
    <Loading  :visible= "loading"/>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Model } from 'vue-property-decorator';
import AlarmSelect from './alarm-select.vue';
import { Action, Mutation } from 'vuex-class';
import Loading from '@/components/loading.vue'

import RkFooter from '@/components/rk-footer.vue';

@Component({components: {
  AlarmSelect,
  RkFooter,
  Loading
}})
export default class AlarmTool extends Vue {
  @Mutation('SET_EVENTS') private SET_EVENTS: any;
  @Action('rocketAlarm/GET_ALARM') private GET_ALARM: any;
  @Prop() private durationTime: any;
  @Prop() private total!: number;
  private loading: boolean = false;
  private pageNum: number = 1;
  private alarmScope: any = {label: 'All', key: ''};
  private alarmOptions: any = [
    {label: 'All', key: ''},
    {label: 'Service', key: 'Service'},
    {label: 'ServiceInstance', key: 'ServiceInstance'},
    {label: 'Endpoint', key: 'Endpoint'},
  ];
  private keyword: string = '';

  private handlePage(pageNum: number) {
    this.handleRefresh(pageNum);
  }
  private handleFilter(i: any) {
    this.alarmScope = i;
    this.handleRefresh(1);
  }
  private handleRefresh(pageNum: number) {
    this.loading = true
    this.pageNum = pageNum;
    const params: any = {
      duration: this.durationTime,
      paging: {
        pageNum,
        pageSize: 20,
        needTotal: true,
      },
    };
    if (this.alarmScope.key) { params.scope = this.alarmScope.key; }
    if (this.keyword) { params.keyword = this.keyword; }
    this.GET_ALARM(params).then(()=>{
      this.loading = false
    });
  }
  private beforeMount() {
    this.SET_EVENTS([() => { this.handleRefresh(1); } ]);
    this.handleRefresh(1);
  }
  // 给input输入框添加节流操作
  get debounceSearch() {
    let timer: any = null
    return (e: any, duration: any = 1000) => {
      if (timer)
        clearTimeout(timer)
      timer = setTimeout(()=>{
        this.handleRefresh(1);        
      }, duration)
    }

  }
}
</script>

<style lang="scss">
.rk-alerm-t-loading {
  position: fixed;
  top: 100px;
  left: 0;
  right: 0;
  bottom: 0;
  .icon.loading {
    position: absolute;
    left : 50%;
    top: 200px;
    height: 30px;
    width: 30px;
  }
}

.rk-footer.alerm-time {
  color: white;
  // float: right;
  position: absolute;
  right: 0;
}
.rk-alarm-tool{
  border-bottom:1px solid #c1c5ca41;
  height: 52px;
  background-color: #333840;
  padding: 0 15px;
  color: #efefef;
  flex-shrink: 0;
}
.rk-alarm-tool-input {
  border-style: unset;
  outline: 0;
  padding: 2px 5px;
  border-radius: 3px;
}
</style>
