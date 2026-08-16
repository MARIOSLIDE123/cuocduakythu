import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, Award, UserCheck, Star } from 'lucide-react';
import { Student } from '../types';
import { Horse } from './Horse';
import { sound } from '../utils/soundEngine';

interface WinnerModalProps {
  winner: Student;
  roundNumber: number;
  onProceedToQuestion: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  roundNumber,
  onProceedToQuestion,
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Stage 1: Winner horse fanfare
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
    });

    // Stage 2: Student reveal with secondary confetti burst
    const timeout = setTimeout(() => {
      setRevealed(true);
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.65 },
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.65 },
      });
    }, 450);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-center shadow-2xl relative overflow-hidden glow-gold animate-in zoom-in-95">
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Round Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase mb-3">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>KẾT QUẢ VÒNG ĐUA #{roundNumber} (10 GIÂY)</span>
        </div>

        {/* Title: The winning horse */}
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 mb-4 drop-shadow">
          🏆 CHÚ NGỰA ĐÃ CÁN ĐÍCH ĐẦU TIÊN!
        </h2>

        {/* Horse Animation Badge */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/30 border-2 border-amber-400/60 flex items-center justify-center shadow-inner relative">
            <Horse
              number={winner.horseNumber}
              color={winner.horseColor}
              isWinner
              size="xl"
            />
          </div>

          <div
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-black text-white shadow-lg border border-white/20"
            style={{ backgroundColor: winner.horseColor }}
          >
            <span>🐎 NGỰA SỐ {String(winner.horseNumber).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Grand Student Reveal Box */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-2 border-indigo-500/60 shadow-xl relative overflow-hidden">
          <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>XIN CHÚC MỪNG HỌC SINH ĐẠI DIỆN</span>
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow mb-1 animate-in slide-in-from-bottom">
            {winner.name}
          </h3>

          {winner.className && (
            <p className="text-sm font-extrabold text-blue-300">
              Lớp: {winner.className}
            </p>
          )}

          <p className="text-xs text-slate-300 mt-2 font-medium">
            “Chú ngựa số <strong className="text-amber-300">{winner.horseNumber}</strong> của bạn đã xuất sắc bứt phá về đích sau 10 giây tranh tài!”
          </p>
        </div>

        {/* Proceed to Question Button */}
        <button
          onClick={() => {
            sound.playClick();
            onProceedToQuestion();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-orange-500/30 cursor-pointer transform hover:scale-105 active:scale-100 transition-all glow-gold"
        >
          <Award className="w-5 h-5 fill-current" />
          <span>🎯 TRẢ LỜI CÂU HỎI ĐỂ GHI ĐIỂM</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
