import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  Sparkles,
  Download,
  RotateCcw,
  Home,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import { Student, RoundResult, GameSettings } from '../types';
import { exportGameResultsToExcel } from '../utils/excelHelper';
import { Horse } from './Horse';
import { sound } from '../utils/soundEngine';

interface GameResultProps {
  students: Student[];
  history: RoundResult[];
  settings: GameSettings;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameResult: React.FC<GameResultProps> = ({
  students,
  history,
  settings,
  onPlayAgain,
  onGoHome,
}) => {
  useEffect(() => {
    sound.playTrophyFanfare();

    // Multistage Confetti fireworks
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const interval: number = window.setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const sortedStudents = [...students].sort(
    (a, b) => b.score - a.score || b.racesWon - a.racesWon || b.correctAnswers - a.correctAnswers
  );

  const champion = sortedStudents[0];
  const runnerUp = sortedStudents[1];
  const thirdPlace = sortedStudents[2];

  const totalQuestionsAnswered = history.length;
  const totalCorrect = history.filter((h) => h.isCorrect).length;
  const totalWrong = totalQuestionsAnswered - totalCorrect;
  const highestScore = champion?.score || 0;

  const handleExport = () => {
    sound.playClick();
    exportGameResultsToExcel(students, history, settings.gameTitle, settings.className);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 flex flex-col items-center text-center">
      {/* Celebration Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-extrabold mb-4 shadow animate-pulse">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <span>TỔNG KẾT VÀ VINH DANH CHIẾN THẮNG</span>
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 mb-3 drop-shadow">
        🏆 CUỘC ĐUA KỲ THÚ ĐÃ KẾT THÚC!
      </h1>

      <p className="text-slate-300 text-sm sm:text-base font-semibold max-w-xl mb-8">
        Xin chúc mừng tất cả các chú ngựa dũng cảm và các bạn học sinh xuất sắc lớp {settings.className}!
      </p>

      {/* TOP 3 PODIUM CEREMONY */}
      {sortedStudents.length >= 3 && (
        <div className="w-full max-w-3xl grid grid-cols-3 gap-2 sm:gap-6 mb-10 items-end">
          {/* Runner Up - Á Quân 🥈 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Horse number={runnerUp.horseNumber} color={runnerUp.horseColor} size="md" />
              <span className="absolute -top-3 -right-2 text-2xl">🥈</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 p-3 sm:p-4 rounded-2xl w-full text-center shadow-lg">
              <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-0.5">
                Á QUÂN
              </p>
              <h3 className="text-sm sm:text-base font-black text-white truncate">
                {runnerUp.name}
              </h3>
              <p className="text-xs sm:text-sm font-black text-slate-300 mt-1">
                {runnerUp.score} điểm
              </p>
            </div>
            <div className="w-full h-24 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-300 text-xl mt-2">
              #2
            </div>
          </div>

          {/* Champion - Quán Quân 🥇 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3 animate-bounce">
              <Horse number={champion.horseNumber} color={champion.horseColor} size="xl" isWinner />
              <span className="absolute -top-4 -right-3 text-4xl">🥇</span>
            </div>
            <div className="bg-gradient-to-b from-amber-500/20 to-orange-500/30 border-2 border-amber-400 p-4 sm:p-5 rounded-3xl w-full text-center shadow-2xl glow-gold">
              <p className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                👑 QUÁN QUÂN 👑
              </p>
              <h3 className="text-base sm:text-xl font-black text-white truncate">
                {champion.name}
              </h3>
              <p className="text-sm sm:text-base font-black text-amber-400 mt-1">
                {champion.score} ĐIỂM
              </p>
              <p className="text-[11px] text-slate-400">
                {champion.racesWon} lần về đích • {champion.correctAnswers} câu đúng
              </p>
            </div>
            <div className="w-full h-36 bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-400 rounded-t-3xl border-t-4 border-amber-200 flex items-center justify-center font-black text-slate-950 text-3xl mt-2 glow-gold">
              #1 🏆
            </div>
          </div>

          {/* Third Place - Hạng Ba 🥉 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Horse number={thirdPlace.horseNumber} color={thirdPlace.horseColor} size="md" />
              <span className="absolute -top-3 -right-2 text-2xl">🥉</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700 p-3 sm:p-4 rounded-2xl w-full text-center shadow-lg">
              <p className="text-[10px] sm:text-xs font-black text-amber-600 uppercase tracking-wider mb-0.5">
                HẠNG BA
              </p>
              <h3 className="text-sm sm:text-base font-black text-white truncate">
                {thirdPlace.name}
              </h3>
              <p className="text-xs sm:text-sm font-black text-amber-500 mt-1">
                {thirdPlace.score} điểm
              </p>
            </div>
            <div className="w-full h-18 bg-gradient-to-t from-slate-800 to-amber-950/80 rounded-t-2xl border-t-2 border-amber-700 flex items-center justify-center font-black text-amber-600 text-lg mt-2">
              #3
            </div>
          </div>
        </div>
      )}

      {/* Match Summary Statistics Cards */}
      <div className="w-full max-w-4xl bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl mb-8 text-left">
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide mb-4">
          📊 Thống Kê Tổng Kết Trận Đấu
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-bold mb-1">Tổng số vòng thi</p>
            <p className="text-2xl font-black text-white">{totalQuestionsAnswered} vòng</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-emerald-400 font-bold mb-1">Trả lời chính xác</p>
            <p className="text-2xl font-black text-emerald-400">{totalCorrect} câu</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-rose-400 font-bold mb-1">Chưa chính xác</p>
            <p className="text-2xl font-black text-rose-400">{totalWrong} câu</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-amber-400 font-bold mb-1">Điểm số cao nhất</p>
            <p className="text-2xl font-black text-amber-400">{highestScore} đ</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl">
        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="flex-1 min-w-[200px] py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 cursor-pointer transition-all hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          <span>CHƠI LẠI TRẬN MỚI</span>
        </button>

        <button
          onClick={handleExport}
          className="flex-1 min-w-[200px] py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105"
        >
          <Download className="w-5 h-5" />
          <span>XUẤT BẢNG ĐIỂM EXCEL</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>
      </div>
    </div>
  );
};
