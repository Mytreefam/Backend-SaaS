import { useEffect, useState } from 'react';
import {
  getNetworkStatus,
  subscribeNetworkStatus,
  type NetworkStatus,
} from '../stores/networkStatus.store';

export function useNetworkStatus(): NetworkStatus {
  const [s, setS] = useState<NetworkStatus>(() => getNetworkStatus());

  useEffect(() => {
    return subscribeNetworkStatus(setS);
  }, []);

  return s;
}

