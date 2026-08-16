import React, { useState } from 'react';
import {
  Settings,
  Save,
  Play,
  Clock,
  Gauge,
  HelpCircle,
  Users,
  CheckCircle,
  LayoutGrid,
  Volume2,
} from 'lucide-react';
import { GameSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface GameSetupProps {
  settings: GameSettings;
  studentsCount: number;
  questionsCount: number;
  onSaveSettings: (newSettings: GameSettings) => void;
  onStartGame: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({
  settings,
  studentsCount,
  questionsCount,
  onSaveSettings,
  onStartGame,
}) => {
  const [formData, setFormData] = useState<GameSettings>({ ...settings });
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedAlert(true);
    sound.playCorrect();
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const questionCountOptions = [5, 10, 15, 20, 30, 40, 50];
  const thinkingTimeOptions = [
    { label: '10 giây', value: 10 },
    { label: '15 giây', value: 15 },
    { label: '20 giây', value: 20 },
    { label: '30 giây', value: 30 },
    { label: '45 giây', value: 45 },
    { label: 'Không giới hạn', value: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              CÀI ĐẶT THIẾT LẬP TRÒ CHƠI
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Tùy chỉnh thông số trận đấu, tốc độ đua ngựa, thời gian trả lời và luật thi.
          </p>
        </div>

        {/* Quick Start Button */}
        <button
          onClick={() => {
            sound.playClick();
            onSaveSettings(formData);
            onStartGame();
          }}
          disabled={studentsCount === 0 || questionsCount === 0}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-40 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>BẮT ĐẦU ĐUA NGAY</span>
        </button>
      </div>

      {savedAlert && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Đã lưu thành công cấu hình trò chơi!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Class and Teacher Info */}
        <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Thông tin Lớp học & Giáo viên</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                Tên trò chơi:
              </label>
              <input
                type="text"
                value={formData.gameTitle}
                onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                Tên lớp học:
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="VD: Lớp 9A1"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                Tên giáo viên:
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="VD: Thầy Nam"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Race & Question Parameters */}
        <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-base font-extrabold text-blue-400 uppercase tracking-wide flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span>Thông số Vòng Đua & Câu hỏi</span>
          </h3>

          {/* Number of Questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase">
                Số lượng câu hỏi trong mỗi trận đấu:
              </label>
              <span className="text-xs text-slate-400">
                (Hiện có {questionsCount} câu trong ngân hàng)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {questionCountOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setFormData({ ...formData, totalQuestions: count })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.totalQuestions === count
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {count} câu
                </button>
              ))}
            </div>
          </div>

          {/* Race Speed */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Tốc độ cuộc đua ngựa:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'slow', label: '🐢 Chậm (~10s)', desc: 'Kịch tính, hồi hộp' },
                { id: 'normal', label: '🏇 Bình thường (~7s)', desc: 'Cân bằng, phổ biến' },
                { id: 'fast', label: '⚡ Nhanh (~4.5s)', desc: 'Tiết kiệm thời gian' },
              ].map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, raceSpeed: sp.id as 'slow' | 'normal' | 'fast' })
                  }
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    formData.raceSpeed === sp.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm text-white mb-0.5">{sp.label}</p>
                  <p className="text-[10px] text-slate-400">{sp.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Thinking Time */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Thời gian suy nghĩ trả lời:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {thinkingTimeOptions.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, thinkingTime: t.value })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.thinkingTime === t.value
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                Thứ tự câu hỏi:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, questionMode: 'random' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    formData.questionMode === 'random'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🎲 Ngẫu nhiên
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, questionMode: 'sequential' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    formData.questionMode === 'sequential'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  📋 Theo thứ tự
                </button>
              </div>
            </div>

            {/* Answer Mode on Wrong */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                Xử lý khi trả lời sai:
              </label>
              <select
                value={formData.answerMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    answerMode: e.target.value as 'revealAndContinue' | 'retry' | 'skipOnWrong',
                  })
                }
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none"
              >
                <option value="revealAndContinue">Hiện đáp án đúng + lời giải và qua vòng</option>
                <option value="retry">Cho phép học sinh suy nghĩ chọn lại</option>
                <option value="skipOnWrong">Bỏ qua (chuyển câu hỏi cho học sinh khác)</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleOptions}
                onChange={(e) => setFormData({ ...formData, shuffleOptions: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-white">Xáo trộn 4 đáp án (A, B, C, D)</p>
                <p className="text-[10px] text-slate-400">Tự động đảo vị trí đáp án mỗi khi hiển thị</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-white">Âm thanh & Hiệu ứng trường đua</p>
                <p className="text-[10px] text-slate-400">Tiếng vó ngựa, còi hiệu, reo hò, nhạc chiến thắng</p>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>LƯU CẤU HÌNH</span>
          </button>
        </div>
      </form>
    </div>
  );
};
