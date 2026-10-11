import { Subject, Chapter, StudyLog, UserSettings } from '@/types';

export const initialSubjects: Subject[] = [];

export const initialChapters: Chapter[] = [];

export const initialStudyLogs: StudyLog[] = [];

export const initialSettings: UserSettings = {
  theme: 'dark',
  daily_goal_hours: 4,
  weekly_goal_hours: 25,
};
