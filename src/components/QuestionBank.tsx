import React, { useState, useRef } from 'react';
import {
  HelpCircle,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  Search,
  BookOpen,
  Sparkles,
  AlertCircle,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Question } from '../types';
import {
  downloadQuestionTemplate,
  parseQuestionExcel,
  exportQuestionsToExcel,
} from '../utils/excelHelper';
import { sound } from '../utils/soundEngine';

interface QuestionBankProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  questions,
  onUpdateQuestions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit/Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Form State
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState<[string, string, string, string]>([
    '',
    '',
    '',
    '',
  ]);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formPoints, setFormPoints] = useState<number>(10);
  const [formSubject, setFormSubject] = useState('Toán học 9');

  // Handle Excel Upload
  const handleFileUpload = async (file: File) => {
    try {
      setErrorMessage(null);
      const parsedQuestions = await parseQuestionExcel(file);
      onUpdateQuestions(parsedQuestions);
      setSuccessMessage(`✅ Đã nhập thành công ${parsedQuestions.length} câu hỏi từ file Excel!`);
      sound.playCorrect();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đọc file Excel câu hỏi!';
      setErrorMessage(msg);
      sound.playWrong();
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setCurrentEditId(null);
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrectAnswer(0);
    setFormExplanation('');
    setFormPoints(10);
    setFormSubject('Toán học 9');
    setIsModalOpen(true);
    sound.playClick();
  };

  // Open Edit Modal
  const openEditModal = (q: Question) => {
    setModalMode('edit');
    setCurrentEditId(q.id);
    setFormQuestion(q.question);
    setFormOptions([...q.options]);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || 10);
    setFormSubject(q.subject || 'Chung');
    setIsModalOpen(true);
    sound.playClick();
  };

  // Duplicate Question
  const handleDuplicate = (q: Question) => {
    const duplicated: Question = {
      ...q,
      id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: `${q.question} (Bản sao)`,
    };
    onUpdateQuestions([...questions, duplicated]);
    sound.playClick();
  };

  // Delete Question
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      onUpdateQuestions(questions.filter((q) => q.id !== id));
      sound.playClick();
    }
  };

  // Save Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formOptions[0].trim() || !formOptions[1].trim()) {
      alert('Vui lòng nhập nội dung câu hỏi và ít nhất 2 đáp án A, B!');
      return;
    }

    if (modalMode === 'create') {
      const newQuestion: Question = {
        id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        question: formQuestion.trim(),
        options: [
          formOptions[0].trim() || 'Phương án A',
          formOptions[1].trim() || 'Phương án B',
          formOptions[2].trim() || 'Phương án C',
          formOptions[3].trim() || 'Phương án D',
        ],
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation.trim() || undefined,
        points: Number(formPoints) || 10,
        subject: formSubject.trim() || 'Chung',
      };
      onUpdateQuestions([...questions, newQuestion]);
    } else if (currentEditId) {
      const updated = questions.map((q) =>
        q.id === currentEditId
          ? {
              ...q,
              question: formQuestion.trim(),
              options: [
                formOptions[0].trim() || 'Phương án A',
                formOptions[1].trim() || 'Phương án B',
                formOptions[2].trim() || 'Phương án C',
                formOptions[3].trim() || 'Phương án D',
              ] as [string, string, string, string],
              correctAnswer: formCorrectAnswer,
              explanation: formExplanation.trim() || undefined,
              points: Number(formPoints) || 10,
              subject: formSubject.trim() || 'Chung',
            }
          : q
      );
      onUpdateQuestions(updated);
    }

    setIsModalOpen(false);
    sound.playCorrect();
  };

  // Subjects List
  const subjects = Array.from(new Set(questions.map((q) => q.subject || 'Chung')));

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.options.some((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchSubject = selectedSubject === 'all' || (q.subject || 'Chung') === selectedSubject;
    return matchSearch && matchSubject;
  });

  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionColors = ['bg-blue-600', 'bg-amber-600', 'bg-emerald-600', 'bg-purple-600'];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📚</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              NGÂN HÀNG CÂU HỎI TRẮC NGHIỆM
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Quản lý, thêm mới hoặc import bộ đề trắc nghiệm từ Excel để thi đấu trong game.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM CÂU HỎI</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Nhập từ file Excel"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Excel</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".xlsx, .xls"
            className="hidden"
          />

          <button
            onClick={() => {
              sound.playClick();
              exportQuestionsToExcel(questions);
            }}
            disabled={questions.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
            title="Xuất câu hỏi ra file Excel"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              downloadQuestionTemplate();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Tải file Excel câu hỏi mẫu"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>File mẫu</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi hoặc đáp án..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Chủ đề:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-400"
          >
            <option value="all">Tất cả môn / chủ đề ({questions.length})</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-slate-300 mb-1">
              Không tìm thấy câu hỏi nào phù hợp
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Hãy thêm câu hỏi mới hoặc điều chỉnh bộ lọc tìm kiếm.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-500"
            >
              + Thêm câu hỏi ngay
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-extrabold">
                    Câu #{idx + 1}
                  </span>
                  {q.subject && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                      {q.subject}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                    +{q.points || 10} điểm
                  </span>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Nhân bản câu hỏi"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug">
                {q.question}
              </h3>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctAnswer;
                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                          isCorrect ? 'bg-emerald-600' : optionColors[optIdx]
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </div>
                      <span className="text-sm font-medium flex-1">{opt}</span>
                      {isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation (if provided) */}
              {q.explanation && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">💡 Lời giải:</span>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <span>{modalMode === 'create' ? 'THÊM CÂU HỎI MỚI' : 'CHỈNH SỬA CÂU HỎI'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Nội dung câu hỏi:
                </label>
                <textarea
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  4 Phương án trả lời (chọn nút radio ở phương án đúng):
                </label>
                {optionLetters.map((letter, idx) => (
                  <div
                    key={letter}
                    className={`flex items-center gap-3 p-2 rounded-xl border ${
                      formCorrectAnswer === idx
                        ? 'bg-emerald-950/30 border-emerald-500/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formCorrectAnswer === idx}
                        onChange={() => setFormCorrectAnswer(idx)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white ${optionColors[idx]}`}
                      >
                        {letter}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formOptions[idx]}
                      onChange={(e) => {
                        const newOpts = [...formOptions] as [string, string, string, string];
                        newOpts[idx] = e.target.value;
                        setFormOptions(newOpts);
                      }}
                      placeholder={`Nội dung phương án ${letter}...`}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                      required={idx < 2}
                    />
                  </div>
                ))}
              </div>

              {/* Subject & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Môn / Chủ đề:
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="VD: Toán học 9, Hình học, ..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Điểm thưởng (+điểm):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Giải thích chi tiết (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Giải thích lý do chọn đáp án đúng..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{modalMode === 'create' ? 'Tạo câu hỏi' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
