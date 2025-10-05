export interface Person {
  id: string;
  name: string;
}

export interface PersonTotal {
  personId: string;
  name: string;
  itemsSubtotal: number;
  tax: number;
  tip: number;
  total: number;
}
