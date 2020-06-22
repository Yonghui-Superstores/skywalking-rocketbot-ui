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
  <RkEchartsScatter ref="chart" :option="option" @stopTiming="stopTiming()" :xAxisData="this.xAxisData" :autoResize="true"/>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Action, Getter, State, Mutation } from 'vuex-class';
import Axios, { AxiosResponse } from 'axios';
import getProjectIdFromCookie from '@/utils/cookie.js'

@Component
export default class Request extends Vue {
	@State('rocketbot') private rocketGlobal: any;
	@State('rocketOption') private stateDashboardOption!: any;
    @Prop() private data!: any;
    @Prop() private intervalTime!: any;
    @Getter('realTime') private realTime: any;

    
    //基础数据
    //private x = 0;
    //private yAxis = 50;

    //整合
    private startTime: any;
    private endTime: any;


    //X轴日期数据集
    private xAxisData:Array<any> = [];
    private xAxisStep:number = 1;
    //请求日期
    private divide:number = 1;
    private requestDate:Array<any> = [];
    private requestDateStep = 1;
    private step:number = 1;
    //返回数据集
    private successData:Array<any> = [];
    private failureData:Array<any> = [];
    //X轴移动跨度
    private variable:number = 2;
    //定时器
    private timing:any;
    //请求中断
    private CancelToken:any;
    // private source:any;
    private axiosCancel:Array<any> = [];

    public resize() {
      const chart: any = this.$refs.chart;
	  chart.myChart.resize();
    }
	
	private mounted(): void {
      
        this.startTime = parseInt((new Date(this.rocketGlobal.durationRow.start).getTime()/1000).toString())
		this.endTime = parseInt((new Date(this.rocketGlobal.durationRow.end).getTime()/1000).toString())
        
        this.divideTime()
        this.processDate(this.startTime,this.endTime)

        let index = (this.requestDate.length-1);
        this.timing = setInterval(()=>{
            this.fetchData(this.requestDate,index)
            index--
            if(index == 0){
                clearInterval(this.timing)
            }
        },500)

    }

    @Watch('rocketGlobal.durationRow', { deep: true })
	private onoptionChanged(newVal: any, oldVal: any): void {

        this.axiosCancel.forEach((v:any) =>{
            v.cancel('已终止请求')
        })
        this.axiosCancel = []

        clearInterval(this.timing)
        if(!this.realTime){
            this.successData = []
            this.failureData = []
		    this.resize()
        }

		this.startTime = parseInt((new Date(newVal.start).getTime()/1000).toString())
        this.endTime = parseInt((new Date(newVal.end).getTime()/1000).toString())
        
        this.divideTime()
        this.processDate(this.startTime,this.endTime)

        let index = (this.requestDate.length-1);
        this.timing = setInterval(()=>{
            this.fetchData(this.requestDate,index)
            index--
            if(index == 0){
                clearInterval(this.timing)
            }
        },500)

    }

    @Watch('stateDashboardOption.currentService', { deep: true })
	private currentService(newVal: any, oldVal: any): void {

        this.axiosCancel.forEach((v:any) =>{
            v.cancel('已终止请求')
        })
        this.axiosCancel = []

        clearInterval(this.timing)
        if(!this.realTime){
            this.successData = []
            this.failureData = []
		    this.resize()
        }
		
        this.divideTime()
        this.processDate(this.startTime,this.endTime)

        let index = (this.requestDate.length-1);
        this.timing = setInterval(()=>{
            this.fetchData(this.requestDate,index)
            index--
            if(index == 0){
                clearInterval(this.timing)
            }
        },500)
    }

    //划分时间计算请求次数，请求跨度
    private divideTime(){
        
        let gapTime = this.endTime-this.startTime
        this.xAxisStep = gapTime/400
		this.step = Math.floor(this.xAxisStep)
        
		if (gapTime <= 400 ) {
		  this.divide = 1
		  this.step = 1
		} else if (gapTime <= 60 * 15) {
          this.divide = 1
		}else if (gapTime <= 60 * 30) {
		  this.divide = 4
		  this.step = Math.floor(this.xAxisStep)
		} else if (gapTime <= 60 * 60) {
		  this.divide = 4
		} else if (gapTime <= 60 * 60 *2) {
		  this.divide = 8
		} else if (gapTime <= 60 * 60 *4) {
          this.divide = Math.ceil(gapTime/1800)
		} else{
          this.divide = Math.ceil(gapTime/3600)
		}
		this.requestDateStep = gapTime/this.divide
	}

