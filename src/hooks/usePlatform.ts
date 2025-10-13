import { Capacitor } from '@capacitor/core';

/**
 * Hook to detect the current platform
 * @returns Platform information and helper functions
 */
export function usePlatform() {
  const platform = Capacitor.getPlatform(); // 'web', 'ios', or 'android'
  const isNative = Capacitor.isNativePlatform();
  const isWeb = platform === 'web';
  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';

  return {
    platform,
    isNative,
    isWeb,
    isIOS,
    isAndroid,
  };
}
