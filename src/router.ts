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

import Vue from 'vue';
import Router from 'vue-router';
// import Login from './views/containers/login.vue';
import Index from './views/containers/index.vue';
import Dashboard from './views/containers/dashboard.vue';
import Trace from './views/containers/trace.vue';
import Topology from './views/containers/topology/topology.vue';
import Alarm from './views/containers/alarm.vue';
import Profile from './views/containers/profile.vue';
import global from './store/modules/global';
import Axios from 'axios';

Vue.use(Router);
window.axiosCancel = [];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  routes: [
    // {
    //   path: '/login',
    //   component: Login,
    //   meta: { login: true },
    // },
    {
      path: '/',
      component: Index,
      children: [
        {
          path: '',
          component: Dashboard,
        },
        {
          path: 'trace',
          component: Trace,
        },
        {
          path: 'topology',
          component: Topology,
        },
        {
          path: 'alarm',
          component: Alarm,
        },
        {
          path: 'profile',
          component: Profile,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  let projectIds: any[] = [];
  if (to.path === '/' && to.query.externalProjectId) {
    const defaultProjectId: string = to.query.externalProjectId as string;
    const organizationCode: string = to.query.organizationCode as string;
    const projectId: string = to.query.projectId as string;
    const itworkToken: string = to.query.token as string;

    window.localStorage.setItem('defaultProjectId', defaultProjectId);
    window.localStorage.setItem('organizationCode', organizationCode);
    window.localStorage.setItem('projectId', projectId);
    window.localStorage.setItem('itwork_token', itworkToken);
  }
  Axios.get('/user/projects').then( (res) => {
    const { headers: {invalid, url} } = res;
    if (invalid === 'true') {
      window.location.href = url;
    } else {
      projectIds = res.data.data.projects;
      window.localStorage.setItem('projectIds', JSON.stringify(projectIds));

      Axios.get('/user/admin').then( (response) => {
        global.state.userAuth = response.data.data.admin;
        if (response.data.data.admin) {
          window.localStorage.setItem('projectIds', JSON.stringify([]));
        }
      });
    }
  });
  const token = window.localStorage.getItem('skywalking-authority');
  if (window.axiosCancel.length !== 0) {
    for (const func of window.axiosCancel) {
      setTimeout(func(), 0);
    }
    window.axiosCancel = [];
  }
  // if (to.meta.login && (token === null || token === 'guest')) {
  //   next();
  // } else if (token === null || token === 'guest') {
  //   next('/login');
  // } else if (to.meta.login) {
  //   next(from.path);
  // } else {
  //   next();
  // }
  next();
});

export default router;
