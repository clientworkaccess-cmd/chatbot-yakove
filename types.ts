
export type Role = 'user' | 'assistant';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  is_approved: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lastUpdated: number;
}

export interface WebhookResponse {
  output?: string;
  text?: string;
  response?: string;
  message?: string;
}

export type TaskStatus = 'pending' | 'done' | 'stuck';

export interface Task {
  id: string;                           // Primary ID (e.g. "11292730872")
  worker?: string;                      // Worker name
  taskno?: string;                      // Task number (e.g. "2")
  name: string;                         // Task name
  dependsOn?: string;                   // Comma-separated task numbers
  canWorkSimultaneously?: string;      // Comma-separated task numbers
  unit?: string;                        // Location
  expectedAssigningDate?: string;
  expectedCompletionDate?: string;
  estimatedHours?: string;
  materialsNeeded?: string;
  status: TaskStatus;
  created_at?: string;
}

export interface WorkerTasks {
  worker: string;
  tasks: Task[];
}
