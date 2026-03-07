export enum Category {
  SHORT_STORY = 'Short Story',
  SCRIPT = 'Script',
  NOVEL = 'Novel',
  POEM = 'Poem',
  THOUGHT = 'Random Thought',
}

export interface Work {
  id: string;
  title: string;
  category: Category;
  description: string;
  coverImage?: string; // Data URL
  pdfContent?: string; // Data URL for the PDF
  dateCreated: number;
  isLocked: boolean; // If true, requires login to download/view full
  views?: number;
  downloads?: number;
}

export interface User {
  username: string;
  role: 'admin' | 'user' | 'guest';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}