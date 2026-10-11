import { Subject, Chapter, StudyLog, UserSettings } from '@/types';

export const initialSubjects: Subject[] = [
  { id: 'sub-phy', name: 'Physics', color: '#60A5FA', target_hours: 50 },
  { id: 'sub-chem', name: 'Chemistry', color: '#F472B6', target_hours: 45 },
  { id: 'sub-math', name: 'Maths', color: '#B8F36B', target_hours: 60 },
  { id: 'sub-cs', name: 'Computer Science', color: '#38BDF8', target_hours: 40 },
  { id: 'sub-eng', name: 'English', color: '#FBBF24', target_hours: 25 },
  { id: 'sub-mal', name: 'Malayalam', color: '#A78BFA', target_hours: 20 },
];

export const initialChapters: Chapter[] = [
  // Physics
  { id: 'ch-phy-1', subject_id: 'sub-phy', name: 'Electrostatics & Potential', completed: false },
  { id: 'ch-phy-2', subject_id: 'sub-phy', name: 'Current Electricity & Circuits', completed: false },
  { id: 'ch-phy-3', subject_id: 'sub-phy', name: 'Electromagnetic Induction & AC', completed: false },
  { id: 'ch-phy-4', subject_id: 'sub-phy', name: 'Ray & Wave Optics', completed: false },

  // Chemistry
  { id: 'ch-chem-1', subject_id: 'sub-chem', name: 'Chemical Kinetics', completed: false },
  { id: 'ch-chem-2', subject_id: 'sub-chem', name: 'Haloalkanes & Haloarenes', completed: false },
  { id: 'ch-chem-3', subject_id: 'sub-chem', name: 'Solutions & Colligative Properties', completed: false },

  // Maths
  { id: 'ch-math-1', subject_id: 'sub-math', name: 'Continuity & Differentiability', completed: false },
  { id: 'ch-math-2', subject_id: 'sub-math', name: 'Definite & Indefinite Integrals', completed: false },
  { id: 'ch-math-3', subject_id: 'sub-math', name: 'Vectors & 3D Geometry', completed: false },

  // Computer Science
  { id: 'ch-cs-1', subject_id: 'sub-cs', name: 'Relational Database Design & SQL', completed: false },
  { id: 'ch-cs-2', subject_id: 'sub-cs', name: 'Data Structures: Stacks & Queues', completed: false },

  // English
  { id: 'ch-eng-1', subject_id: 'sub-eng', name: 'Reading Comprehension Strategies', completed: false },
  { id: 'ch-eng-2', subject_id: 'sub-eng', name: 'Formal Letters & Analytical Essays', completed: false },

  // Malayalam
  { id: 'ch-mal-1', subject_id: 'sub-mal', name: 'Kavitha & Sahithya Vimarshanam', completed: false },
];

export const initialStudyLogs: StudyLog[] = [];

export const initialSettings: UserSettings = {
  theme: 'dark',
  daily_goal_hours: 4,
  weekly_goal_hours: 25,
};
