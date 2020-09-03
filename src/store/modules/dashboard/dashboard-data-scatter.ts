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

import { Commit, ActionTree, MutationTree, Dispatch } from 'vuex';
import { getRequestTimeTemplate, getSecondTimestamp, getAxisTime } from '@/utils/scatterTimeUtils';
import * as types from './mutation-types';

export interface State {
    // X轴日期数据集
    xAxisData: any[];
    yAxisData: any[];
    // X轴刻度跨度Step
    xAxisStep: number;
    // 请求次数
    divide: number;
    // 分段请求组装数据
    divideIndex: number;
    // 分段请求日期集
    requestDate: any[];
    // 分段日期跨度Step
    requestDateStep: number;
    // 请求体跨度
    step: number;
    // response返回数据集
    successData: any[];
    failureData: any[];
    // X轴左移动移动跨度
    variable: number;
    // 定时器
    timing: any;
    // 请求Token
    cancelToken: any;
    // 分段请求CancelToken集
    axiosCancel: any[];
  }

const initState: State = {
    xAxisData: [],
    yAxisData: [],
    xAxisStep: 1,
    divide: 1,
    divideIndex: 1,
    requestDate: [],
    requestDateStep: 1,
    step: 1,
    successData: [],
    failureData: [],
    variable: 3,
    timing: '',
    cancelToken: '',
    axiosCancel: [],
  };

// getters
const getters = {};

// mutations
const mutations: MutationTree<State> = {
  [types.QUERY_FREQUENCY](state: State, data: any) {
    state.xAxisStep = data / 450;
    state.step = Math.floor(state.xAxisStep);

    if (data <= 450) {
      state.divide = 1;
      state.step = 1;
    } else if (data <= 60 * 15) {
      state.divide = 1;
    } else if (data <= 60 * 60) {
      state.divide = 4;
    } else if (data <= 60 * 60 * 2) {
      state.divide = 8;
    } else if (data <= 60 * 60 * 4) {
      state.divide = Math.ceil(data / 1800);
    } else {
      state.divide = Math.ceil(data / 3600);
    }
    state.requestDateStep = data / state.divide;
    state.divideIndex = state.divide - 1;
  },
  [types.SET_DATE_TEMPLATE_DATA](state: State, data: any) {
    state.requestDate = [];
    state.xAxisData = [];
    const start = getSecondTimestamp(data.start);
    const end = getSecondTimestamp(data.end);

    if (state.divide === 1) {
      state.requestDate.push(getRequestTimeTemplate(start));
      state.requestDate.push(getRequestTimeTemplate(end));

      // 计算X轴日期集和请求日期集
      // 请求一次时,X轴刻度会小于400(step = 1),step = 2时 需要计算刻度的跨度xAxisStep
      if (state.step === 2) {
        for (let i = start; i <= end; i += Math.floor(state.xAxisStep)) {
          state.xAxisData.push(getAxisTime(i));
        }
      } else {
        for (let i = start; i <= end; i++) {
          state.xAxisData.push(getAxisTime(i));
        }
      }
    } else {
      let time = start;
      for ( let i = 0; i <= state.divide; i++) {
        state.requestDate.push(getRequestTimeTemplate(time));
        time += state.requestDateStep;
      }
      for ( let j = start; j <= end; j += state.xAxisStep) {
        state.xAxisData.push(getAxisTime(j));
      }
    }
},
};

// actions
const actions: ActionTree<State, any> = {
  SET_SCATTER_DATA(context: { commit: Commit, state: State }, params: any = {}) {
    const gapTime = getSecondTimestamp(params.end) - getSecondTimestamp(params.start);
    context.commit(types.QUERY_FREQUENCY, gapTime);
    context.commit(types.SET_DATE_TEMPLATE_DATA, params);
  },
};

export default {
  state: initState,
  getters,
  actions,
  mutations,
};
