import {
  Addresses,
  G3AddressPoll$,
  G3Addresses
} from './g3-mdns';
// import _ from 'lodash';
import * as _ from 'lodash';

import {
  Observable,
  Subscriber,
  TeardownLogic
} from 'rxjs';
import {
  distinctUntilChanged,
  scan,
  shareReplay
} from 'rxjs/operators';

/**
 * Prune.
 * Remove dead branches of a tree,
 * hence remove leaves that are null or undefined and objects that are empty.
 **/
export const prune = function<T>(object: T): T {
  return _.transform(object as any, (result, value, key) => {
    if (_.isObject(value)) {
      const o = prune(value);
      if (!_.isEmpty(o)) {
        result[key] = o;
      }
    } else if (!_.isUndefined(value) && !_.isNull(value)) {
      result[key] = value;
    }
  });
};

// Emit null for an address which was not emitted by src for time ms
const _expireAddress = function(time: number) {
  return function(src: Observable<G3Addresses>): Observable<G3Addresses> {
    return new Observable(function(subscriber: Subscriber<G3Addresses>) {
      const timeouts = {};
      const subscription = src.subscribe(function(g3Addresses: G3Addresses) {
        subscriber.next(g3Addresses);
        Object.entries(g3Addresses).forEach(([deviceId, addresses]: [string, Addresses]) => {
          if (_.isUndefined(timeouts[deviceId])) {
            timeouts[deviceId] = {};
          }
          Object.keys(addresses).forEach((addressType) => {
            if (!_.isUndefined(timeouts[deviceId][addressType])) {
              clearTimeout(timeouts[deviceId][addressType]);
              timeouts[deviceId][addressType] = undefined;
            }
            timeouts[deviceId][addressType] = setTimeout(() => {
              // eslint-disable-next-line no-null/no-null
              subscriber.next({[deviceId]: {[addressType]: null}});
            }, time);
          });
        });
      });
      const teardownLogic: TeardownLogic = () => {
        subscription.unsubscribe();
      };
      return teardownLogic;
    });
  };
};

export const G3Addresses$: Observable<G3Addresses> = G3AddressPoll$(3000).pipe(
  _expireAddress(7000),
  scan((knownAddresses: G3Addresses, newAddressInfo: G3Addresses) =>
    prune<G3Addresses>(_.merge({}, knownAddresses, newAddressInfo)), {}),
  distinctUntilChanged(_.isEqual),
  shareReplay({refCount: true, bufferSize: 1})
);
