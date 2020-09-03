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

//  param 1598511554
// 散点图X轴日期格式 13:12:34\n
//        08-23
export const getAxisTime = (timestamp: any) => {
    const dataTime =  getDateTime(timestamp);
    return dataTime.hours + ':' +
           dataTime.minutes + ':' +
           dataTime.seconds + '\n' +
           dataTime.month + '-' +
           dataTime.day;
};

// 请求日期格式 2020-06-10 101601
export const getRequestTimeTemplate = (timestamp: any) => {
    const dataTime =  getDateTime(timestamp);
    return dataTime.year + '-' +
           dataTime.month + '-' +
           dataTime.day + ' ' +
           dataTime.hours +
           dataTime.minutes +
           dataTime.seconds;
};

// tslint:disable-next-line:no-shadowed-variable
export const changeTimeFormat = (timeFormat: any) => {
    const year = new Date().getFullYear();
    const timeArr = timeFormat.split(/\n/);
    const newTime = year + '-' + timeArr[1] + ' ' + timeArr[0];
    return newTime.replace(/-/g, '/');
};

export const getSecondTimestamp = (date: Date) => {
    return date.getTime() / 1000;
};

export function getDateTime(timestamp: any) {
    const time = new Date((timestamp) * 1000 );
    const dataTime = {
        year: time.getFullYear(),
        month: (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1),
        day: time.getDate() < 10 ? '0' + time.getDate() : time.getDate(),
        hours: time.getHours() < 10 ? '0' + time.getHours() : time.getHours(),
        minutes: time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes(),
        seconds: time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds(),
    };
    return dataTime;
}
