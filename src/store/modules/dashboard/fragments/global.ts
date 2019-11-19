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


// TODO getGlobalBrief(duration: Duration!,externalProjectId: String): ClusterBrief
export const globalBrief =  {
  variable: ['$duration: Duration!', '$externalProjectId: String!'],
  fragment: `
  globalBrief: getGlobalBrief(duration: $duration, externalProjectId: $externalProjectId) {
    numOfService numOfEndpoint numOfDatabase numOfCache numOfMQ
  }`,
};

// export const globalHeatmap =  {
//   variable: ['$duration: Duration!'],
//   fragment: `
//   globalHeatmap: getThermodynamic(duration: $duration, metric: {
//     name: "all_heatmap"
//   }) {
//     nodes responseTimeStep: axisYStep
//   }`,
// };

export const globalHeatmap =  {
  variable: ['$duration: Duration!', '$externalProjectId: String!'],
  fragment: `
  globalHeatmap: getThermodynamic(duration: $duration, metric: {
    name: "project_heatmap",
    externalProjectId: $externalProjectId
  }) {
    nodes responseTimeStep: axisYStep
  }`,
};

// export const globalPercent =  {
//   variable: ['$duration: Duration!'],
//   fragment: `
//   globalP99: getLinearIntValues(metric: {
//     name: "all_p99"
//   }, duration: $duration) { values { value } }
//   globalP95: getLinearIntValues(metric: {
//     name: "all_p95"
//   }, duration: $duration) { values { value } }
//   globalP90: getLinearIntValues(metric: {
//     name: "all_p90"
//   }, duration: $duration) { values { value } }
//   globalP75: getLinearIntValues(metric: {
//     name: "all_p75"
//   }, duration: $duration) { values { value } }
//   globalP50: getLinearIntValues(metric: {
//     name: "all_p50"
//   }, duration: $duration) { values { value } }`,
// };

export const globalPercent =  {
  variable: ['$duration: Duration!', '$externalProjectId: String!'],
  fragment: `
  globalP99: getLinearIntValues(metric: {
    name: "project_p99",
    externalProjectId: $externalProjectId
  }, duration: $duration) { values { value } }
  globalP95: getLinearIntValues(metric: {
    name: "project_p95",
    externalProjectId: $externalProjectId
  }, duration: $duration) { values { value } }
  globalP90: getLinearIntValues(metric: {
    name: "project_p90",
    externalProjectId: $externalProjectId
  }, duration: $duration) { values { value } }
  globalP75: getLinearIntValues(metric: {
    name: "project_p75",
    externalProjectId: $externalProjectId
  }, duration: $duration) { values { value } }
  globalP50: getLinearIntValues(metric: {
    name: "project_p50",
    externalProjectId: $externalProjectId
  }, duration: $duration) { values { value } }`,
};


// TODO  getAllEndpointTopN(name: String!, topN: Int!, duration: Duration!, order: Order!,externalProjectId: String): [TopNEntity!]!
export const globalSlow =  {
  variable: ['$duration: Duration!', '$externalProjectId: String!'],
  fragment: `
  globalSlow: getAllEndpointTopN(
    duration: $duration,
    name: "endpoint_avg",
    topN: 10,
    order: DES,
    externalProjectId: $externalProjectId
  ) {
    key: id label: name value
  }`,
};
// TODO getServiceTopN(name: String!, topN: Int!, duration: Duration!, order: Order!,externalProjectId: String): [TopNEntity!]!
export const globalThroughput =  {
  variable: ['$duration: Duration!', '$externalProjectId: String!'],
  fragment: `
  globalThroughput: getServiceTopN(
    duration: $duration,
    name: "service_cpm",
    topN: 10,
    order: DES,
    externalProjectId: $externalProjectId
  ) {
    key: id label: name value
  }`,
};
