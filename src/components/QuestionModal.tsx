import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  HelpCircle,
  Sparkles,
  Plus,
  RefreshCw,
  SkipForward,
  CheckCircle2,
} from 'lucide-react';
import { Question, Student, GameSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface QuestionModalProps {
  question: Question;
  student: Student;
  roundNumber: number;
  totalRounds: number;
  settings: GameSettings;
  onAnswerSelected: (selectedOptionIndex: number, isCorrect: boolean) => void;
  onRerollQuestion: () => void;
  onSkipQuestion: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  student,
  roundNumber,
  totalRounds,
  settings,
  onAnswerSelected,
  onRerollQuestion,
  onSkipQuestion,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(settings.thinkingTime);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Shuffle options if enabled while preserving the correct answer index mapping
  const displayOptions = useMemo(() => {
    if (!settings.shuffleOptions) {
      return question.options.map((text, idx) => ({
        originalIndex: idx,
        text,
      }));
    }

    const array = question.options.map((text, idx) => ({
      originalIndex: idx,
      text,
    }));

    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }, [question, settings.shuffleOptions]);

  // Timer countdown
  useEffect(() => {
    if (settings.thinkingTime <= 0 || isLocked) return;

    setTimeLeft(settings.thinkingTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sound.playWrong();
          // Timeout counts as wrong answer
          onAnswerSelected(-1, false);
          return 0;
        }

        if (prev <= 6) {
          sound.playTimerTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.thinkingTime, question, isLocked]);

  // Handle Option Pick
  const handleSelectOption = (itemIndex: number) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedIdx(itemIndex);

    sound.playClick();

    const chosenOption = displayOptions[itemIndex];
    const isCorrect = chosenOption.originalIndex === question.correctAnswer;

    setTimeout(() => {
      onAnswerSelected(chosenOption.originalIndex, isCorrect);
    }, 450);
  };

  // Keyboard shortcut listener (A, B, C, D or 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;

      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') handleSelectOption(0);
      else if (key === 'B' || key === '2') handleSelectOption(1);
      else if (key === 'C' || key === '3') handleSelectOption(2);
      else if (key === 'D' || key === '4') handleSelectOption(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayOptions, isLocked]);

  const optionCards = [
    { letter: 'A', bg: 'hover:border-blue-500 hover:bg-blue-950/40', badge: 'bg-blue-600' },
    { letter: 'B', bg: 'hover:border-amber-500 hover:bg-amber-950/40', badge: 'bg-amber-600' },
    { letter: 'C', bg: 'hover:border-emerald-500 hover:bg-emerald-950/40', badge: 'bg-emerald-600' },
    { letter: 'D', bg: 'hover:border-purple-500 hover:bg-purple-950/40', badge: 'bg-purple-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl w-full max-w-4xl p-5 sm:p-8 shadow-2xl relative my-auto">
        {/* Top Header: Student Target & Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          {/* Target Student */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{ backgroundColor: student.horseColor }}
            >
              🐎 {student.horseNumber}
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                CÂU HỎI VÒNG {roundNumber}/{totalRounds} DÀNH CHO:
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {student.name}
              </h3>
            </div>
          </div>

          {/* Thinking Timer */}
          {settings.thinkingTime > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
              <Clock
                className={`w-5 h-5 ${
                  timeLeft <= 5 ? 'text-red-500 animate-ping' : 'text-amber-400'
                }`}
              />
              <span
                className={`font-mono text-xl sm:text-2xl font-black ${
                  timeLeft <= 5 ? 'text-red-400' : 'text-white'
                }`}
              >
                00:{String(timeLeft).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Question Subject & Points Badge */}
        <div className="flex items-center gap-2 mb-3">
          {question.subject && (
            <span className="px-3 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
              {question.subject}
            </span>
          )}
          <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
            +{question.points || 10} điểm
          </span>
        </div>

        {/* Main Question Text */}
        <div className="bg-slate-950/80 p-5 sm:p-7 rounded-2xl border border-slate-800 mb-6 shadow-inner">
          <h2 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* 4 Interactive Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {displayOptions.map((opt, idx) => {
            const config = optionCards[idx];
            const isChosen = selectedIdx === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isLocked}
                className={`group relative p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isChosen
                    ? 'border-amber-400 bg-amber-500/20 ring-4 ring-amber-400/30 scale-[1.02]'
                    : `border-slate-800 bg-slate-950/60 ${config.bg}`
                }`}
              >
                {/* Option Letter Tag */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base text-white shadow-md transition-transform group-hover:scale-110 shrink-0 ${config.badge}`}
                >
                  {config.letter}
                </div>

                {/* Option Text */}
                <span className="text-base sm:text-lg font-bold text-slate-100 flex-1 leading-snug">
                  {opt.text}
                </span>

                {/* Keyboard Shortcut hint */}
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                  Phím {config.letter}
                </span>
              </button>
            );
          })}
        </div>

        {/* Teacher Quick Helper Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {settings.thinkingTime > 0 && (
              <button
                onClick={() => setTimeLeft((t) => t + 5)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                title="Cộng thêm 5 giây suy nghĩ"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+5 giây</span>
              </button>
            )}
            <button
              onClick={onRerollQuestion}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Đổi câu hỏi khác"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Đổi câu hỏi</span>
            </button>
          </div>

          <button
            onClick={onSkipQuestion}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5 text-slate-400" />
            <span>Bỏ qua câu này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
