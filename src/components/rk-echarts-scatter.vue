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
import { Action,State } from 'vuex-class';
@Component
export default class RkEcharts extends Vue {
  @Prop() private option: any;
  @Prop() private xAxisData: any;
  @Prop({ default: false }) private uncombine!: boolean;
  @Prop({ default: '100%' }) private height!: string;
  @Prop({default: '100%' }) private width!: string;
  @State('rocketOption') private stateDashboardOption!: any;
  @Action('STOP_REAL_TIME') private STOP_REAL_TIME:any;
  @Action('CLEAR_CHARTS') private CLEAR_CHARTS: any;
  private myChart: any = {};
  private min: any = '';
  private max: any = '';
  private start: any = '';
  private end: any = '';
  private query:any = {
	  min:'',
	  max:'',
	  start:'',
	  end:'',
	  service:'',
	  serviceKey:''
  }
  private mounted(): void {
    this.drawEcharts();
    window.addEventListener('resize', this.myChart.resize);
	// this.$nextTick(()=>{
	// 	console.log("完成")
	// })
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
	let zr=this.myChart.getZr();
	    zr.on('mousedown',(params:any)=>{
			this.STOP_REAL_TIME(false)
			// this.$emit('stopTiming');
			this.STOP_REAL_TIME(true)
	    })
		
		zr.on('mouseup',(params:any)=>{
			if(this.min !== this.max && this.start !== this.end){
				setTimeout(()=>{
					this.$router.push({
						path: '/trace',
						query:this.query
					});
				},1000)
				this.STOP_REAL_TIME(false)
			}
		})
	this.myChart.setOption(this.option);

	this.myChart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'brush',
        brushOption: {
            brushType: 'rect',
        }
    });
	//框选获取横纵坐标
	this.myChart.on('brushSelected', this.stopRealTime);
  }

  private stopRealTime(params:any) {
	if(params.batch[0].areas.length >0){
		this.min = params.batch[0].areas[0].coordRange[1][0]
		this.max = params.batch[0].areas[0].coordRange[1][1]
		this.start = params.batch[0].areas[0].coordRange[0][0]
		this.end = params.batch[0].areas[0].coordRange[0][1]

		this.query.min = Math.floor(this.min<0 ?0 :this.min)
		this.query.max = this.max>=10000 ?'' :Math.floor(this.max)    
		this.query.start = this.getTimeRange(this.xAxisData[this.start<0 ?0 :this.start])
		this.query.end = this.getTimeRange(this.xAxisData[this.end>399 ?399 :this.end])
		this.query.service = this.stateDashboardOption.currentService.label,
	  this.query.serviceKey = this.stateDashboardOption.currentService.key
	}
  }

  private destroyed () {
    // alert('实例已销毁')
    this.STOP_REAL_TIME(false)
  }
  
  //日期格式:2020-06-09 14:16:00
  private getTimeRange(params: any){
	  let year = new Date().getFullYear()
	  let timeArr = params.split(/\n/)
	  return year+"-"+ timeArr[1]+ " " + timeArr[0]
  }
}
</script>
<style>
</style>
