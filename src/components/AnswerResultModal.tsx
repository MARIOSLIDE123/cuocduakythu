import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { Student, Question, GameSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface AnswerResultModalProps {
  isCorrect: boolean;
  student: Student;
  question: Question;
  selectedOptionIndex: number;
  pointsEarned: number;
  settings: GameSettings;
  onNextRound: () => void;
  onRetryQuestion: () => void;
}

export const AnswerResultModal: React.FC<AnswerResultModalProps> = ({
  isCorrect,
  student,
  question,
  pointsEarned,
  settings,
  onNextRound,
  onRetryQuestion,
}) => {
  useEffect(() => {
    if (isCorrect) {
      sound.playCorrect();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      sound.playWrong();
    }
  }, [isCorrect]);

  const optionLetters = ['A', 'B', 'C', 'D'];
  const correctLetter = optionLetters[question.correctAnswer];
  const correctAnswerText = question.options[question.correctAnswer];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
      <div
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-10 text-center shadow-2xl border-4 relative overflow-hidden my-auto ${
          isCorrect
            ? 'bg-slate-900 border-emerald-500 shadow-emerald-500/30 glow-gold'
            : 'bg-slate-900 border-rose-500 shadow-rose-500/30'
        }`}
      >
        {/* Result Icon */}
        <div className="flex justify-center mb-4">
          {isCorrect ? (
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center text-emerald-400 animate-bounce shadow-xl">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-rose-500/20 border-4 border-rose-400 flex items-center justify-center text-rose-400 shadow-xl">
              <XCircle className="w-14 h-14" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className={`text-3xl sm:text-5xl font-black mb-2 drop-shadow ${
            isCorrect ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isCorrect ? '🎉 CHÍNH XÁC!' : '😅 CHƯA CHÍNH XÁC!'}
        </h2>

        <p className="text-white font-black text-lg sm:text-2xl mb-6">
          {student.name} <span className="text-amber-400 ml-1">(🐎 Ngựa {student.horseNumber})</span>
        </p>

        {/* Score Update Badge */}
        {isCorrect ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 font-black text-xl sm:text-2xl mb-6 shadow-lg">
            <Award className="w-6 h-6 text-emerald-400" />
            <span>+{pointsEarned} ĐIỂM THƯỞNG!</span>
          </div>
        ) : (
          <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 text-left mb-6 space-y-2.5">
            <p className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider">
              Đáp án chính xác là:
            </p>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              <strong className="text-emerald-400 text-xl mr-1">{correctLetter}.</strong> {correctAnswerText}
            </p>
            {question.explanation && (
              <div className="pt-2.5 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
                <span className="font-bold text-amber-300">💡 Giải thích: </span>
                {question.explanation}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {!isCorrect && settings.answerMode === 'retry' && (
            <button
              onClick={() => {
                sound.playClick();
                onRetryQuestion();
              }}
              className="w-full sm:flex-1 py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Cho trả lời lại</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onNextRound();
            }}
            className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-2xl transition-all cursor-pointer hover:scale-105 ${
              isCorrect
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/30'
            }`}
          >
            <span>TIẾP TỤC VÒNG TIẾP THEO</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
