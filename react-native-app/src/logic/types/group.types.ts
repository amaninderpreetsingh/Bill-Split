export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberIds: string[];
}

export interface GroupTransaction {
  id: string;
  groupId: string;
  billData: {
    items: Array<{ id: string; name: string; price: number }>;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
  };
  itemAssignments: Record<string, string[]>;
  personTotals: Record<string, number>;
  createdAt: Date;
  createdBy: string;
}
