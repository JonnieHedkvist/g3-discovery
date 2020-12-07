import { DiscoveryMessage } from './types';
import {foundAndLost$} from './discovery/g3-discovery';

/**
 * Some predefined delays (in milliseconds).
 */
export enum Delays {
  Short = 500,
  Medium = 2000,
  Long = 5000,
}

console.log(new Date(), 'STARTING G3 DISCOVERY!');

foundAndLost$.subscribe({
  next: (msg: DiscoveryMessage) => {
    console.info(new Date(), 'DISCOVERY_MESSAGE_TYPE', msg);
  }
});


