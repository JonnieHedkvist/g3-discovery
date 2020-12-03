"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foundAndLost$ = exports.lostMessage$ = exports.foundMessage$ = exports.removal$ = exports.addition$ = void 0;
const _ = require("lodash");
const g3_addresses_1 = require("./g3-addresses");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const _additions = function (objectA, objectB) {
    return _.transform(objectB, (diff, _value, key) => {
        const a = objectA[key];
        const b = objectB[key];
        if (!_.isUndefined(b) && !_.isEqual(a, b)) {
            if (_.isObject(a) && _.isObject(b)) {
                const diffOfKey = _additions(a, b);
                if (!_.isEmpty(diffOfKey)) {
                    diff[key] = diffOfKey;
                }
            }
            else {
                diff[key] = b;
            }
        }
    });
};
exports.addition$ = g3_addresses_1.G3Addresses$.pipe(operators_1.startWith({}), operators_1.pairwise(), operators_1.map(([prev, curr]) => _additions(prev, curr)), operators_1.filter((found) => !_.isEmpty(found)));
exports.removal$ = g3_addresses_1.G3Addresses$.pipe(operators_1.startWith({}), operators_1.pairwise(), operators_1.map(([prev, curr]) => _additions(curr, prev)), operators_1.filter((lost) => !_.isEmpty(lost)));
exports.foundMessage$ = exports.addition$.pipe(operators_1.withLatestFrom(g3_addresses_1.G3Addresses$), operators_1.mergeMap(([addition, units]) => rxjs_1.merge(...Object.keys(addition).map((deviceId) => rxjs_1.of(_discoveryMessageAdapter(deviceId, { ...units[deviceId] }, true))))));
exports.lostMessage$ = exports.removal$.pipe(operators_1.withLatestFrom(g3_addresses_1.G3Addresses$), operators_1.mergeMap(([removal, units]) => rxjs_1.merge(...Object.keys(removal).map((deviceId) => rxjs_1.of(_discoveryMessageAdapter(deviceId, { ...units[deviceId] }, false))))));
exports.foundAndLost$ = rxjs_1.merge(exports.foundMessage$, exports.lostMessage$);
const _discoveryMessageAdapter = function (deviceId, addresses, found) {
    const msg = {
        deviceId,
        found,
        deviceType: 'G3',
        ipAddress: addresses.ipv4,
        ipv4: addresses.ipv4,
        ipv6: addresses.ipv6,
        hostname: `${deviceId}.local`,
        origin: addresses.ipv4,
        address: addresses.ipv4,
        port: 80
    };
    return msg;
};
//# sourceMappingURL=g3-discovery.js.map