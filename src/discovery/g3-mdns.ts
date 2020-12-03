import {
  MDNSAnswer,
  MDNSResponse,
  pollMDNS$
} from './poll-mdns';
// import _ from 'lodash';
import * as _ from 'lodash';

import {Observable} from 'rxjs';
import {
  filter,
  map
} from 'rxjs/operators';

export const IPv4 = 'ipv4';

export const IPv6 = 'ipv6';

export interface Addresses {
  [IPv4]?: string;
  [IPv6]?: string;
}

export interface G3Addresses {
  [deviceId: string]: Addresses;
}

const _G3ServiceName = '_tobii-g3api._tcp.local';

const _G3Prefix = 'TG03B';

const _linkLocalIPv6 = /(fe80::[\S]+)/;

const _AnswerTypeTranslation = {
  A: IPv4,
  AAAA: IPv6
};

const _onlyG3Addresses = function(response: MDNSResponse): MDNSResponse {
  const g3Addresses = response.answers.filter(
    (answer: MDNSAnswer) =>
      answer.name.startsWith(_G3Prefix) &&
      Object.keys(_AnswerTypeTranslation).includes(answer.type)
  );
  return {
    ...response,
    answers: g3Addresses
  };
};

// In practice one response comes from one host and contains info about itself,
// though syntactically one response could contain multiple hostnames with their addresses.
const _toG3Adresses = function(response: MDNSResponse): G3Addresses {
  const reducer = (acc: G3Addresses, ans: MDNSAnswer) => {
    const deviceId = /(.+)\.local/.exec(ans.name)[1];
    if (_.isUndefined(acc[deviceId])) {
      acc[deviceId] = {};
    }
    acc[deviceId][_AnswerTypeTranslation[ans.type]] =
      (ans.data as string).replace(_linkLocalIPv6, `$1%${response.rinfo.interface}`);
    return acc;
  };
  return response.answers.reduce(reducer, {});
};

export const G3AddressPoll$ = function(pollingInterval: number): Observable<G3Addresses> {
  return pollMDNS$(_G3ServiceName, pollingInterval).pipe(
    map(_onlyG3Addresses),
    filter((response: MDNSResponse) => response.answers.length > 0),
    map(_toG3Adresses)
  );
};
