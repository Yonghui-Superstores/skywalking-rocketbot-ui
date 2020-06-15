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
  <RkEchartsScatter ref="chart" :option="option" :xAxisData="this.xAxisData" :autoResize="true"/>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Action, Getter, State, Mutation } from 'vuex-class';
import Axios, { AxiosResponse } from 'axios';
import getProjectIdFromCookie from '@/utils/cookie.js'

import graph from '@/graph';

@Component
export default class Request extends Vue {
	@State('rocketbot') private rocketGlobal: any;
    @Prop() private data!: any;
    @Prop() private intervalTime!: any;
	private xAxisData: any = [];
	private requestDate: any = [];
	//散点数据
	private successData: any = [];
	private failureData: any = [];

	
	private divide: any = '';
	private step: any = '';
	
    public resize() {
      const chart: any = this.$refs.chart;
      chart.myChart.resize();
    }
	
	
	private mounted(): void {
		
		const chart: any = this.$refs.chart;
		 
		 let startTime = parseInt((new Date(this.rocketGlobal.durationRow.start).getTime()/1000).toString())
		 let endTime = parseInt((new Date(this.rocketGlobal.durationRow.end).getTime()/1000).toString())
		 let xAxisStep = (endTime-startTime)/400
		 this.divideTime(endTime - startTime)
		 let requestStep = (endTime-startTime)/(this.divide)
		 
		 this.processData(startTime,endTime,requestStep,xAxisStep)
		 
	}
	
	
	@Watch('rocketGlobal.durationRow', { deep: true })
	private onoptionChanged(newVal: any, oldVal: any): void {
		
		let startTime = parseInt((new Date(newVal.start).getTime()/1000).toString())
		let endTime = parseInt((new Date(newVal.end).getTime()/1000).toString())
		let xAxisStep = (endTime-startTime)/400
		this.divideTime(endTime - startTime)
		let requestStep = (endTime-startTime)/(this.divide)

		this.processData(startTime,endTime,requestStep,xAxisStep)
		console.log("		console.log(this.requestDate)")
		console.log(this.requestDate)
		console.log(this.xAxisData)
	}
	
	private processData(startTime:any,endTime:any,requestStep:any,xAxisStep:any){
		if(this.divide === 1){
			this.requestDate = []
			this.requestDate.push(this.getRequestTimestamp(new Date(startTime* 1000)))
			this.requestDate.push(this.getRequestTimestamp(new Date(endTime* 1000)))
			
			this.xAxisData = []
			for(;startTime <= endTime; startTime++){
				this.xAxisData.push(this.getTimestamp(new Date(startTime* 1000)))
			}
			this.fetchData(this.requestDate)
			
		}else{
			this.requestDate = []

			let time = startTime
			for(let i = 0;i <= this.divide; i++){
				this.requestDate.push(this.getRequestTimestamp(new Date((time)* 1000)))
				time += requestStep
			}
			
			this.xAxisData = []
			for(let j = startTime;j <= endTime; j += xAxisStep){
				this.xAxisData.push(this.getTimestamp(new Date(j* 1000)))
			}
			
			this.fetchData(this.requestDate)
		}
	}
	
	//请求日期格式 2020-06-10 101601
	private getRequestTimestamp(d:any){
		return d.getFullYear() + "-"+
			   ((d.getMonth() + 1) < 10 ?"0"+(d.getMonth() + 1):(d.getMonth() + 1)) + "-" +
			   (d.getDate() < 10 ?"0"+ d.getDate():d.getDate()) + " " +
			   (d.getHours() < 10 ?"0"+ d.getHours():d.getHours()) +  
			   (d.getMinutes() < 10 ?"0"+ d.getMinutes():d.getMinutes()) +
			   (d.getSeconds() < 10 ?"0"+ d.getSeconds():d.getSeconds())
	}
	
	//X轴日期格式
	private getTimestamp(d:any){
		return(d.getHours() < 10 ?"0"+ d.getHours():d.getHours()) + ":" + 
			  (d.getMinutes() < 10 ?"0"+ d.getMinutes():d.getMinutes()) + ":" + 
			  (d.getSeconds() < 10 ?"0"+ d.getSeconds():d.getSeconds())+ "\n" +
			  ((d.getMonth() + 1) < 10 ?"0"+(d.getMonth() + 1):(d.getMonth() + 1)) + "-" +
			  (d.getDate() < 10 ?"0"+ d.getDate():d.getDate())  
	}

