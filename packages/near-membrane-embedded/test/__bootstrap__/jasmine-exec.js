/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const config = {
    // failFast: true,
    // oneFailurePerSpec: true,
    // hideDisabled: true,
};
// "env" is created in "jasmine-setup.js"
env.clearReporters();
env.addReporter(reporter);
env.configure(config);

// In order to execute the specs _AFTER_ they have been loaded, this call must
// occur _AFTER_ the test material source text.
env.execute();
