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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 relative overflow-hidden ${
          isCorrect
            ? 'bg-slate-900 border-emerald-500 shadow-emerald-500/20'
            : 'bg-slate-900 border-rose-500 shadow-rose-500/20'
        }`}
      >
        {/* Result Icon */}
        <div className="flex justify-center mb-4">
          {isCorrect ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400">
              <XCircle className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className={`text-3xl font-black mb-2 ${
            isCorrect ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isCorrect ? '🎉 CHÍNH XÁC!' : '😅 CHƯA CHÍNH XÁC!'}
        </h2>

        <p className="text-slate-300 font-bold text-base mb-6">
          {student.name} (🐎 Ngựa {student.horseNumber})
        </p>

        {/* Score Update Badge */}
        {isCorrect ? (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-lg mb-6 shadow">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>+{pointsEarned} ĐIỂM THƯỞNG!</span>
          </div>
        ) : (
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left mb-6 space-y-2">
            <p className="text-xs font-bold text-amber-400 uppercase">
              Đáp án chính xác là:
            </p>
            <p className="text-sm font-bold text-white">
              {correctLetter}. {correctAnswerText}
            </p>
            {question.explanation && (
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-bold text-amber-300">💡 Giải thích: </span>
                {question.explanation}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isCorrect && settings.answerMode === 'retry' && (
            <button
              onClick={() => {
                sound.playClick();
                onRetryQuestion();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cho trả lời lại</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onNextRound();
            }}
            className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 ${
              isCorrect
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-orange-500/20'
            }`}
          >
            <span>TIẾP TỤC VÒNG TIẾP THEO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
