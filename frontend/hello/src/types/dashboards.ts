export interface SubjectClearance {
  id: string;
  label: string;
  instructor: string;
  deadline: string;
  status: 'Cleared' | 'Pending' | 'Overdue';
}

export interface StudentProfile {
  name: string
  gradeSection: string
  schoolYear: string
  progressPercentage: number
}