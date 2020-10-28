<template>

  <div class="trace-detail-chart-table">
    <div class="rk-trace-t-loading" v-show="loading">
      <!-- <svg class="icon loading">
        <use xlink:href="#spinner"></use>
      </svg> -->
      <LoadingIcon/>
    </div>
    <transition-group name="fade" tag="div" class="mb-15 mt-15 pl-30">
      <span class="time-charts-item mr-10" v-for="(i,index) in list" :key="i" :style="`color:${computedScale(index)}`">
         <svg class="icon vm mr-5 sm">
            <use xlink:href="#issue-open-m"></use>
          </svg>
        <span>{{i}}</span>
      </span>
    </transition-group>    
    <TraceContainer>
      <Item v-for="(item, index) in tableData"  :data="item"  :key="'key'+ index" /> 
    </TraceContainer>
    <rk-sidebox :width="'50%'" :show.sync="showDetail" :title="$t('spanInfo')">
      <div class="rk-trace-detail">
        <h5 class="mb-15">{{$t('tags')}}.</h5>
        <div class="mb-10 clear"><span class="g-sm-4 grey">{{$t('endpoint')}}:</span><span class="g-sm-8 wba">{{this.currentSpan.label}}</span></div>
        <div class="mb-10 clear"><span class="g-sm-4 grey">{{$t('spanType')}}:</span><span class="g-sm-8 wba">{{this.currentSpan.type}}</span></div>
        <div class="mb-10 clear"><span class="g-sm-4 grey">{{$t('component')}}:</span>
          <span class="g-sm-8 wba">{{this.currentSpan.component}}
            <a style="color: #448dfe;margin-left:20px" v-if="this.currentSpan.component" @click="jump()">指标信息查看</a>
          </span>
        </div>
        <div class="mb-10 clear"><span class="g-sm-4 grey">Peer:</span><span class="g-sm-8 wba">{{this.currentSpan.peer||'No Peer'}}</span></div>
        <div class="mb-10 clear"><span class="g-sm-4 grey">{{$t('error')}}:</span><span class="g-sm-8 wba">{{this.currentSpan.isError}}</span></div>
        <div class="mb-10 clear" v-for="i in this.currentSpan.tags" :key="i.key">
          <span class="g-sm-4 grey">{{i.key}}:</span>
          <span class="g-sm-8 wba">
            {{i.value}}
            <svg v-if="i.key==='db.statement'" class="icon vm grey link-hover cp ml-5" @click="handleClick(i.value)">
              <use xlink:href="#review-list"></use>
            </svg>
          </span>
        </div>
        <h5 class="mb-10" v-if="this.currentSpan.logs" v-show="this.currentSpan.logs.length">{{$t('logs')}}.</h5>
        <div v-for="(i, index) in this.currentSpan.logs" :key="index">
          <div class="mb-10 sm">
            <span class="mr-10">{{$t('time')}}:</span>
            <span class="grey">{{i.time | dateformat}}</span>
          </div>
          <div class="mb-15 clear" v-for="(_i, _index) in i.data" :key="_index">
            <div class="mb-10">{{_i.key}}:</div>
            <pre class="pl-15 mt-0 mb-0 sm oa">{{_i.value}}</pre>
          </div>
        </div>
      </div>
    </rk-sidebox>
  </div>
</template>
<style lang="scss">
  .rk-tooltip-popper.trace-table-tooltip .rk-tooltip-inner{
      max-width: 600px;
  }
  .trace-detail-chart-table {
    position: relative;
    min-height: 150px;
  }
</style>

