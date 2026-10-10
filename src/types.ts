export interface Guild {
  id: number | string;
  name: string;
  level: string;
  icon: string;
  note: string;
  status: boolean;
  targetBoss?: string;
  updatedAt?: number;
  lastUpdatedBy?: string;
}

export type StatusFilter = 'all' | 'pending' | 'cleared';
export type NoteFilter = 'all' | 'personal' | 'guild' | 'other';
