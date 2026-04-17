export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate: number;
  dateString: string;
  completed: boolean;
  userId: string;
}