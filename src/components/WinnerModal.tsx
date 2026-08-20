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
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="bg-gradient-to-b from-[#24170e] via-slate-900 to-slate-950 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-center shadow-2xl relative overflow-hidden glow-gold animate-in zoom-in-95 my-auto">
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-500/30 rounded-full blur-2xl pointer-events-none" />

        {/* Round Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black uppercase mb-3">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>🏛️ KẾT QUẢ ĐẤU TRƯỜNG VÒNG #{roundNumber} (10 GIÂY)</span>
        </div>

        {/* Title: The winning horse */}
        <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400 mb-4 drop-shadow">
          🏆 CHIẾN MÃ ĐÃ CÁN ĐÍCH ĐẦU TIÊN!
        </h2>

        {/* Horse Animation Badge */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-yellow-500/30 border-4 border-amber-400/80 flex items-center justify-center shadow-2xl relative">
            <Horse
              number={winner.horseNumber}
              color={winner.horseColor}
              isWinner
              size="xl"
            />
          </div>

          <div
            className="mt-3.5 inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-base font-black text-white shadow-xl border-2 border-white/30"
            style={{ backgroundColor: winner.horseColor }}
          >
            <span>🐎 NGỰA SỐ {String(winner.horseNumber).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Grand Student Reveal Box */}
        <div className="my-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#2c1d12]/90 via-slate-900 to-[#2c1d12]/90 border-2 border-amber-500/60 shadow-2xl relative overflow-hidden">
          <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>XIN CHÚC MỪNG HỌC SINH ĐẠI DIỆN</span>
            <Star className="w-4 h-4 fill-amber-400" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md mb-1.5 animate-in slide-in-from-bottom">
            {winner.name}
          </h3>

          {winner.className && (
            <p className="text-base font-extrabold text-amber-300">
              Lớp: {winner.className}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-200 mt-2 font-medium">
            “Chiến mã số <strong className="text-amber-300 text-sm">{winner.horseNumber}</strong> của bạn đã xuất sắc bứt phá về đích sau 10 giây tranh tài tại Đấu trường!”
          </p>
        </div>

        {/* Proceed to Question Button */}
        <button
          onClick={() => {
            sound.playClick();
            onProceedToQuestion();
          }}
          className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black text-base sm:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/40 cursor-pointer transform hover:scale-105 active:scale-100 transition-all glow-gold border border-yellow-200"
        >
          <Award className="w-6 h-6 fill-current" />
          <span>🎯 TRẢ LỜI CÂU HỎI ĐỂ GHI ĐIỂM</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
