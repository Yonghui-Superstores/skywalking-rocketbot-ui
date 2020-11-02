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

import graph from '@/graph';
import * as types from '@/store/mutation-types';
import { Option } from '@/types/global';
import { Span, Trace } from '@/types/topo';
import { AxiosResponse } from 'axios';
import { ActionTree, Commit, Dispatch, MutationTree } from 'vuex';
import global from '../global';
import Axios from 'axios';

export interface State {
  project: any;
  projects: Option[];
  services: Option[];
  instances: Option[];
  endpoints: string[];
  traceForm: any;
  traceList: Trace[];
  traceTotal: number;
  traceSpans: Span[];
  currentTrace: Trace;
  queryDate: Date[];
}

const initState: State = {
  project: {},
  projects: [],
  services: [],
  instances: [],
  endpoints: [],
  traceForm: {
    paging: { pageNum: 1, pageSize: 15, needTotal: true },
    queryOrder: localStorage.getItem('traceQueryOrder') || 'BY_DURATION',
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
  queryDate: [],
};

// getters
const getters = {
  getQueryDate(state: State): any {
    return [timeTemp(state.queryDate[0], -30), timeTemp(state.queryDate[1], 30)];
  },
};

// mutations
const mutations: MutationTree<State> = {
  [types.SET_QUERY_DATE](state: State, data: []): void {
    state.queryDate = data;
  },
  [types.SET_PROJECTS](state: State, data: Option[]): void {
    state.projects = [{ label: 'All', key: '' }].concat(data);
    // state.project = data[0];
  },
  [types.SET_SERVICES](state: State, data: Option[]): void {
    state.services = [{ label: 'All', key: '' }].concat(data);
  },
  [types.SET_INSTANCES](state: State, data: Option[]): void {
    state.instances = [{ label: 'All', key: '' }].concat(data);
  },
  [types.SET_TRACE_FORM](state: State, data: any): void {
    if (data.queryOrder) {
      if (data.queryOrder === '') {
        data.queryOrder = 'BY_DURATION';
        localStorage.setItem('traceQueryOrder', 'BY_DURATION');
      } else {
        localStorage.setItem('traceQueryOrder', data.queryOrder);
      }
    }
    state.traceForm = data;
  },
  [types.SET_TRACE_FORM_ITEM](state: State, params: any): void {
    if (params.type && params.type === 'queryOrder') {
      if (params.data === '') {
        params.data = 'BY_DURATION';
        localStorage.setItem('traceQueryOrder', 'BY_DURATION');
      } else {
        localStorage.setItem('traceQueryOrder', params.data);
      }
    }
    state.traceForm[params.type] = params.data;
  },
  [types.SET_TRACELIST](state: State, data: Trace[]): void {
    state.traceList = data;
  },
  [types.SET_TRACELIST_TOTAL](state: State, data: number): void {
    state.traceTotal = data;
  },
  [types.SET_TRACE_SPANS](state: State, data: Span[]): void {
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
  [types.SET_SEARCH_ENDPOINTS](state: State, data: string[]): void {
    state.endpoints = data;
  },
};

// actions
const actions: ActionTree<State, any> = {
  // tslint:disable-next-line:max-line-length
  GET_PROJECTS(context: { commit: Commit }, params: { duration: any; projectNames: any }) {
    let projectIds: any[] = [];
    const projects = window.localStorage.getItem('projectIds');
    if ( projects !== null) {
      projectIds = JSON.parse(projects);
    }
    if (!params.projectNames) {
      params.projectNames = projectIds;
    }
    return graph
      .query('queryProjects')
      .params(params)
      .then((res: AxiosResponse) => {
        context.commit(types.SET_PROJECTS, res.data.data.projects);
      });
  },
  // tslint:disable-next-line:max-line-length
  GET_SERVICES(context: { commit: Commit }, params: { duration: any; keyword: string, projectId: string}): Promise<void> {
    if (!params.keyword) {
      params.keyword = '';
    }
    return graph
      .query('queryServices')
      .params(params)
      .then((res: AxiosResponse) => {
        context.commit(types.SET_SERVICES, res.data.data.services);
      });
  },
  GET_INSTANCES(context: { commit: Commit }, params: any): Promise<void> {
    return graph
      .query('queryServiceInstance')
      .params(params)
      .then((res: AxiosResponse) => {
        context.commit(types.SET_INSTANCES, res.data.data.instanceId);
      });
  },
  SET_TRACE_FORM(context: { commit: Commit; dispatch: Dispatch }, params: any): void {
    context.commit(types.SET_TRACE_FORM, params);
  },
  GET_TRACELIST(context: { state: State; commit: Commit }): Promise<void> {
    context.commit(types.SET_TRACELIST, []);
    return graph
      .query('queryTraces')
      .params({ condition: context.state.traceForm })
      .then((res: AxiosResponse) => {
        context.commit(types.SET_TRACELIST, res.data.data.data.traces);
        context.commit(types.SET_TRACELIST_TOTAL, res.data.data.data.total);
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
  SEARCH_ENDPOINTS(context: { commit: Commit }, params: any): Promise<void> {
    context.commit(types.SET_SEARCH_ENDPOINTS, []);
    return graph
      .query('serchEndpoints')
      .params(params)
      .then((res: AxiosResponse) => {
        const endpoints: string[] = [];
        res.data.data.getEndpoints.forEach((v: any) => {
          endpoints.push(v.label);
        });
        context.commit(types.SET_SEARCH_ENDPOINTS, endpoints);
      });
  },
};

function timeTemp(date: Date, step: any) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return new Date(year, month - 1, day, hour, minute + step, second).toISOString();
}

export default {
  namespaced: true,
  state: initState,
  getters,
  actions,
  mutations,
};
