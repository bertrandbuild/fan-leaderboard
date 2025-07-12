export type Theme = 'dark' | 'light' | 'system';

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  stats: {
    messages: number;
    users: number;
    uptime: string;
  };
  statusColor: string;
  details: {
    persona: string;
    systemPrompt: string;
    triggers: any[];
    tools: any[];
  };
} 