    //计算x轴日期集和请求日期数据
    private processDate(startTime:any,endTime:any){
        if(this.divide === 1){
            this.requestDate = []
			this.requestDate.push(this.getRequestTimestamp(new Date(startTime* 1000)))
			this.requestDate.push(this.getRequestTimestamp(new Date(endTime* 1000)))

            this.xAxisData = []
            if(this.step ==2){
                for (let i = startTime; i <= endTime; i+= this.xAxisStep) {
                    this.xAxisData.push(this.getAxisTime(i))
                }
            }else{
                for (let i = startTime; i <= endTime; i++) {
                    this.xAxisData.push(this.getAxisTime(i))
                }
            }
            
        }else{
            this.requestDate = []
			let time = startTime
			for(let i = 0;i <= this.divide; i++){
				this.requestDate.push(this.getRequestTimestamp(new Date((time)* 1000)))
				time += this.requestDateStep
            }
            
            this.xAxisData = []
			for(let j = startTime;j <= endTime; j += this.xAxisStep){
				this.xAxisData.push(this.getAxisTime(j))
            }
            
        }
    }

    //发送请求
    private fetchData(requestDate:any,index:number){
        
        new Promise((resolve,reject) =>{
            if(index > 0){
                this.CancelToken = Axios.CancelToken;
                let source = this.CancelToken.source();
                this.axiosCancel.push(source)
        
                let start = requestDate[index-1]
                let end = requestDate[index]
                Axios.post('/graphql', {
                    query: `query ServiceDotsQuery($serviceId:String!,$duration: Duration!,$axisXStep:Int!) {
                            success: getDots(isError: false, serviceId: $serviceId, duration: $duration, axisXStep: $axisXStep) {
                                nodes
                            },
                            failure: getDots(isError: true, serviceId: $serviceId, duration: $duration, axisXStep: $axisXStep) {
                                nodes
                            }
                        }`,
                    variables: {
                        duration: {
                            start: start,//'2020-06-20 192310',
                            end: end,//'2020-06-20 192315',
                            step: "SECOND"
                        },
                        serviceId: this.stateDashboardOption.currentService.key || '',
                        axisXStep: this.step
                    },
                
                },{
                    cancelToken: source.token
                }).then(res =>{
                    index--;
                    let successSnapData = []
                    let failureSnapData = []
                    let variable = 2;
                    if(!this.realTime){
                        this.successData.push(...res.data.data.success.nodes.map((v:any) =>{
                            if(index >= 1){
                                v[0] = (400/this.divide)*index+v[0]
                            }
                            return v
                        }))
                        this.failureData.push(...res.data.data.failure.nodes.map((v:any) =>{
                            if(index >= 1){
                                v[0] = (400/this.divide)*index+v[0]
                            }
                            return v
                        }))
                    }else{
                        successSnapData.push(...res.data.data.success.nodes.map((v:any) =>{
                            if(index >= 1){
                                v[0] = (400/this.divide)*index+v[0]
                            }
                            return v
                        }))
                        failureSnapData.push(...res.data.data.failure.nodes.map((v:any) =>{
                            if(index >= 1){
                                v[0] = (400/this.divide)*index+v[0]
                            }
                            return v
                        }))
                        this.successData = successSnapData
                        this.failureData = failureSnapData


                        for(let i = 0;i<this.successData.length;i++){
                            if(this.successData.length>0 && this.successData[0][0]<variable){
                                this.successData.shift()
                            }
                            if(this.failureData.length>0 && this.failureData[0][0]<variable){
                                this.failureData.shift()
                            }
                        }
                        this.successData = successSnapData
                        this.failureData = failureSnapData

                    }
                    resolve(res)
                })
            }
        }).catch((thrown) =>{
            console.log(thrown);
        })

    }
    private stopTiming(){
        clearInterval(this.timing)
    }
	//删除
    private getRndInteger(min:any, max:any) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //X轴日期格式
    private getAxisTime(params:any) {
    let d = new Date((params)*1000)
    return (d.getHours() < 10 ?"0"+ d.getHours():d.getHours()) + ":" +
        (d.getMinutes() < 10 ?"0"+ d.getMinutes():d.getMinutes()) + ":" +
        (d.getSeconds() < 10 ?"0"+ d.getSeconds():d.getSeconds())+ "\n" +
        ((d.getMonth() + 1) < 10 ?"0"+(d.getMonth() + 1):(d.getMonth() + 1)) + "-" +
        (d.getDate() < 10 ?"0"+ d.getDate():d.getDate())
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
	
	//转化跳转时数据格式 2020-06-10 101601
	private getTimeRange(params: any){
		  let year = new Date().getFullYear()
		  let timeArr = params.split(/\n/)
		  let timeArr2 = timeArr[0].split(/:/)
		  return year+"-"+ timeArr[1]+ " " + timeArr2[0] + timeArr2[1] + timeArr2[2]
	}
	
  get option() {
    return {
      animation:false,
        legend: {
            top: 3,
            right: 25,
            data: ['success', 'failure'],
            itemWidth:10,
            itemHeight:10,
            textStyle: {
                color: '#000',
                fontSize: 10
            }
        },
        grid: {
            top: 25,
            left: 0,
            right: 20,
            bottom: 5,
            containLabel: true,
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'cross',
                label:{
                    backgroundColor:'#3259B8',
                    formatter:function (params:any) {
                        if(params.axisDimension ==='y'){
                            params.value = parseInt(params.value)
                        }
                        return params.value
                    }
                },

            },
            formatter: function(params:any) {
                if (params.value.length > 1) {
                    return '时间: ' +
                        // getTime(params.value[0]) + '<br/> ' +'响应时间: '+
                        params.name + '<br/> ' +'响应时间: '+
                        params.value[1] + ' ms ';

                    function getTime(value:any) {
                        let time = new Date(value*1000)
                        return ((time.getMonth() + 1) < 10 ?"0"+(time.getMonth() + 1):(time.getMonth() + 1)) + "-" +
                            (time.getDate() < 10 ?"0"+ time.getDate():time.getDate())+' '+
                            (time.getHours() < 10 ?"0"+ time.getHours():time.getHours()) + ":" +
                            (time.getMinutes() < 10 ?"0"+ time.getMinutes():time.getMinutes()) + ":" +
                            (time.getSeconds() < 10 ?"0"+ time.getSeconds():time.getSeconds())
                    }
                } else {
                    return params.seriesName + ' :<br/>' +
                        params.name + ' : ' +
                        params.value + ' time ';
                }
            },

        },
        brush: {
            toolbox: ['rect'],
            xAxisIndex: 0,
            takeGlobalCursor:{

            }
        },
        xAxis: [{
            type: 'category',
            scale: true,
            data:this.xAxisData,
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
                }
            },
            axisLabel: { color: '#9da5b2', fontSize: '11' },
            splitLine: {
                show: false,
            }
        }],
        yAxis: [{
            type: 'value',
            scale: true,
            min:0,
            max: 10000,
            axisLabel: { color: '#9da5b2', fontSize: '11' },
            nameTextStyle: {
                color: '#3259B8',
                fontSize: 14
            },
            axisTick: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#3259B8',
                }
            },
            splitLine: {
                show: false,
            }
        }],
        series: [{
            name: 'success',
            type: 'scatter',
            color:'#24b7f2',
            data: this.successData,
            symbolSize: 3,
            large: true,
            largeThreshold: 1000,
            progressive: 80000,
            progressiveThreshold: 80000,
        },
        {
            name: 'failure',
            type: 'scatter',
            color:'#FF6347',
            data: this.failureData,
            symbolSize: 3,
            large: true,
            largeThreshold: 1000,
            progressive: 80000,
            progressiveThreshold: 80000,
        }],
    };
  }
  
 
}
</script>
