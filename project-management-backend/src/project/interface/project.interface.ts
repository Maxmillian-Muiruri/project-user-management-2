export interface Project {
  id?: string;
  title: string;
  description: string;
  duedate: Date;
  completed?: boolean;
  assignedUserId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
