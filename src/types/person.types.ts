export interface Person {
  id: string;
  name: string;
  venmoId?: string;
}

export interface PersonTotal {
  personId: string;
  name: string;
  itemsSubtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  venmoId?: string;
}

export interface VenmoCharge {
  recipientId: string;
  recipientName: string;
  amount: number;
  note: string;
}
