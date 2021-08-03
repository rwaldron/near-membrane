/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { print } = globalThis;

const capturedResults = [];
const reporter = {
    /*
        TODO:

        Wrap the below print statements in an optional flag.
    */

    jasmineStarted(suiteInfo) {
        // print(JSON.stringify(suiteInfo, null, 2));
    },

    suiteStarted(result) {
        // print(JSON.stringify(result, null, 2));
        // print(`Suite started: ${result.description} whose full description is: ${result.fullName}`);
    },

    specStarted(result) {
        // print(JSON.stringify(result, null, 2));
        // print(`Spec started: ${result.description} whose full description is: ${result.fullName}`);
    },

    specDone(result) {
        capturedResults.push(result);
        // print(JSON.stringify(result, null, 2));
    },

    suiteDone(result) {
        // print(`   - ${result.fullName} ${result.status.toUpperCase()}`);
        // print(JSON.stringify(result, null, 2));
        // for (let i = 0; i < result.failedExpectations.length; i++) {
        //     print(`Suite ${result.failedExpectations[i].message}`);
        //     print(result.failedExpectations[i].stack);
        // }
    },

    jasmineDone(result) {
        print(JSON.stringify(capturedResults));
        // print(JSON.stringify(result));
    },
};
