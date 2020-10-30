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
// import { AxiosResponse } from 'axios';
import Axios, { AxiosResponse } from 'axios';
import graph from '@/graph';
import * as types from '@/store/mutation-types';
import { Option } from '@/types/global';
import { Trace, Span } from '@/types/topo';
import { getPrefixes, getFilterProjectList } from '@/utils/serviceFilter';
import getProjectIdFromCookie from '@/utils/cookie.js';

export interface State {
  services: Option[];
  instances: Option[];
  traceForm: any;
  traceList: Trace[];
  traceTotal: number;
  traceSpans: Span[];
  currentTrace: Trace;
  queryDate: Date[];
}

const initState: State = {
  services: [],
  instances: [],
  traceForm: {
    paging: {pageNum: 1, pageSize: 15, needTotal: true},
    queryOrder: 'BY_DURATION',
  },
  traceList: [],
  traceTotal: 0,
  traceSpans: [],
  currentTrace: {
    operationNames: [],
    duration: 0,
    isError: false,
    key: '',
    start: '',
    traceIds: [],
  },
  // tslint:disable-next-line:new-parens
  queryDate: [],
};

// getters
const getters = {
  getQueryDate(state: State): any {
    return [timeTemp(state.queryDate[0]), timeTemp(state.queryDate[1])];
  },
};

// mutations
const mutations: MutationTree<State> = {
  [types.SET_QUERY_DATE](state: State, data: []): void {
    state.queryDate = data;
  },
  [types.SET_SERVICES](state: State, data: Option[]): void {
    state.services = [{label: 'All', key: ''}].concat(data);
  },
  [types.SET_INSTANCES](state: State, data: Option[]): void {
    state.instances = [{label: 'All', key: ''}].concat(data);
  },
  [types.SET_TRACE_FORM](state: State, data: Option[]): void {
    state.traceForm = data;
  },
  [types.SET_TRACE_FORM_ITEM](state: State, params: any): void {
    state.traceForm[params.type] = params.data;
  },
  [types.SET_TRACELIST](state: State, data: Trace[]): void {
    state.traceList = data;
  },
  [types.SET_TRACELIST_TOTAL](state: State, data: number): void {
    state.traceTotal = data;
  },
  [types.SET_TRACE_SPANS](state: State, data: Span[]): void {
    data.map((span: any) => {
      if (span.layer === 'Unknown') {
        span.layer = 'Local';
      }
    });
    state.traceSpans = data;
  },
  [types.SET_CURRENT_TRACE](state: State, data: Span): void {
    state.currentTrace = data;
  },
  [types.SET_DEFAULT_EMPTY_TRACE](state: State): void {
    state.currentTrace = {
      operationNames: [],
      duration: 0,
      isError: false,
      key: '',
      start: '',
      traceIds: [],
    };
  },
};

// actions
const actions: ActionTree<State, any> = {
  GET_SERVICES(context: { commit: Commit }, params: any): Promise<void> {
    return Axios.get('/user/projects').then((res: any) => {
      const response = res as any;
      const validProjects = response.data.projects || [];
      const prefixes = getPrefixes(validProjects);
      // const prefixes = ['p2a#'] // test code

      const projectId = getProjectIdFromCookie();
      params.externalProjectId = projectId;

      return graph
      .query('queryServices')
      .params(params)
      .then((res2: AxiosResponse) => {
        const resultServices = getFilterProjectList(prefixes, res2.data.data.services);
        context.commit(types.SET_SERVICES, resultServices);
        // context.commit(types.SET_SERVICES, res.data.data.services);
      });
    });
  },
  GET_INSTANCES(context: { commit: Commit }, params: any): Promise<void> {

    const projectId = getProjectIdFromCookie();
    params.externalProjectId = projectId;
    return graph
    .query('queryServiceInstance')
    .params(params)
    .then((res: AxiosResponse) => {
      context.commit(types.SET_INSTANCES, res.data.data.instanceId);
    });
  },
  SET_TRACE_FORM(context: { commit: Commit, dispatch: Dispatch }, params: any): void {
    context.commit(types.SET_TRACE_FORM, params);
  },
  GET_TRACELIST(context: { state: State, commit: Commit }): Promise<void> {
    context.commit(types.SET_TRACELIST, []);
    return graph
    .query('queryTraces')
    .params({condition: context.state.traceForm})
    .then((res: AxiosResponse) => {
      context.commit(types.SET_TRACELIST, res.data.data.traces.data);
      context.commit(types.SET_TRACELIST_TOTAL, res.data.data.traces.total);
    });
  },
  GET_TRACE_SPANS(context: { commit: Commit }, params: any): Promise<void> {
    context.commit(types.SET_TRACE_SPANS, []);
    return graph
    .query('queryTrace')
    .params(params)
    .then((res: AxiosResponse) => {
      context.commit(types.SET_TRACE_SPANS, res.data.data.trace.spans);
    });
  },
};


function timeTemp(date: Date) {
  const year = date.getFullYear();

  const monthTemp = date.getMonth() + 1;
  let month: string = `${monthTemp}`;
  if (monthTemp < 10) { month = `0${monthTemp}`; }

  const dayTemp = date.getDate();
  let day: string = `${dayTemp}`;
  if (dayTemp < 10) { day = `0${dayTemp}`; }

  const hourTemp = date.getHours();
  let hour: string = `${hourTemp}`;
  if (hourTemp < 10) { hour = `0${hourTemp}`; }

  const minuteTemp = date.getMinutes();
  let minute: string = `${minuteTemp}`;
  if (minuteTemp < 10) { minute = `0${minuteTemp}`; }

  const secondTemp = date.getSeconds();
  let second: string = `${secondTemp}`;
  if (secondTemp < 10) { second = `0${secondTemp}`; }

  // 2020-07-01T02:38:08.949Z
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
}

export default {
  namespaced: true,
  state: initState,
  getters,
  actions,
  mutations,
};
