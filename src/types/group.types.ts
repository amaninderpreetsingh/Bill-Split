export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  memberIds: string[];
  pendingInvites?: string[]; // Emails of users who have been invited but haven't joined
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  invitedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
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
