import { VenmoCharge } from '@/types';
import { Capacitor } from '@capacitor/core';

export function constructVenmoDeepLink(charge: VenmoCharge): string {
  const encodedNote = encodeURIComponent(charge.note);
  const formattedAmount = charge.amount.toFixed(2);

  return `venmo://paycharge?txn=charge&recipients=${charge.recipientId}&amount=${formattedAmount}&note=${encodedNote}`;
}

export function openVenmoApp(charge: VenmoCharge): void {
  const deepLink = constructVenmoDeepLink(charge);
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    // Mobile: Open in external app using _system
    window.open(deepLink, '_system');
  } else {
    // Web: Use window location
    window.location.href = deepLink;
  }
}

export function isVenmoInstalled(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function getVenmoWebUrl(charge: VenmoCharge): string {
  const encodedNote = encodeURIComponent(charge.note);
  const formattedAmount = charge.amount.toFixed(2);

  return `https://venmo.com/?txn=charge&recipients=${charge.recipientId}&amount=${formattedAmount}&note=${encodedNote}`;
}
