// eslint-disable-next-line no-unused-vars
const process = {
    argv: [],
    env: {},
    version: '',
};

// eslint-disable-next-line no-console
globalThis.print = globalThis.print || ((...args) => console.log(...args));

// The embedded enviroments that will run these tests may not have a built-in setTimeout or clearTimeout
{
    const timers = [];
    globalThis.setTimeout = (callback, timeout) => {
        const timerIndex = timers.length;
        const p = Promise.resolve();
        const start = Date.now();
        const end = start + timeout;
        function check() {
            if (timers[timerIndex]) {
                const timeLeft = end - Date.now();
                if (timeLeft > 0) {
                    p.then(check);
                } else {
                    callback();
                }
            }
        }
        timers.push(true);
        p.then(check);
        return timerIndex;
    };

    globalThis.clearTimeout = (timerIndex) => {
        if (timerIndex >= timers.length) {
            return;
        }
        timers[timerIndex] = false;
    };
}

// The embedded enviroments that will run these tests may not have a built-in setInterval or clearInterval
{
    const intervals = [];
    globalThis.setInterval = (callback, timeout) => {
        const intervalIndex = intervals.length;
        function interval() {
            if (intervals[intervalIndex]) {
                globalThis.setTimeout(() => {
                    callback();
                    interval();
                }, timeout);
            }
        }
        intervals.push(true);
        interval();
        return intervalIndex;
    };

    globalThis.clearInterval = (intervalIndex) => {
        if (intervalIndex >= intervals.length) {
            return;
        }
        intervals[intervalIndex] = false;
    };
}
