
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

export interface Task {
  id: string;
  name: string;
}

export interface WorkerTasks {
  worker: string;
  tasks: Task[];
}
