# `near-membrane-embedded`

A near-membrane from use in embedded hosts, eg. `JavaScriptCore` or `V8`.

## Usage

Use the contents of `lib/index.js` directly by either:

1. Loading it in before your script or file (only supported by JSC):

    ```sh
    jsc packages/near-membrane-embedded/lib/index.js -e "print(typeof createVirtualEnvironment)"
    function
    ```
1. Prepending it to your test file:

    ```sh
    jsc file-that-contains-near-membrane-embedded-and-tests.js
    v8 file-that-contains-near-membrane-embedded-and-tests.js
    ```


## Support

Use `esvu` to install JS engines: `npm install esvu -g`. If JSC does not install correctly, try installing `esvu` with `npm install devsnek/esvu -g`.
