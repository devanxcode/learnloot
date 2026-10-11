export interface Subject {
  id: string;
  name: string;
  color: string;
  target_hours: number;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

export interface StudyLog {
  id: string;
  subject_id: string;
  chapter_id?: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  notes?: string;
  xp_awarded?: number;
}

export interface RedemptionItem {
  id: string;
  xp_spent: number;
  rupee_value: number;
  payout_method: string;
  destination: string;
  date: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  daily_goal_hours: number;
  weekly_goal_hours: number;
}
