import React from 'react';
import {
  Play,
  Settings,
  Users,
  HelpCircle,
  Trophy,
  Sparkles,
  Award,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { GamePhase, GameSettings, Student, Question } from '../types';
import { Horse } from './Horse';
import { sound } from '../utils/soundEngine';

interface HomeProps {
  settings: GameSettings;
  students: Student[];
  questions: Question[];
  onNavigate: (phase: GamePhase) => void;
  onStartGame: () => void;
  onResetDemoData: () => void;
}

export const Home: React.FC<HomeProps> = ({
  settings,
  students,
  questions,
  onNavigate,
  onStartGame,
  onResetDemoData,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Dynamic Background Glows & Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-extrabold mb-4 shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>MINI GAME GIÁO DỤC TƯƠNG TÁC LỚP HỌC</span>
        </div>

        {/* Main Title */}
        <div className="relative mb-3">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 drop-shadow-sm tracking-tight">
            🏇 CUỘC ĐUA KỲ THÚ
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 font-semibold max-w-2xl mb-8 leading-relaxed">
          “Chọn ngựa – Khởi động cuộc đua – Chinh phục câu hỏi”
        </p>

        {/* 3D Stylized Horse Race Preview Banner */}
        <div className="w-full max-w-4xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-xl mb-10 relative overflow-hidden group">
          {/* Track Texture Mini Preview */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Running Horses Animation Banner */}
          <div className="relative flex items-center justify-between py-4 border-b border-slate-700/50 mb-5 overflow-hidden">
            {/* Start flag */}
            <div className="text-2xl animate-bounce">🚩</div>

            {/* Dynamic Running Horses Preview */}
            <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto px-4 py-2">
              <Horse number={1} color="#2563EB" isRacing size="lg" />
              <Horse number={2} color="#DC2626" isRacing size="lg" />
              <Horse number={3} color="#059669" isRacing size="lg" />
              <Horse number={4} color="#D97706" isRacing size="lg" />
              <Horse number={5} color="#7C3AED" isRacing size="lg" />
            </div>

            {/* Finish Line Checkered Flag */}
            <div className="flex flex-col items-center">
              <span className="text-3xl animate-flag">🏁</span>
              <span className="text-[10px] font-black text-amber-400 tracking-wider">ĐÍCH</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">Học sinh</span>
              </div>
              <p className="text-xl font-black text-white">{students.length} em</p>
              <p className="text-[10px] text-slate-400 truncate">{settings.className}</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold">Ngân hàng câu hỏi</span>
              </div>
              <p className="text-xl font-black text-white">{questions.length} câu</p>
              <p className="text-[10px] text-slate-400">Chọn {settings.totalQuestions} câu/trận</p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-bold">Tốc độ & Thời gian</span>
              </div>
              <p className="text-xl font-black text-white capitalize">
                {settings.raceSpeed === 'fast' ? 'Nhanh' : settings.raceSpeed === 'slow' ? 'Chậm' : 'Chuẩn'}
              </p>
              <p className="text-[10px] text-slate-400">
                {settings.thinkingTime > 0 ? `${settings.thinkingTime}s suy nghĩ` : 'Không giới hạn'}
              </p>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-bold">Chế độ câu hỏi</span>
              </div>
              <p className="text-xl font-black text-white">
                {settings.questionMode === 'random' ? 'Ngẫu nhiên' : 'Tuần tự'}
              </p>
              <p className="text-[10px] text-slate-400">
                {settings.shuffleOptions ? 'Trộn đáp án' : 'Giữ thứ tự'}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl mb-6">
          {/* START GAME BUTTON - BIG & GLOWING */}
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            disabled={students.length === 0 || questions.length === 0}
            className="w-full sm:flex-1 py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group glow-gold"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <span>BẮT ĐẦU TRÒ CHƠI</span>
            <ChevronRight className="w-6 h-6 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Secondary Navigation Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('STUDENTS');
            }}
            className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md group cursor-pointer"
          >
            <Users className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
            <span>Học Sinh</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('QUESTIONS');
            }}
            className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md group cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
            <span>Câu Hỏi</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('SETUP');
            }}
            className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md group cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
            <span>Cài Đặt</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('LEADERBOARD_ROUND');
            }}
            className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md group cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
            <span>Kết Quả / BXH</span>
          </button>
        </div>

        {/* Demo Data Reset Helper */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span>Sẵn sàng cho máy chiếu & màn hình tương tác</span>
          <span>•</span>
          <button
            onClick={() => {
              sound.playClick();
              onResetDemoData();
            }}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Khôi phục dữ liệu mẫu
          </button>
        </div>
      </div>
    </div>
  );
};
