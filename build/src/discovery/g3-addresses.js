"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G3Addresses$ = exports.prune = void 0;
const g3_mdns_1 = require("./g3-mdns");
const _ = require("lodash");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
exports.prune = function (object) {
    return _.transform(object, (result, value, key) => {
        if (_.isObject(value)) {
            const o = exports.prune(value);
            if (!_.isEmpty(o)) {
                result[key] = o;
            }
        }
        else if (!_.isUndefined(value) && !_.isNull(value)) {
            result[key] = value;
        }
    });
};
const _expireAddress = function (time) {
    return function (src) {
        return new rxjs_1.Observable(function (subscriber) {
            const timeouts = {};
            const subscription = src.subscribe(function (g3Addresses) {
                subscriber.next(g3Addresses);
                Object.entries(g3Addresses).forEach(([deviceId, addresses]) => {
                    if (_.isUndefined(timeouts[deviceId])) {
                        timeouts[deviceId] = {};
                    }
                    Object.keys(addresses).forEach((addressType) => {
                        if (!_.isUndefined(timeouts[deviceId][addressType])) {
                            clearTimeout(timeouts[deviceId][addressType]);
                            timeouts[deviceId][addressType] = undefined;
                        }
                        timeouts[deviceId][addressType] = setTimeout(() => {
                            subscriber.next({ [deviceId]: { [addressType]: null } });
                        }, time);
                    });
                });
            });
            const teardownLogic = () => {
                subscription.unsubscribe();
            };
            return teardownLogic;
        });
    };
};
exports.G3Addresses$ = g3_mdns_1.G3AddressPoll$(3000).pipe(_expireAddress(7000), operators_1.scan((knownAddresses, newAddressInfo) => exports.prune(_.merge({}, knownAddresses, newAddressInfo)), {}), operators_1.distinctUntilChanged(_.isEqual), operators_1.shareReplay({ refCount: true, bufferSize: 1 }));
//# sourceMappingURL=g3-addresses.js.map