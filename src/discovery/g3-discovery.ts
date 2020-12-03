import {DiscoveryMessage} from '../types';
// import _ from 'lodash';
import * as _ from 'lodash';

import {G3Addresses$} from './g3-addresses';
import {Addresses} from './g3-mdns';
import {
  merge,
  of
} from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  pairwise,
  startWith,
  withLatestFrom
} from 'rxjs/operators';

/**
 * Additions.
 * Return an object containing what objectB contains that objectA does not.
 * Also overwrites what objectA has if objectB has a different value.
 * Examples:
 * _additions({a: 1, b: 2}, {b: 2})             -> {}
 * _additions({a: 1, b: 2}, {b: 3})             -> {b: 3}
 * _additions({a: 1, b: 2}, {c: 3})             -> {c: 3}
 * _additions({a: 1, b: 2}, {b: {c: 3}})        -> {b: {c: 3}}
 * _additions({a: 1, b: {c: 3}}, {b: {c: 3}})   -> {}.
 * _additions({a: 1, b: {c: 3}}, {b: {c: 4}})   -> {b: {c: 4}}.
 **/
const _additions = function<T>(objectA: T, objectB: T): T {
  return _.transform(objectB as any, (diff, _value, key) => {
    const a = objectA[key];
    const b = objectB[key];
    if (!_.isUndefined(b) && !_.isEqual(a, b)) {
      if (_.isObject(a) && _.isObject(b)) {
        const diffOfKey = _additions(a, b);
        if (!_.isEmpty(diffOfKey)) {
          diff[key] = diffOfKey;
        }
      } else {
        diff[key] = b;
      }
    }
  });
};

export const addition$ = G3Addresses$.pipe(
  startWith({}),
  pairwise(),
  map(([prev, curr]) => _additions(prev, curr)),
  filter((found) => !_.isEmpty(found))
);

export const removal$ = G3Addresses$.pipe(
  startWith({}),
  pairwise(),
  map(([prev, curr]) => _additions(curr, prev)),
  filter((lost) => !_.isEmpty(lost))
);

export const foundMessage$ = addition$.pipe(
  withLatestFrom(G3Addresses$),
  mergeMap(([addition, units]) =>
    merge(
      ...Object.keys(addition).map(
        (deviceId) => of(_discoveryMessageAdapter(
          deviceId,
          {...units[deviceId]}, // Do not need spread here, but kept for consistency with lostMessage$ below
          true))
      )
    )
  )
);

export const lostMessage$ = removal$.pipe(
  withLatestFrom(G3Addresses$),
  mergeMap(([removal, units]) =>
    merge(
      ...Object.keys(removal).map(
        (deviceId) => of(_discoveryMessageAdapter(
          deviceId,
          {...units[deviceId]}, // spread to make undefined into {}
          false))
      )
    )
  )
);

export const foundAndLost$ = merge(foundMessage$, lostMessage$);

const _discoveryMessageAdapter = function(deviceId: string, addresses: Addresses, found: boolean): DiscoveryMessage {
  const msg: DiscoveryMessage = {
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
