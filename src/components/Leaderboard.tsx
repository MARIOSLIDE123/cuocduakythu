import React from 'react';
import {
  Trophy,
  Medal,
  Award,
  Download,
  Play,
  ArrowRight,
  Home,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Student, RoundResult, GameSettings } from '../types';
import { exportGameResultsToExcel } from '../utils/excelHelper';
import { Horse } from './Horse';
import { sound } from '../utils/soundEngine';

interface LeaderboardProps {
  students: Student[];
  history: RoundResult[];
  settings: GameSettings;
  currentRound: number;
  totalRounds: number;
  onContinueGame: () => void;
  onGoHome: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  students,
  history,
  settings,
  currentRound,
  totalRounds,
  onContinueGame,
  onGoHome,
}) => {
  // Sort students by score descending, then races won, then correct answers
  const sortedStudents = [...students].sort(
    (a, b) => b.score - a.score || b.racesWon - a.racesWon || b.correctAnswers - a.correctAnswers
  );

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  const handleExport = () => {
    sound.playClick();
    exportGameResultsToExcel(students, history, settings.gameTitle, settings.className);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              BẢNG XẾP HẠNG TRƯỜNG ĐUA
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            {settings.className} • Vòng hiện tại: {currentRound} / {totalRounds}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          {currentRound <= totalRounds && (
            <button
              onClick={() => {
                sound.playClick();
                onContinueGame();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>TIẾP TỤC ĐUA</span>
            </button>
          )}
        </div>
      </div>

      {/* Podium for Top 3 */}
      {sortedStudents.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-8 pt-6">
          {/* Top 2 - Silver */}
          <div className="flex flex-col items-center justify-end text-center">
            <div className="relative mb-2">
              <Horse number={top2.horseNumber} color={top2.horseColor} size="sm" />
              <span className="absolute -top-2 -right-1 text-base">🥈</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-full px-1">
              {top2.name}
            </p>
            <span className="text-xs font-black text-slate-300">{top2.score} điểm</span>
            <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-300 text-lg mt-2">
              #2
            </div>
          </div>

          {/* Top 1 - Gold */}
          <div className="flex flex-col items-center justify-end text-center">
            <div className="relative mb-2 animate-bounce">
              <Horse number={top1.horseNumber} color={top1.horseColor} size="md" isWinner />
              <span className="absolute -top-3 -right-2 text-2xl">🥇</span>
            </div>
            <p className="text-sm sm:text-base font-black text-amber-300 truncate max-w-full px-1">
              {top1.name}
            </p>
            <span className="text-sm font-black text-amber-400">{top1.score} điểm</span>
            <div className="w-full h-28 sm:h-32 bg-gradient-to-t from-amber-600/40 via-yellow-500/30 to-amber-500/20 rounded-t-2xl border-t-4 border-amber-400 flex items-center justify-center font-black text-amber-300 text-2xl mt-2 glow-gold">
              #1 👑
            </div>
          </div>

          {/* Top 3 - Bronze */}
          <div className="flex flex-col items-center justify-end text-center">
            <div className="relative mb-2">
              <Horse number={top3.horseNumber} color={top3.horseColor} size="sm" />
              <span className="absolute -top-2 -right-1 text-base">🥉</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-full px-1">
              {top3.name}
            </p>
            <span className="text-xs font-black text-amber-600">{top3.score} điểm</span>
            <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-800 to-amber-950/60 rounded-t-2xl border-t-2 border-amber-700 flex items-center justify-center font-black text-amber-600 text-base mt-2">
              #3
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide">
            Bảng Điểm Chi Tiết Tất Cả Học Sinh
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {students.length} thí sinh
          </span>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 text-center w-16">Hạng</th>
                <th className="px-4 py-3 w-28">Mã Ngựa</th>
                <th className="px-4 py-3">Họ và Tên</th>
                <th className="px-4 py-3 text-center w-24">Về Đích</th>
                <th className="px-4 py-3 text-center w-24">Đúng</th>
                <th className="px-4 py-3 text-center w-24">Sai</th>
                <th className="px-4 py-3 text-right w-28">Tổng Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedStudents.map((student, index) => {
                const isTop3 = index < 3;
                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      index === 0
                        ? 'bg-amber-500/10'
                        : index === 1
                        ? 'bg-slate-500/10'
                        : index === 2
                        ? 'bg-amber-800/10'
                        : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 text-center font-bold">
                      {index === 0 ? (
                        <span className="text-xl">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-xl">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">#{index + 1}</span>
                      )}
                    </td>

                    {/* Horse Badge */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: student.horseColor }}
                      >
                        🐎 {String(student.horseNumber).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3 font-bold text-white">
                      {student.name}
                      {student.className && (
                        <span className="text-xs text-slate-400 font-normal ml-2">
                          ({student.className})
                        </span>
                      )}
                    </td>

                    {/* Races Won */}
                    <td className="px-4 py-3 text-center font-mono font-bold text-amber-400">
                      {student.racesWon} 🏆
                    </td>

                    {/* Correct Answers */}
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">
                      {student.correctAnswers}
                    </td>

                    {/* Wrong Answers */}
                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-400">
                      {student.wrongAnswers}
                    </td>

                    {/* Total Score */}
                    <td className="px-4 py-3 text-right font-mono font-black text-amber-300 text-base">
                      {student.score} đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>
      </div>
    </div>
  );
};
