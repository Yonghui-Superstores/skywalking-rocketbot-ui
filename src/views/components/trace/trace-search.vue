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
  <div class="rk-trace-search">
    <div>
      <a class="rk-trace-search-btn r" @click="status = !status">
        <span class="mr-5 vm">{{this.$t('more')}}</span>
        <svg class="icon trans vm" :style="`transform: rotate(${status?180:0}deg);`">
          <use xlink:href="#arrow-down"></use>
        </svg>
      </a>
      <!-- 搜索按钮 -->
      <a class="rk-trace-search-btn bg-blue r mr-10" @click="getTraceList">
        <svg class="icon mr-5 vm">
          <use xlink:href="#search"></use>
        </svg>
        <span class="vm">{{this.$t('search')}}</span>
      </a>
      <div class="flex-h">
        <TraceSelect :hasSearch="true" :title="this.$t('service')" :value="service" @input="chooseService" :data="rocketTrace.services"/>
        <TraceSelect :hasSearch="true" :title="this.$t('instance')" v-model="instance" :data="rocketTrace.instances"/>
        <TraceSelect  :title="this.$t('status')" :value="traceState" @input="chooseStatus"
        :data="[{label:'All', key: 'ALL'}, {label:'Success', key: 'SUCCESS'}, {label:'Error', key: 'ERROR'}]"/>
        <div class="mr-10" style="padding: 3px 15px 0">
          <div class="sm grey">{{this.$t('endpointName')}}</div>
          <input type="text"  v-model="endpointName" class="rk-trace-search-input">
        </div>
      </div>
    </div>
    <div class="rk-trace-search-more flex-h" v-show="status">
      <div class="mr-15">
        <span class="sm b grey mr-10">{{this.$t('traceID')}}:</span>
        <input type="text" v-model="traceId" class="rk-trace-search-input dib">
      </div>
      <div class="mr-15">
        <span class="sm b grey mr-10">{{this.$t('duration')}}:</span>
        <div class="rk-trace-search-range dib">
          <input class="vm tc" v-model="minTraceDuration">
          <span class="grey vm">-</span>
          <input class="vm tc" v-model="maxTraceDuration">
        </div>
      </div>
      <div>
        <!-- <span class="sm b grey mr-5">{{this.$t('timeRange')}}:</span> -->
        <RkDate class="sm rk-trace-time-date" v-model="time"  position="bottom" format="YYYY-MM-DD HH:mm:ss"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import { Trace } from '@/types/trace';
import { DurationTime, Option } from '@/types/global';
import TraceSelect from './trace-select.vue';
import getProjectIdFromCookie from '@/utils/cookie.js';
import timeFormat from '@/utils/timeFormat';

@Component({
  components: {TraceSelect},
})
export default class TraceTool extends Vue {
  @State('rocketbot') private rocketbotGlobal: any;
  @State('rocketTrace') private rocketTrace: any;
	@State('rocketOption') private stateDashboardOption!: any;
  @Getter('durationTime') private durationTime: any;
  @Getter('duration') private duration: any;
  @Action('SET_DURATION') private SET_DURATION: any;
  @Action('rocketTrace/GET_SERVICES') private GET_SERVICES: any;
  @Action('rocketTrace/GET_INSTANCES') private GET_INSTANCES: any;
  @Action('rocketTrace/GET_TRACELIST') private GET_TRACELIST: any;
  @Action('rocketTrace/SET_TRACE_FORM') private SET_TRACE_FORM: any;
  @Action('Trace_Date_SHOW') private Trace_Date_SHOW: any;
  

