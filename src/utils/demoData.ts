import { Student, Question, GameSettings, HORSE_COLORS } from '../types';

export const DEFAULT_SETTINGS: GameSettings = {
  gameTitle: 'CUỘC ĐUA KỲ THÚ',
  className: 'Lớp Học',
  teacherName: 'Thầy/Cô Giáo',
  totalQuestions: 5,
  raceSpeed: 'normal',
  thinkingTime: 20,
  questionMode: 'sequential',
  answerMode: 'revealAndContinue',
  shuffleOptions: false,
  soundEnabled: true,
  soundVolume: 0.8,
  laneDisplayMode: 'auto',
};

const STUDENT_NAMES: string[] = [
  'Nguyễn Bảo Anh',
  'Nguyễn Gia Bảo',
  'Lê Đức Mạnh Cường',
  'Nguyễn Tiến Đạt',
  'Nguyễn Nhật Hải',
  'Vũ Hoàng Long',
  'Nguyễn Thị Trà My',
  'Nguyễn Ánh Nhi',
  'Phạm Minh Nhi',
  'Phan Phương Nhi',
  'Trần Gia Phú',
  'Nguyễn Minh Quân',
  'Phạm Bảo Trâm',
  'Hoàng Khánh Vy',
  'Đặng Hoàng Gia Hưng',
  'Quán Duy Tiến',
  'Lê Mĩ Linh',
  'Nguyễn Yến Nhi',
  'Lê Anh Tuấn',
  'Nguyễn Nam Anh',
  'Trần Huy Hoàng',
  'Nguyễn Q. Minh Thiên',
  'Nguyễn Thị Hải Yến',
  'Trương Thị Trà My',
  'Trần Ngọc Diệp',
  'Phan Kỷ Nguyên',
  'Bùi Thị Hải Yến',
  'Phan Gia Linh',
  'Nguyễn Khánh Thi',
  'Phạm Quang Dương',
  'Phạm Đức Nhân',
  'Lê Trần Mai Phương',
];

export const INITIAL_STUDENTS: Student[] = STUDENT_NAMES.map((name, index) => {
  const horseNum = index + 1;
  const colorObj = HORSE_COLORS[index % HORSE_COLORS.length];
  return {
    id: `s-${horseNum}`,
    name,
    horseNumber: horseNum,
    horseColor: colorObj.main,
    horseSecondaryColor: colorObj.sub,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    racesWon: 0,
  };
});

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    question: 'Trong một tam giác vuông, cạnh dài nhất được gọi là:',
    options: ['Cạnh góc vuông', 'Cạnh huyền', 'Cạnh đối', 'Cạnh kề'],
    correctAnswer: 1, // B
    explanation: 'Trong tam giác vuông, góc vuông là góc lớn nhất (90°), do đó cạnh đối diện với góc vuông là cạnh huyền và luôn là cạnh có độ dài lớn nhất.',
    points: 10,
    subject: 'Hình học 9 - Lý thuyết',
  },
  {
    id: 'q-2',
    question: 'Trong tam giác vuông có hai cạnh góc vuông lần lượt là b và c, cạnh huyền là a. Hệ thức nào sau đây đúng?',
    options: ['a = b + c', 'a² = b² + c²', 'a² = b² − c²', 'a = b² + c²'],
    correctAnswer: 1, // B
    explanation: 'Theo định lý Pythagore: Bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông (a² = b² + c²).',
    points: 10,
    subject: 'Hình học 9 - Định lý Pythagore',
  },
  {
    id: 'q-3',
    question: 'Một tam giác vuông có hai cạnh góc vuông dài 6 cm và 8 cm. Cạnh huyền dài bao nhiêu?',
    options: ['9 cm', '10 cm', '12 cm', '14 cm'],
    correctAnswer: 1, // B
    explanation: 'Áp dụng định lý Pythagore: a² = 6² + 8² = 36 + 64 = 100 => Cạnh huyền a = √100 = 10 cm.',
    points: 10,
    subject: 'Hình học 9 - Thực hành',
  },
  {
    id: 'q-4',
    question: 'Một tam giác vuông có cạnh huyền dài 13 cm, một cạnh góc vuông dài 5 cm. Cạnh góc vuông còn lại dài:',
    options: ['8 cm', '10 cm', '12 cm', '14 cm'],
    correctAnswer: 2, // C
    explanation: 'Gọi cạnh góc vuông còn lại là b: b² = 13² − 5² = 169 − 25 = 144 => b = √144 = 12 cm.',
    points: 10,
    subject: 'Hình học 9 - Thực hành',
  },
  {
    id: 'q-5',
    question: 'Một tam giác vuông có cạnh huyền dài 10 cm, một cạnh góc vuông dài 6 cm. Cạnh góc vuông còn lại dài:',
    options: ['4 cm', '6 cm', '8 cm', '9 cm'],
    correctAnswer: 2, // C
    explanation: 'Gọi cạnh góc vuông còn lại là c: c² = 10² − 6² = 100 − 36 = 64 => c = √64 = 8 cm.',
    points: 10,
    subject: 'Hình học 9 - Thực hành',
  },
];