	//数据格式 2020-06-10 101601
	private getTimeRange(params: any){
		  let year = new Date().getFullYear()
		  let timeArr = params.split(/\n/)
		  let timeArr2 = timeArr[0].split(/:/)
		  return year+"-"+ timeArr[1]+ " " + timeArr2[0] + timeArr2[1] + timeArr2[2]
	}
	
	//发送请求，获取数据
	private fetchData(frequency:any){
		const chart: any = this.$refs.chart;
		this.successData = []
		// 
		this.PromiseForEach(frequency, (ele:any,index:number) => {
		        return new Promise((resolve, reject) => {
					
					if((index + 1) !== frequency.length){
						let start = frequency[index]
						let end = frequency[index+1]//`+this.step+`
						
						setTimeout(() => {
							Axios.post('/graphql', {
								
							query: `query ServiceDotsQuery($duration: Duration!) {
									getDots(isError: false, serviceId: "4", duration: $duration, axisXStep: 2) {
									   nodes
									}
								}`,
							  variables: {
							    duration: {start: start, end: end, step: "SECOND"},
							    // externalProjectId: getProjectIdFromCookie()
							  }}).then((res:any) => {
								//   this.successData.push([index,Math.ceil(Math.random()*100)*100,2])
								this.successData.push(res.getDots.nodes)

								resolve(res)
							  })
						},500)
						
					}
					
		        })
		
		    }).then((data) => {
		        console.log("成功");
		        console.log(data);
		    }).catch((err) => {
		        console.log("失败");
		        console.log(err)
		    });

	}
	
	private PromiseForEach(frequency:any, cb:any) {
		let result = Promise.resolve()
			frequency.forEach((a:any, index:any) => {
				result = result.then(() => {
					return cb(a,index).then((res:any) => {
					})
				})
			})
		return result.then(() => {
		})
	}

	private divideTime(gapTime:any){
		
		if (gapTime <= 400 ) {
		  this.divide = 1
		} else if (gapTime <= 60 * 30) {
		  this.divide = 3
		} else if (gapTime <= 60 * 60) {
		  this.divide = 4
		} else if (gapTime <= 60 * 60 *2) {
		  this.divide = 4
		} else if (gapTime <= 60 * 60 *4) {
		  this.divide = 6
		}else if (gapTime <= 60 * 60 *6) {
		  this.divide = 6
		}else {
		  this.divide = Math.ceil(gapTime/3600)
		}
	}
	
	
  get option() {
    const temp: any = [
	{
		name: 'success',
		type: 'scatter',
		data: this.successData,
		color:'#24b7f2',
		symbolSize:4,
	},
	{
		name: 'failure',
		type: 'scatter',
		data: this.failureData,
		color:'red',
		symbolSize:4,
	}];

    return {
	  tooltip: {
	      trigger: 'item',
	      showDelay: 0,
	      formatter: function(params: any) {
	          if (params.value.length > 1) {
	              return '时间: ' +
	                  params.name + '<br/> ' +'响应时间: '+
	                  params.value[1] + ' ms ';
	          } else {
	              return params.seriesName + ' :<br/>' +
	                  params.name + ' : ' +
	                  params.value + ' time ';
	          }
	      },
	      axisPointer: {
	          show: false,
	          type: 'cross',
	          lineStyle: {
	              type: 'dashed',
	              width: 1
	          }
	      }
	  },
	  brush: {
	      toolbox: ['rect'],
	      xAxisIndex: 0
	  },
	  legend: {
		  top: 3,
		  left: 380,
		  data: ['success', 'failure'],
		  itemWidth:10,
		  itemHeight:10,
		  textStyle: {
			  color: '#000',
			  fontSize: 10
		  }
	  },
      grid: {
        top: 15,
        left: 0,
        right: 10,
        bottom: 5,
        containLabel: true,
      },
	  xAxis: [{
	      type: 'category',
	      scale: true,
		  data: this.xAxisData,
	      axisLabel: {
	          formatter: '{value}',
	      },
	      nameTextStyle: {
	          color: '#3259B8',
	          fontSize: 14,
	      },
	      axisTick:{
	          show:false,
	      },
	      axisLine: {
	          lineStyle: {
	              color: '#3259B8',
	          }
	      },
	      splitLine: {
	          show:false,
	      }
	  }],
	  yAxis: [{
	      type: 'value',
	      scale: true,
	      axisLabel: {
	          formatter: '{value}ms'
	      },
	      nameTextStyle: {
	          color: '#3259B8',
	          fontSize: 14
	      },
	      axisTick:{
	          show:false,
	      },
	      axisLine: {
	          lineStyle: {
	              color:'#3259B8',
	          }
	      },
	      splitLine: {
	          show:false,
	      }
	  }],
      series: temp,
    };
  }
  
 
}
</script>
