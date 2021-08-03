/* eslint-disable no-unused-vars */
import './3rdparty/jasmine-standalone-3.8.0/jasmine.js';

// The following is used to suppress errors stemming from the presense
// of "jasmineRequire", which is defined in
// 3rdparty/jasmine-standalone-3.8.0/jasmine.js
// eslint-disable-next-line no-undef
globalThis.jasmine = jasmineRequire.core(jasmineRequire);

const env = globalThis.jasmine.getEnv();
// The following is used to suppress errors stemming from the presense
// of "jasmineRequire", which is defined in
// 3rdparty/jasmine-standalone-3.8.0/jasmine.js
// eslint-disable-next-line no-undef
const jasmineInterface = jasmineRequire.interface(globalThis.jasmine, env);

Object.assign(globalThis, jasmineInterface);