  private start: any; // 首页heatmap传递过来的参数
  private end: any; // 首页heatmap传递过来的参数
  private time: Date[] = [new Date() , new Date()];
  private status: boolean = true;
  private maxTraceDuration: string = '';
  private minTraceDuration: string = '';
  private service: Option  = {label: 'All', key: ''};
  private instance: Option  = {label: 'All', key: ''};
  private endpointName: string = '';
  private traceId: string = '';
  private traceState: Option  = {label: 'All', key: 'ALL'};
  private dateFormate = (date: Date, step: string) => {
    const year = date.getFullYear();
    const monthTemp = date.getMonth() + 1;
    let month: string = `${monthTemp}`;
    if (monthTemp < 10) {
      month = `0${monthTemp}`;
    }
    if (step === 'MONTH') {
      return `${year}-${month}`;
    }
    const dayTemp = date.getDate();
    let day: string = `${dayTemp}`;
    if (dayTemp < 10) { day = `0${dayTemp}`; }
    if (step === 'DAY') { return `${year}-${month}-${day}`; }
    const hourTemp = date.getHours();
    let hour: string = `${hourTemp}`;
    if (hourTemp < 10) { hour = `0${hourTemp}`; }
    if (step === 'HOUR') { return `${year}-${month}-${day} ${hour}`; }
    const minuteTemp = date.getMinutes();
    let minute: string = `${minuteTemp}`;
    if (minuteTemp < 10) { minute = `0${minuteTemp}`; }
    if (step === 'MINUTE') { return `${year}-${month}-${day} ${hour}${minute}`; }
  }
  private globalTimeFormate = (time: Date[]): any => {
    let step = 'MINUTE';
    const unix = Math.round(time[1].getTime()) - Math.round(time[0].getTime());
    if (unix <= 60 * 60 * 1000) {
      step = 'MINUTE';
    } else if (unix <= 24 * 60 * 60 * 1000) {
      step = 'HOUR';
    } else if (unix <= 30 * 24 * 60 * 60 * 1000) {
      step = 'DAY';
    } else {
      step = 'MONTH';
    }
    return { start: this.dateFormate(time[0], step), end: this.dateFormate(time[1], step), step };
  }
  get eventHub() {
      return this.$store.getters.globalEventHub;
  }
  private chooseService(i: any) {
    if (this.service.key === i.key) {
      return;
    }
    this.instance = {label: 'All', key: ''};
    this.service = i;
    if (i.key === '') {
      return;
    }
    this.GET_INSTANCES({duration: this.durationTime, serviceId: i.key});
  }
  private chooseStatus(i: any) {
    this.traceState = i;
  }
  private getTraceList() {
    
    this.GET_SERVICES({duration: this.durationTime});
    const temp: any = {
        queryDuration: this.globalTimeFormate([
          new Date(this.time[0].getTime() +
          (parseInt(this.rocketbotGlobal.utc, 10) + new Date().getTimezoneOffset() / 60) * 3600000),
          new Date(this.time[1].getTime() +
          (parseInt(this.rocketbotGlobal.utc, 10) + new Date().getTimezoneOffset() / 60) * 3600000),
        ]),
        traceState:  this.traceState.key,
        paging: {pageNum: 1, pageSize: 15, needTotal: true},
        queryOrder: this.rocketTrace.traceForm.queryOrder,
    };
    if (this.service.key) { temp.serviceId = this.service.key; }
    if (this.instance.key) { temp.serviceInstanceId = this.instance.key; }
    if (this.maxTraceDuration) { temp.maxTraceDuration = this.maxTraceDuration; }
    if (this.minTraceDuration) { temp.minTraceDuration = this.minTraceDuration; }
    if (this.endpointName) { temp.endpointName = this.endpointName; }
    if (this.traceId) { temp.traceId = this.traceId; }
    let externalProjectId = getProjectIdFromCookie()
    if (externalProjectId) {
      temp.externalProjectId = externalProjectId
    }
    this.SET_TRACE_FORM(temp);
    this.eventHub.$emit('SET_LOADING_TRUE', () => {
      this.GET_TRACELIST().then(() => {
        this.eventHub.$emit('SET_LOADING_FALSE');
      });
    });
    // this.GET_TRACELIST();
  }
  private created() {
    const {endpoint, service, serviceKey, instance, instanceKey, min, max, start, end, tId} = this.$route.query;
    if (endpoint !== undefined) {
      this.endpointName = endpoint.toString().trim();
    }
    if (service !== undefined && serviceKey !== undefined) {
      this.service = {label: service.toString(), key: serviceKey.toString()};
    }
    // gloabl heatmap 跳转
    if (min != undefined) {
      this.minTraceDuration = min + ''
    }
    if (max != undefined) {
      this.maxTraceDuration = max + ''
    }
    if (start != undefined) {
      this.start = start
    } 
    if (end != undefined) {
      this.end = end
    }

    // 端点 slow endpoint跳转
    if (tId != undefined) {
      this.traceId = <string>tId
    }
  }
  private mounted() {
    if(this.stateDashboardOption.currentService.key != null && this.stateDashboardOption.currentService.label != null){
      this.service = this.stateDashboardOption.currentService
    }else{
      this.service = {label: 'All', key: ''}
    }
    // if (this.start && this.end) {
    //   this.SET_DURATION(timeFormat([new Date(this.start),new Date(this.end)]))
    // }
    // 这里的this.time 如果有数据来自于url，就从url里面获取否则来自于全局的这个
    this.time = [this.rocketbotGlobal.durationRow.start, this.rocketbotGlobal.durationRow.end];
    if (this.start && this.end) {
      this.time = [new Date(this.start), new Date(this.end)]
    }
    this.Trace_Date_SHOW(false)
    this.getTraceList();
  }
  private destroyed () {
    // alert('实例已销毁')
    this.Trace_Date_SHOW(true)
  }
}
</script>

<style lang="scss">
.rk-trace-time-date {
    position: fixed !important;
    z-index: 9999;
    right: 155px;
    top: 11px;
    color: #efeff1!important;
    -webkit-box-shadow: none!important;
    box-shadow: none!important;
    border-top: none;
}

.rk-trace-search {
  flex-shrink: 0;
  background-color: #333840;
  color: #eee;
  width: 100%;
  padding: 3px 15px 8px;
}

.rk-trace-search-input {
  border-style: unset;
  outline: 0;
  padding: 2px 5px;
  border-radius: 3px;
}
.rk-trace-search-range{
  border-radius: 3px;
  background-color: #fff;
  padding: 1px;
  border-radius: 3px;
  input{
    width: 38px;
    border-style: unset;
    outline: 0;
  }
}
.rk-trace-search-btn{
  padding: 3px 9px;
  background-color: #484b55;
  border-radius: 4px;
  margin-top: 12px;
  &.bg-blue{
    background-color: #448dfe;
  }
}
.rk-trace-search-more{
  background-color: #484b55;
  padding: 4px 10px;
  border-radius: 3px;
  margin-top: 8px;
  position: relative;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,.1);
  &:after {
    bottom: 100%;
    right: 30px;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(0, 0,0, 0);
    border-bottom-color: #484b55;
    border-width: 8px;
    margin-right: 0px;
  }
}
</style>
