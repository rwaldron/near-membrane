/*
    This shim is used as a substitute for the LockerRealm API that is provided by the Lightning SDK
    iOS and Android embedded host environments.

    This source is written in pure JS (instead of TS) because it will be concatenated with built
    files for use in embedded tests.

    This source is NOT written as a module because it must be treated as a global object, as it is
    in the embedded environments that near-membrane-embedded targets.
*/

if (!globalThis.LockerRealm) {
    /*
        "d8" is the shell host that ships with V8.
        "jsc" is the shell host that ships with WebKit/JavaScriptCore

        d8 and jsc both expose many non-standard global objects that are useful for testing the
        engine itself. Those APIs are generally considered stable, but only for their respective
        engine.

        For the creation of new Realms, the following objects are exposed:

        - In d8: the Realm object, which has a method called "createAllowCrossRealmAccess()"
        - In jsc: the $262 objecty, which has a method called "createRealm()"

        Since this source code may be used in eshost, where $262 is also defined, the
        check for $262.createRealm in JSC also includes a check for "createGlobalObject()".
    */
    const isRunningInD8 =
        typeof globalThis.Realm !== 'undefined' &&
        typeof globalThis.Realm.createAllowCrossRealmAccess === 'function';
    const isRunningInJSC =
        typeof $262 !== 'undefined' &&
        // eslint-disable-next-line no-undef
        typeof $262.createRealm === 'function' &&
        typeof createGlobalObject === 'function';
    const d8Realm = isRunningInD8 ? globalThis.Realm : null;
    // eslint-disable-next-line no-undef
    const jscRealm = isRunningInJSC ? $262.createRealm : null;
    const realmCreator = isRunningInD8 ? d8Realm.createAllowCrossRealmAccess : jscRealm;

    if (!realmCreator) {
        throw new Error('This environment cannot create child realms');
    }

    const LockerRealm = {
        create() {
            const realm = realmCreator();
            return {
                evaluateScript(code) {
                    if (isRunningInD8) {
                        return d8Realm.eval(realm, code);
                    }
                    if (isRunningInJSC) {
                        return realm.evalScript(code);
                    }
                    throw new Error('This environment cannot evaluate scripts');
                },
            };
        },
    };

    Object.defineProperty(globalThis, 'LockerRealm', {
        value: LockerRealm,
        enumerable: true,
        writable: false,
        configurable: false,
    });
}
