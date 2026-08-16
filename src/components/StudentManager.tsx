import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Shuffle,
  Users,
  Edit2,
  Check,
  X,
  AlertCircle,
  Play,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Student, HORSE_COLORS } from '../types';
import { downloadStudentTemplate, parseStudentExcel } from '../utils/excelHelper';
import { Horse } from './Horse';
import { sound } from '../utils/soundEngine';

interface StudentManagerProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  onConfirmAndPlay: () => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onUpdateStudents,
  onConfirmAndPlay,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('');
  const [showColorPickerId, setShowColorPickerId] = useState<string | null>(null);

  // New manual student state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');

  // Handle Excel Upload
  const handleFileUpload = async (file: File) => {
    try {
      setErrorMessage(null);
      const parsedStudents = await parseStudentExcel(file);
      onUpdateStudents(parsedStudents);
      setSuccessMessage(`✅ Đã nhập thành công ${parsedStudents.length} học sinh từ file Excel!`);
      sound.playCorrect();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đọc file Excel!';
      setErrorMessage(msg);
      sound.playWrong();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Add Single Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const horseNum = students.length + 1;
    const colorObj = HORSE_COLORS[(horseNum - 1) % HORSE_COLORS.length];

    const newStudent: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newStudentName.trim(),
      className: newStudentClass.trim() || undefined,
      horseNumber: horseNum,
      horseColor: colorObj.main,
      horseSecondaryColor: colorObj.sub,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      racesWon: 0,
    };

    onUpdateStudents([...students, newStudent]);
    setNewStudentName('');
    setNewStudentClass('');
    sound.playClick();
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    const updated = students
      .filter((s) => s.id !== id)
      .map((s, index) => ({
        ...s,
        horseNumber: index + 1,
      }));
    onUpdateStudents(updated);
    sound.playClick();
  };

  // Clear All
  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách học sinh?')) {
      onUpdateStudents([]);
      sound.playClick();
    }
  };

  // Shuffle Horse Numbers & Colors
  const handleShuffleHorses = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const updated = shuffled.map((s, index) => {
      const colorObj = HORSE_COLORS[index % HORSE_COLORS.length];
      return {
        ...s,
        horseNumber: index + 1,
        horseColor: colorObj.main,
        horseSecondaryColor: colorObj.sub,
      };
    });
    onUpdateStudents(updated);
    sound.playClick();
  };

  // Start Inline Editing
  const startEditing = (s: Student) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditClass(s.className || '');
  };

  // Save Inline Editing
  const saveEditing = (id: string) => {
    if (!editName.trim()) return;
    const updated = students.map((s) =>
      s.id === id ? { ...s, name: editName.trim(), className: editClass.trim() || undefined } : s
    );
    onUpdateStudents(updated);
    setEditingId(null);
    sound.playClick();
  };

  // Change Horse Color
  const handleSelectColor = (studentId: string, colorHex: string) => {
    const updated = students.map((s) =>
      s.id === studentId ? { ...s, horseColor: colorHex } : s
    );
    onUpdateStudents(updated);
    setShowColorPickerId(null);
    sound.playClick();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👥</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              QUẢN LÝ DANH SÁCH HỌC SINH
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Tải lên file Excel lớp học hoặc thêm thủ công. Mỗi học sinh được gán tự động với 1 chú ngựa.
          </p>
        </div>

        {/* Action button: Start Playing */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              onConfirmAndPlay();
            }}
            disabled={students.length === 0}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>XÁC NHẬN & BẮT ĐẦU ĐUA</span>
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Excel Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-2 border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-500'
          }`}
        >
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
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-1">
            Kéo thả hoặc nhấn để chọn file Excel danh sách học sinh
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            Hỗ trợ định dạng .xlsx, .xls. Cột bắt buộc: <strong>Họ và tên</strong> (hoặc Tên học sinh), tùy chọn: <strong>Lớp</strong>.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all">
            <Upload className="w-4 h-4" />
            <span>Chọn file từ máy tính</span>
          </div>
        </div>

        {/* Template & Quick Helper */}
        <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/80 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              File Excel Mẫu
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Tải file mẫu chuẩn với cấu trúc STT, Họ và tên, Lớp để điền nhanh danh sách học sinh lớp bạn.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                sound.playClick();
                downloadStudentTemplate();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>TẢI FILE EXCEL MẪU (.XLSX)</span>
            </button>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-400">
              💡 <strong>Mẹo:</strong> App tự động hỗ trợ từ 5 đến 50+ học sinh và tự động chia làn, chỉnh cỡ ngựa vừa vặn.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 mb-6">
        <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Nhập họ và tên học sinh (ví dụ: Nguyễn Hoàng Long)..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div className="w-full sm:w-36">
            <input
              type="text"
              placeholder="Lớp (vd: 9A1)"
              value={newStudentClass}
              onChange={(e) => setNewStudentClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={!newStudentName.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </form>
      </div>

      {/* Student List Preview Header */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black">
              Tổng số: {students.length} học sinh
            </div>
            {students.length > 0 && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                (Đã gán từ Ngựa 01 đến Ngựa {String(students.length).padStart(2, '0')})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffleHorses}
              disabled={students.length < 2}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 disabled:opacity-40 transition-all cursor-pointer"
              title="Xáo trộn lại mã số và màu ngựa"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Xáo mã ngựa</span>
            </button>
            <button
              onClick={handleClearAll}
              disabled={students.length === 0}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold flex items-center gap-1.5 border border-red-800/40 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        </div>

        {/* Students Table / Grid */}
        {students.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-3">
              🏇
            </div>
            <h4 className="text-base font-bold text-slate-300 mb-1">Chưa có học sinh nào</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Hãy tải lên file Excel hoặc nhập tên học sinh vào ô bên trên để bắt đầu cuộc đua.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/70 text-slate-400 sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">STT</th>
                  <th className="px-4 py-3 w-28">Mã Ngựa</th>
                  <th className="px-4 py-3 w-32">Avatar Ngựa</th>
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-4 py-3 w-24">Lớp</th>
                  <th className="px-4 py-3 w-32 text-center">Điểm / Thắng</th>
                  <th className="px-4 py-3 w-28 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-center text-slate-400 text-xs">
                      {idx + 1}
                    </td>

                    {/* Horse Number Badge */}
                    <td className="px-4 py-3 font-bold">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black text-white border shadow-sm"
                        style={{
                          backgroundColor: student.horseColor,
                          borderColor: 'rgba(255,255,255,0.3)',
                        }}
                      >
                        🐎 Ngựa {String(student.horseNumber).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Animated Horse Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 relative">
                        <Horse number={student.horseNumber} color={student.horseColor} size="sm" />
                        <button
                          onClick={() =>
                            setShowColorPickerId(
                              showColorPickerId === student.id ? null : student.id
                            )
                          }
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Đổi màu ngựa"
                        >
                          <Palette className="w-3.5 h-3.5" />
                        </button>

                        {/* Color Picker Dropdown */}
                        {showColorPickerId === student.id && (
                          <div className="absolute left-16 top-0 z-30 p-2 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl grid grid-cols-4 gap-1.5 w-44">
                            {HORSE_COLORS.map((c) => (
                              <button
                                key={c.main}
                                onClick={() => handleSelectColor(student.id, c.main)}
                                className="w-8 h-8 rounded-lg border-2 border-white/20 hover:scale-110 transition-transform shadow"
                                style={{ backgroundColor: c.main }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Student Name (Inline editable) */}
                    <td className="px-4 py-3 font-semibold text-white">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2 py-1 bg-slate-950 rounded border border-amber-400 text-white text-sm w-full"
                          autoFocus
                        />
                      ) : (
                        <span>{student.name}</span>
                      )}
                    </td>

                    {/* Class Name */}
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editClass}
                          onChange={(e) => setEditClass(e.target.value)}
                          className="px-2 py-1 bg-slate-950 rounded border border-slate-700 text-white text-xs w-20"
                        />
                      ) : (
                        <span>{student.className || '—'}</span>
                      )}
                    </td>

                    {/* Stats (Score / Wins) */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-amber-400 font-bold text-xs">{student.score} đ</span>
                      <span className="text-slate-500 text-[10px] ml-1">({student.racesWon} 🏆)</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId === student.id ? (
                          <>
                            <button
                              onClick={() => saveEditing(student.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Lưu"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(student)}
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1.5 rounded-lg hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                              title="Xóa học sinh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
