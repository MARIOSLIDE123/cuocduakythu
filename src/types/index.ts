export interface Student {
  id: string;
  name: string;
  className?: string;
  horseNumber: number;
  horseColor: string;
  horseSecondaryColor?: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  racesWon: number;
}

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string]; // Exactly 4 options A, B, C, D
  correctAnswer: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation?: string;
  points: number;
  subject?: string;
}

export interface GameSettings {
  gameTitle: string;
  className: string;
  teacherName: string;
  totalQuestions: number;
  raceSpeed: 'slow' | 'normal' | 'fast'; // slow: ~10s, normal: ~7s, fast: ~4.5s
  thinkingTime: number; // 0 = unlimited, or 10, 15, 20, 30, 45, 60
  questionMode: 'random' | 'sequential';
  answerMode: 'revealAndContinue' | 'retry' | 'skipOnWrong';
  shuffleOptions: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  laneDisplayMode: 'auto' | 'standard' | 'compact';
}

export type GamePhase =
  | 'LOBBY'
  | 'SETUP'
  | 'STUDENTS'
  | 'QUESTIONS'
  | 'RACE_READY'
  | 'RACE_COUNTDOWN'
  | 'RACING'
  | 'WINNER_REVEAL'
  | 'QUESTION_ACTIVE'
  | 'ANSWER_RESULT'
  | 'LEADERBOARD_ROUND'
  | 'GAME_FINISH';

export interface RaceHorseProgress {
  studentId: string;
  progress: number; // 0 to 100
  speed: number;
  boostTimer: number;
  laneIndex: number;
}

export interface RoundResult {
  roundNumber: number;
  winnerStudentId: string;
  winnerStudentName: string;
  questionId: string;
  questionText: string;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsAwarded: number;
  timestamp: string;
}

export const HORSE_COLORS = [
  { name: 'Xanh Lam', main: '#2563EB', sub: '#60A5FA', border: '#1D4ED8', text: '#FFFFFF' },
  { name: 'Đỏ Ruby', main: '#DC2626', sub: '#F87171', border: '#B91C1C', text: '#FFFFFF' },
  { name: 'Xanh Lá Ngọc', main: '#059669', sub: '#34D399', border: '#047857', text: '#FFFFFF' },
  { name: 'Vàng Hoàng Kim', main: '#D97706', sub: '#FBBF24', border: '#B45309', text: '#FFFFFF' },
  { name: 'Tím Hoàng Gia', main: '#7C3AED', sub: '#A78BFA', border: '#6D28D9', text: '#FFFFFF' },
  { name: 'Cam Năng Lượng', main: '#EA580C', sub: '#FB923C', border: '#C2410C', text: '#FFFFFF' },
  { name: 'Hồng Fuchsia', main: '#DB2777', sub: '#F472B6', border: '#BE185D', text: '#FFFFFF' },
  { name: 'Xanh Cyan', main: '#0891B2', sub: '#22D3EE', border: '#0E7490', text: '#FFFFFF' },
  { name: 'Xanh Rêu Neon', main: '#65A30D', sub: '#A3E635', border: '#4D7C0F', text: '#FFFFFF' },
  { name: 'Tím Indigo', main: '#4F46E5', sub: '#818CF8', border: '#3730A3', text: '#FFFFFF' },
  { name: 'Nâu Đồng', main: '#92400E', sub: '#D97706', border: '#78350F', text: '#FFFFFF' },
  { name: 'Đỏ Magenta', main: '#9333EA', sub: '#C084FC', border: '#7E22CE', text: '#FFFFFF' },
];
