import * as XLSX from 'xlsx';
import { Student, Question, HORSE_COLORS, RoundResult } from '../types';

/**
 * Generate and download Sample Student Template Excel
 */
export function downloadStudentTemplate() {
  const data = [
    { 'STT': 1, 'Họ và tên': 'Nguyễn Văn An', 'Lớp': '9A1' },
    { 'STT': 2, 'Họ và tên': 'Trần Thị Bình', 'Lớp': '9A1' },
    { 'STT': 3, 'Họ và tên': 'Lê Minh Anh', 'Lớp': '9A1' },
    { 'STT': 4, 'Họ và tên': 'Phạm Quốc Bảo', 'Lớp': '9A1' },
    { 'STT': 5, 'Họ và tên': 'Võ Hoàng Nam', 'Lớp': '9A1' },
    { 'STT': 6, 'Họ và tên': 'Đặng Ngọc Mai', 'Lớp': '9A1' },
    { 'STT': 7, 'Họ và tên': 'Bùi Tuấn Kiệt', 'Lớp': '9A1' },
    { 'STT': 8, 'Họ và tên': 'Hoàng Khánh Linh', 'Lớp': '9A1' },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học sinh');
  XLSX.writeFile(wb, 'danh_sach_hoc_sinh_mau.xlsx');
}

/**
 * Generate and download Sample Question Bank Template Excel
 */
export function downloadQuestionTemplate() {
  const data = [
    {
      'Mã': 1,
      'Câu hỏi': 'Căn bậc hai số học của 81 là bao nhiêu?',
      'Đáp án A': '9',
      'Đáp án B': '-9',
      'Đáp án C': '±9',
      'Đáp án D': '81',
      'Đáp án đúng': 'A',
      'Giải thích': 'Căn bậc hai số học của số dương a là số không âm x sao cho x² = a. Với 81 là 9.',
      'Điểm': 10,
      'Môn/Chủ đề': 'Toán học 9'
    },
    {
      'Mã': 2,
      'Câu hỏi': 'Cho tam giác vuông ABC vuông tại A có AB = 6cm, AC = 8cm. Cạnh BC bằng:',
      'Đáp án A': '10 cm',
      'Đáp án B': '12 cm',
      'Đáp án C': '14 cm',
      'Đáp án D': '√14 cm',
      'Đáp án đúng': 'A',
      'Giải thích': 'Theo Pythagore: BC² = 6² + 8² = 100 => BC = 10 cm.',
      'Điểm': 10,
      'Môn/Chủ đề': 'Hình học 9'
    },
    {
      'Mã': 3,
      'Câu hỏi': 'Hàm số bậc nhất y = (m - 2)x + 3 đồng biến trên R khi:',
      'Đáp án A': 'm > 2',
      'Đáp án B': 'm < 2',
      'Đáp án C': 'm ≥ 2',
      'Đáp án D': 'm ≠ 2',
      'Đáp án đúng': 'A',
      'Giải thích': 'Đồng biến khi hệ số a > 0 <=> m - 2 > 0 <=> m > 2.',
      'Điểm': 10,
      'Môn/Chủ đề': 'Đại số 9'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 45 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 14 },
    { wch: 45 },
    { wch: 8 },
    { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ngân hàng câu hỏi');
  XLSX.writeFile(wb, 'ngan_hang_cau_hoi_mau.xlsx');
}

/**
 * Parse Excel file containing Student list
 */
export async function parseStudentExcel(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON array
        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel không có dữ liệu hoặc định dạng rỗng!');
        }

        const students: Student[] = [];

        rawRows.forEach((row, index) => {
          // Normalize keys
          const normalized: Record<string, string> = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            normalized[cleanKey] = String(row[key]).trim();
          });

          // Find student name column
          let name = '';
          const possibleNameKeys = ['ho va ten', 'ho ten', 'ten hoc sinh', 'name', 'full name', 'hoc sinh', 'ten'];
          for (const k of possibleNameKeys) {
            if (normalized[k]) {
              name = normalized[k];
              break;
            }
          }

          // If not found by key, check values
          if (!name) {
            const values = Object.values(row).map(v => String(v).trim()).filter(Boolean);
            // Look for non-number string that is likely a name
            const candidate = values.find(v => isNaN(Number(v)) && v.length > 2 && !v.toLowerCase().includes('lớp'));
            if (candidate) name = candidate;
          }

          if (name && name.toLowerCase() !== 'họ và tên' && name.toLowerCase() !== 'tên học sinh') {
            // Find class name
            let className = '';
            const possibleClassKeys = ['lop', 'class', 'ten lop', 'khoi'];
            for (const k of possibleClassKeys) {
              if (normalized[k]) {
                className = normalized[k];
                break;
              }
            }

            const horseNumber = students.length + 1;
            const colorObj = HORSE_COLORS[(horseNumber - 1) % HORSE_COLORS.length];

            students.push({
              id: `student-${Date.now()}-${horseNumber}-${Math.random().toString(36).substr(2, 4)}`,
              name,
              className: className || undefined,
              horseNumber,
              horseColor: colorObj.main,
              horseSecondaryColor: colorObj.sub,
              score: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              racesWon: 0,
            });
          }
        });

        if (students.length === 0) {
          throw new Error('Không tìm thấy danh sách tên học sinh hợp lệ trong file!');
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Lỗi khi đọc file Excel'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse Excel file containing Question bank
 */
export async function parseQuestionExcel(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel rỗng hoặc không có dữ liệu!');
        }

        const questions: Question[] = [];

        rawRows.forEach((row, idx) => {
          // Normalize keys
          const norm: Record<string, string> = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            norm[cleanKey] = String(row[key]).trim();
          });

          // Question prompt
          let questionText = '';
          const questionKeys = ['cau hoi', 'noi dung cau hoi', 'question', 'noi dung', 'cau'];
          for (const k of questionKeys) {
            if (norm[k]) {
              questionText = norm[k];
              break;
            }
          }

          // Options A, B, C, D
          let optA = norm['dap an a'] || norm['a'] || norm['lua chon a'] || norm['option a'] || '';
          let optB = norm['dap an b'] || norm['b'] || norm['lua chon b'] || norm['option b'] || '';
          let optC = norm['dap an c'] || norm['c'] || norm['lua chon c'] || norm['option c'] || '';
          let optD = norm['dap an d'] || norm['d'] || norm['lua chon d'] || norm['option d'] || '';

          // Correct answer
          const rawCorrect = norm['dap an dung'] || norm['dap an'] || norm['correct'] || norm['dap an chinh xac'] || 'A';
          let correctIdx = 0;
          const cleanCorrect = rawCorrect.toUpperCase().trim();
          if (cleanCorrect === 'B' || cleanCorrect === '2' || cleanCorrect === optB.toUpperCase()) correctIdx = 1;
          else if (cleanCorrect === 'C' || cleanCorrect === '3' || cleanCorrect === optC.toUpperCase()) correctIdx = 2;
          else if (cleanCorrect === 'D' || cleanCorrect === '4' || cleanCorrect === optD.toUpperCase()) correctIdx = 3;
          else correctIdx = 0;

          // Explanation & points & subject
          const explanation = norm['giai thich'] || norm['loi giai'] || norm['explanation'] || '';
          const points = Number(norm['diem'] || norm['points']) || 10;
          const subject = norm['mon/chu de'] || norm['mon'] || norm['chu de'] || norm['subject'] || 'Chung';

          if (questionText && optA) {
            // Fill fallbacks for missing options if any
            if (!optB) optB = 'Phương án B';
            if (!optC) optC = 'Phương án C';
            if (!optD) optD = 'Phương án D';

            questions.push({
              id: `question-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              question: questionText,
              options: [optA, optB, optC, optD],
              correctAnswer: correctIdx,
              explanation: explanation || undefined,
              points: points > 0 ? points : 10,
              subject: subject || undefined,
            });
          }
        });

        if (questions.length === 0) {
          throw new Error('Không tìm thấy danh sách câu hỏi hợp lệ trong file!');
        }

        resolve(questions);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Lỗi khi đọc file Excel'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export full Question Bank to Excel file
 */
export function exportQuestionsToExcel(questions: Question[]) {
  const letters = ['A', 'B', 'C', 'D'];
  const data = questions.map((q, idx) => ({
    'STT': idx + 1,
    'Môn/Chủ đề': q.subject || 'Chung',
    'Câu hỏi': q.question,
    'Đáp án A': q.options[0],
    'Đáp án B': q.options[1],
    'Đáp án C': q.options[2],
    'Đáp án D': q.options[3],
    'Đáp án đúng': letters[q.correctAnswer] || 'A',
    'Giải thích': q.explanation || '',
    'Điểm': q.points || 10,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 45 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 12 },
    { wch: 40 },
    { wch: 8 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ngân hàng câu hỏi');
  XLSX.writeFile(wb, `ngan_hang_cau_hoi_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Game Results to Excel file
 */
export function exportGameResultsToExcel(
  students: Student[],
  history: RoundResult[],
  gameTitle: string,
  className: string
) {
  // Sort students by score descending
  const sortedStudents = [...students].sort((a, b) => b.score - a.score || b.correctAnswers - a.correctAnswers);

  const leaderboardData = sortedStudents.map((s, idx) => ({
    'Hạng': idx + 1,
    'Mã ngựa': `Ngựa ${String(s.horseNumber).padStart(2, '0')}`,
    'Họ và tên': s.name,
    'Lớp': s.className || className || '9A1',
    'Tổng điểm': s.score,
    'Số lần thắng đua': s.racesWon,
    'Số câu trả lời đúng': s.correctAnswers,
    'Số câu trả lời sai': s.wrongAnswers,
    'Tỉ lệ chính xác': s.correctAnswers + s.wrongAnswers > 0
      ? `${Math.round((s.correctAnswers / (s.correctAnswers + s.wrongAnswers)) * 100)}%`
      : '0%'
  }));

  const historyData = history.map((h) => ({
    'Vòng thi': `Vòng ${h.roundNumber}`,
    'Học sinh về đích': h.winnerStudentName,
    'Nội dung câu hỏi': h.questionText,
    'Kết quả trả lời': h.isCorrect ? 'ĐÚNG' : 'SAI',
    'Điểm nhận được': h.pointsAwarded,
    'Thời gian': h.timestamp,
  }));

  const wb = XLSX.utils.book_new();

  const wsLeaderboard = XLSX.utils.json_to_sheet(leaderboardData);
  wsLeaderboard['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 28 },
    { wch: 12 },
    { wch: 14 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsLeaderboard, 'Bảng xếp hạng tổng');

  if (historyData.length > 0) {
    const wsHistory = XLSX.utils.json_to_sheet(historyData);
    wsHistory['!cols'] = [
      { wch: 12 },
      { wch: 26 },
      { wch: 50 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, wsHistory, 'Nhật ký các vòng thi');
  }

  XLSX.writeFile(wb, `ket_qua_cuoc_dua_${className || 'lop'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