<script>
import LoadingIcon from '@/components/loading-icon.vue';
import * as d3 from 'd3';
import { Vue } from 'vue-property-decorator';
import Item from './trace-chart-table/trace-item';
import TraceContainer from './trace-chart-table/trace-container';
import jumpGrafana from './jump_grafana';
/* eslint-disable */
/* tslint:disable */
export default {
  components: {
    Item,
    TraceContainer,
    LoadingIcon
  },
  props: ['data', 'traceId', 'isAlteringDisplayMode'],
  watch: {
    data(val, oldVal) {
      if (!this.data.length) {
        return;
      }
      this.tableData = this.formatData(this.changeTree());
      setTimeout(()=>{
        this.eventHub.$emit('SET_TRACE_DETAIL_STATUS', false)
      }, 500)
    },
    isAlteringDisplayMode(val) {
      if (val) {
        setTimeout(()=>{
          this.eventHub.$emit('SET_TRACE_DETAIL_STATUS', false)
        }, 500)
      }
    }
  },
  data() {
    return {
      tableData: [],
      diaplay: true,
      // segmentId: [],
      showDetail: false,
      list: [],
      currentSpan: [],
      loading: true,
    };
  },
  provide: function() {
    return {
      serviceColor: this.serviceColor
    }
  },
  computed: {
    eventHub() {
      return this.$store.getters.globalEventHub
    },
    serviceList() {
      return Array.from(new Set(this.data.map((i) => i.serviceCode)));
    },
    serviceColor() {
      const sequentialScale = d3.scaleSequential()
        .domain([0, this.serviceList.length + 1])
        .interpolator(d3.interpolateCool);
      var colorMap = {}
      this.serviceList.forEach((item, index) => {
        colorMap[item] = sequentialScale(index)
      })
      return colorMap
    }
  },
  methods: {
    jump() {
      jumpGrafana(this.currentSpan.component);
    },
    computedScale(i) {
       // 彩虹图
      const sequentialScale = d3.scaleSequential()
      .domain([0, this.list.length + 1])
      .interpolator(d3.interpolateCool);
      return sequentialScale(i);
    },
    handleClick(value) {
      const input = document.createElement('input');
      let copyValue = value;
      input.value = copyValue;
      document.body.appendChild(input);
      input.select();
      if (document.execCommand('Copy')) {
        document.execCommand('Copy');
      }
      input.remove();
      Vue.prototype.$noty.success('Copied!', {timeout: 500});
    },
    // 给增加层级关系
    formatData(arr, level = 1, totalExec = null) {
      for (const item of arr) {
        item.level = level;
        totalExec = totalExec || (item.endTime - item.startTime);
        item.totalExec = totalExec;
        if (item.children && item.children.length > 0) {
          this.formatData(item.children, level + 1, totalExec);
        }
      }
      return arr;
    },
    traverseTree(node, spanId, segmentId, data) {
      if (!node) {
        return;
      }
      if (node.spanId === spanId && node.segmentId === segmentId) {
        node.children.push(data);
        return;
      }
      if (node.children && node.children.length > 0) {
        for (const item of node.children) {
          this.traverseTree(item, spanId, segmentId, data);
        }
      }
    },
    changeTree() {
      if (this.data.length === 0) {
        return [];
      }
      this.list = Array.from(new Set(this.data.map((i) => i.serviceCode)));
      this.segmentId = [];
      const segmentGroup = {};
      const segmentIdGroup = [];
      this.data.forEach((i) => {
        i.label = i.endpointName || 'no operation name';
        i.children = [];
        if (segmentGroup[i.segmentId] === undefined) {
          segmentIdGroup.push(i.segmentId);
          segmentGroup[i.segmentId] = [];
          segmentGroup[i.segmentId].push(i);
        } else {
          segmentGroup[i.segmentId].push(i);
        }
      });
      segmentIdGroup.forEach((id) => {
        const currentSegment = segmentGroup[id].sort((a, b) => b.parentSpanId - a.parentSpanId);
        currentSegment.forEach((s) => {
          const index = currentSegment.findIndex((i) => i.spanId === s.parentSpanId);
          if (index !== -1) {
            currentSegment[index].children.push(s);
            currentSegment[index].children.sort((a, b) => a.spanId - b.spanId );
          }
        });
        segmentGroup[id] = currentSegment[currentSegment.length - 1];
      });
      segmentIdGroup.forEach((id) => {
        segmentGroup[id].refs.forEach((ref) => {
          if (ref.traceId === this.traceId) {
            this.traverseTree(segmentGroup[ref.parentSegmentId],
              ref.parentSpanId,
              ref.parentSegmentId,
              segmentGroup[id]);
          }
        });
        // if(segmentGroup[id].refs.length !==0 ) delete segmentGroup[id];
      });
      for (const i in segmentGroup) {
        if (segmentGroup[i].refs.length === 0) {
          this.segmentId.push(segmentGroup[i]);
        }
      }
      // 会出现环形引用，每一个trace都被其他引用，这时候segmentId长度为0，不存在根节点，这时候全部显示
      if (this.segmentId.length == 0) {
        for (const i in segmentGroup) {
            this.segmentId.push(segmentGroup[i])
        }
      }
      this.segmentId.forEach((_, i) => {
        this.collapse(this.segmentId[i]);
      });
      return this.segmentId;
    },
    collapse(d) {
      if (d.children) {
        let dur = d.endTime - d.startTime;
        d.children.forEach((i) => {
          dur -= (i.endTime - i.startTime);
        });
        d.dur = dur < 0 ? 0 : dur;
        d.children.forEach((i) => this.collapse(i));
      }
    },
    handleSelectSpan(data) {
      this.currentSpan = data;
      this.showDetail = true;
    },
  },
  mounted() {
    this.loading = true
    this.tableData = this.formatData(this.changeTree());
    this.loading = false
    this.eventHub.$on('HANDLE-SELECT-SPAN', this.handleSelectSpan);
  },
};
</script>
