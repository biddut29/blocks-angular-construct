// ─── Task Manager Models ───────────────────────────────────────────────────────
// Mirrors: src/modules/task-manager/types/ in React project

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Assignee {
  userId: string;
  name: string;
  avatarUrl?: string;
}

export interface TaskSection {
  SectionId: string;
  Title: string;
  Order: number;
}

export interface TaskItem {
  ItemId: string;
  Title: string;
  Description?: string;
  Priority: TaskPriority;
  Status?: string;
  Section: string;
  DueDate?: string;
  Assignee?: Assignee[];
  Tags?: string[];
  IsCompleted: boolean;
  Order?: number;
}

export interface CreateTaskInput {
  Title: string;
  Description?: string;
  Priority: TaskPriority;
  Section: string;
  DueDate?: string;
  Assignee?: Assignee[];
  Tags?: string[];
}

export type UpdateTaskInput = Partial<CreateTaskInput & { IsCompleted: boolean }>;
