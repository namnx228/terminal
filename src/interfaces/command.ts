export interface Command {
  command: string;
  outputs: string[];
  type?: string; // Add optional type field for special states like loading
}
