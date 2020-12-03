import * as _mdnsServer from 'mdns-server';
import {networkInterfaces$} from './network-interface-monitor';
import {
  Observable,
  Subscriber,
  TeardownLogic
} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export interface MDNSResponse {
  answers: MDNSAnswer[];
  rinfo: RemoteInfo;
}

export interface MDNSAnswer {
  name: string; // E.g. '_tobii-g3api._tcp.local'
  type: string; // E.g. 'A', 'AAAA', 'TXT', 'PTR', 'SRV'
  class: number;
  ttl: number; // Time to live in seconds
  flush: boolean;
  data: Buffer | string;
}

// RemoteInfo represents
interface RemoteInfo {
  address: string; // Our own address
  family: 'IPv4' | 'IPv6';
  port: number; // Port receiving request
  size: number;
  interface: string; // E.g. 'en5'
}

const _periodicMDNSquery = function(serviceName: string, pollingInterval: number): Observable<MDNSResponse> {
  return new Observable(function(subscriber: Subscriber<MDNSResponse>) {
    let queryInterval: NodeJS.Timeout;

    const query = function(): void {
      mdnsService.query({
        questions: [{
          name: serviceName,
          type: 'PTR'
        }]
      });
    };

    const mdnsService = _mdnsServer({
      reuseAddr: true, // in case other mdns service is running
      loopback: false, // receive our own mdns messages
      noInit: true // do not initialize on creation
    });

    mdnsService.on('error',
      (err: Error) => subscriber.error(err));
    mdnsService.on('response',
      ({answers}: {answers: MDNSAnswer[]}, rinfo: RemoteInfo) => subscriber.next({answers, rinfo}));
    mdnsService.on('ready',
      () => {
        query();
        queryInterval = setInterval(() => query(), pollingInterval);
      });

    mdnsService.initServer();

    const teardownLogic: TeardownLogic = () => {
      clearInterval(queryInterval);
      mdnsService.destroy();
    };
    return teardownLogic;
  });
};

export const pollMDNS$ = function(serviceName: string, pollingInterval: number): Observable<MDNSResponse> {
  return networkInterfaces$.pipe(
    switchMap(() => _periodicMDNSquery(serviceName, pollingInterval))
  );
};

