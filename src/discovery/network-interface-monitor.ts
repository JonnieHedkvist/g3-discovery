import {
  NetworkInterfaceInfo,
  networkInterfaces
} from 'os';
import * as _ from 'lodash';
import {
  Observable,
  timer
} from 'rxjs';
import {
  // distinctUntilChanged,
  map,
  share
} from 'rxjs/operators';

export interface MultiNetworkInterfaceInfo {
  [interfaceName: string]: NetworkInterfaceInfo[];
}

export const networkInterfaces$: Observable<MultiNetworkInterfaceInfo> = timer(0, 1000).pipe(
  map(() => networkInterfaces()),
  // distinctUntilChanged(_.isEqual),
  share()
);
