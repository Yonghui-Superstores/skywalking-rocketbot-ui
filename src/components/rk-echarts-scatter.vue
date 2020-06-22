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
import echarts from 'echarts';
import { Action } from 'vuex-class';
@Component
export default class RkEcharts extends Vue {
  @Prop() private option: any;
  @Prop() private xAxisData: any;
  @Prop({ default: false }) private uncombine!: boolean;
  @Prop({ default: '100%' }) private height!: string;
  @Prop({default: '100%' }) private width!: string;
  @Action('STOP_REAL_TIME') private STOP_REAL_TIME:any;

  @Action('CLEAR_CHARTS') private CLEAR_CHARTS: any;
  private myChart: any = {};
  private mousedownX: any = '';
  private mousedownY: any = '';
  private mouseupX: any = '';
  private mouseupY: any = '';
  private brushStatus: Boolean = false;

  
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
			//this.$emit('stopTiming');

			if(this.brushStatus){
				this.STOP_REAL_TIME(true)
			}else{
				this.STOP_REAL_TIME(false)
			}

	        let pointInPixel = [params.offsetX, params.offsetY];
	        let pointInGrid = this.myChart.convertFromPixel('grid', pointInPixel);
	
	        if (this.myChart.containPixel('grid', pointInPixel)) {
	            this.mousedownX = parseInt(this.myChart.getOption().xAxis[0].axisPointer.value)
	            this.mousedownY = Math.ceil(this.myChart.getOption().yAxis[0].axisPointer.value)
	        }
	
	    })
		
		let zr1=this.myChart.getZr();
		    zr1.on('mouseup',(params:any)=>{
				

		        let pointInPixel = [params.offsetX, params.offsetY];
		        let pointInGrid = this.myChart.convertFromPixel('grid', pointInPixel);
		
		        if (this.myChart.containPixel('grid', pointInPixel)) {
		            this.mouseupX = parseInt(this.myChart.getOption().xAxis[0].axisPointer.value)
		            this.mouseupY = Math.ceil(this.myChart.getOption().yAxis[0].axisPointer.value)
		        }

				setTimeout(()=>{
					if(this.mouseupX != '' && this.mouseupX != null && this.mouseupY != '' && this.mouseupY != null){
						
						let min = ''
						let max = ''
						let start = ''
						let end = ''
						
						let query: any = {
						  min,
						  max,
						  start,
						  end
						}
						
						if(this.mousedownY <= this.mouseupY){
							query.min = this.mousedownY
							query.max = this.mouseupY
						}else{
							query.min = this.mouseupY
							query.max = this.mousedownY
						}
						
						if(this.mousedownX <= this.mouseupX){
							query.start = this.getTimeRange(this.xAxisData[this.mousedownX])
							query.end = this.getTimeRange(this.xAxisData[this.mouseupX])
						}else{
							query.start = this.getTimeRange(this.xAxisData[this.mouseupX])
							query.end = this.getTimeRange(this.xAxisData[this.mousedownX])
						}
						
						if(this.mousedownY != this.mouseupY && this.mousedownX != this.mouseupX){
							this.$router.push({
							  path: '/trace',
							  query
							});
						}
					}
				},1000)
				this.STOP_REAL_TIME(false)

		    })
	this.myChart.setOption(this.option);

	this.myChart.on('brushSelected', this.stopRealTime);
	
  }

  private stopRealTime(params:any) {
	this.brushStatus = !this.brushStatus
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
