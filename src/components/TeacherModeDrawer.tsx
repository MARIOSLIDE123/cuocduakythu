import React, { useState } from 'react';
import {
  X,
  Sliders,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
  Users,
  CheckCircle,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Clock,
} from 'lucide-react';
import { Student, Question, GamePhase, GameSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface TeacherModeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentRound: number;
  totalRounds: number;
  gamePhase: GamePhase;
  settings: GameSettings;
  onForcePickWinner: (student: Student) => void;
  onSkipRound: () => void;
  onResetScores: () => void;
  onResetGame: () => void;
  onResetAllData: () => void;
  onJumpToLeaderboard: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const TeacherModeDrawer: React.FC<TeacherModeDrawerProps> = ({
  isOpen,
  onClose,
  students,
  currentRound,
  totalRounds,
  gamePhase,
  settings,
  onForcePickWinner,
  onSkipRound,
  onResetScores,
  onResetGame,
  onResetAllData,
  onJumpToLeaderboard,
  onUpdateSettings,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  if (!isOpen) return null;

  const handlePickManualWinner = () => {
    if (!selectedStudentId) return;
    const target = students.find((s) => s.id === selectedStudentId);
    if (target) {
      sound.playWinnerFanfare();
      onForcePickWinner(target);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  Bảng Điều Khiển Giáo Viên
                </h3>
                <p className="text-[11px] text-slate-400">
                  {settings.className} • Vòng {currentRound}/{totalRounds}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Round Control & Settings */}
          <div className="space-y-4">
            {/* Thinking Time / Answer Seconds Setting */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Thời gian suy nghĩ trả lời</span>
                </h4>
                <span className="text-xs font-mono font-black text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                  {settings.thinkingTime > 0 ? `${settings.thinkingTime}s` : 'Không giới hạn'}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: '10 giây', value: 10 },
                  { label: '15 giây', value: 15 },
                  { label: '20 giây', value: 20 },
                  { label: '30 giây', value: 30 },
                  { label: '45 giây', value: 45 },
                  { label: '60 giây', value: 60 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onUpdateSettings({ thinkingTime: opt.value });
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.thinkingTime === opt.value
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/50'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom Input & Unlimited */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ thinkingTime: 0 });
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.thinkingTime === 0
                      ? 'bg-indigo-600 text-white shadow-md font-black ring-2 ring-indigo-400/50'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  ♾️ Không giới hạn
                </button>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={settings.thinkingTime > 0 ? settings.thinkingTime : ''}
                    placeholder="Tùy chỉnh"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0) {
                        onUpdateSettings({ thinkingTime: val });
                      }
                    }}
                    className="w-14 bg-transparent text-amber-300 font-mono text-xs font-bold text-center focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">giây</span>
                </div>
              </div>
            </div>

            {/* Manual Winner Intervention */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                ⚡ Can thiệp vòng đua hiện tại
              </h4>

              {/* Manual Winner Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Chỉ định thủ công học sinh về đích:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  >
                    <option value="">-- Chọn học sinh --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        Ngựa {String(s.horseNumber).padStart(2, '0')} - {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handlePickManualWinner}
                    disabled={!selectedStudentId}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Chọn
                  </button>
                </div>
              </div>

              {/* Skip Round */}
              <button
                onClick={() => {
                  sound.playClick();
                  onSkipRound();
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5 text-blue-400" />
                <span>Chuyển sang vòng đua tiếp theo</span>
              </button>
            </div>

            {/* Match Controls */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider">
                🏆 Điều khiển trận đấu
              </h4>

              <button
                onClick={() => {
                  sound.playClick();
                  onJumpToLeaderboard();
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Mở nhanh Bảng Xếp Hạng</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Đặt lại điểm số tất cả học sinh về 0?')) {
                    sound.playClick();
                    onResetScores();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset điểm số học sinh về 0</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Bắt đầu lại trận đấu mới từ Vòng 1?')) {
                    sound.playClick();
                    onResetGame();
                    onClose();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 text-xs font-bold flex items-center justify-center gap-2 border border-orange-800/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                <span>Chơi lại trận đấu mới từ Vòng 1</span>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-2">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Khu vực nhạy cảm</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                Xóa toàn bộ học sinh, câu hỏi tùy chỉnh và đưa app về trạng thái ban đầu.
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'CẢNH BÁO: Thao tác này sẽ xóa toàn bộ dữ liệu học sinh, câu hỏi và điểm số. Bạn có chắc chắn không?'
                    )
                  ) {
                    onResetAllData();
                    onClose();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>XÓA HẾT DỮ LIỆU & RESET APP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Cuộc Đua Kỳ Thú • Hệ thống quản lý lớp học tương tác
          </p>
        </div>
      </div>
    </div>
  );
};
