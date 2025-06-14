export interface Project {
  title: string;
  description: string;
  duedate: Date;
  completed?: boolean;
  assignedUserId?: string;
}
