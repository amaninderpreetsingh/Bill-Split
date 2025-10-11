export interface Squad {
  id: string;
  name: string;
  description?: string;
  members: SquadMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SquadMember {
  name: string;
  venmoId?: string;
}

export interface CreateSquadInput {
  name: string;
  description?: string;
  members: SquadMember[];
}

export interface UpdateSquadInput {
  name?: string;
  description?: string;
  members?: SquadMember[];
}
