export interface DiscoveryMessage {
  deviceId: string;
  found: boolean;
  deviceType: string;
  ipAddress: string; // // Will be phased out in favor of "ipv4"
  ipv4: string;
  ipv6: string;
  hostname: string;
  origin: string; // Will be phased out in favor of "address"
  address: string;
  service?: string;
  port: number;
}
