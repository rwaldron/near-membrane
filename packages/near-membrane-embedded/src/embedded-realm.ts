import {
    VirtualEnvironment,
    EnvironmentOptions,
    getFilteredEndowmentDescriptors,
    linkIntrinsics,
    setupStackTrace,
} from '@locker/near-membrane-base';

// eslint-disable-next-line import/extensions
import './LockerRealm';

export default function createVirtualEnvironment(
    options?: EnvironmentOptions
): (sourceText: string) => void {
    const blueGlobalThis = globalThis as any;
    // LockerRealm is a host API defined in the host environment that
    // this virtual environment membrane is intended to run
    const realm = blueGlobalThis.LockerRealm.create();
    const { distortionCallback, endowments } = options || { __proto__: null };
    const redGlobalThis = realm.evaluateScript('globalThis');
    const endowmentsDescriptors = getFilteredEndowmentDescriptors(
        endowments || { __proto__: null }
    );
    const env = new VirtualEnvironment({
        blueGlobalThis,
        redGlobalThis,
        distortionCallback,
    });
    setupStackTrace(redGlobalThis);
    linkIntrinsics(env, blueGlobalThis, redGlobalThis);

    env.remap(redGlobalThis, blueGlobalThis, endowmentsDescriptors);

    return (sourceText: string): void => {
        try {
            realm.evaluateScript(sourceText);
        } catch (e) {
            throw env.getBlueValue(e);
        }
    };
}
