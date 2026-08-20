import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  Flag,
  Trophy,
  Sliders,
  Flame,
  Zap,
  Clock,
  Radio,
  Sparkles,
  Award,
  Eye,
  EyeOff,
  Users,
  Settings,
  Music,
  Bell,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Student, GameSettings, RaceHorseProgress, GamePhase } from '../types';
import { Horse } from './Horse';
import { sound } from '../utils/soundEngine';

interface RaceTrackProps {
  students: Student[];
  settings: GameSettings;
  currentRound: number;
  totalRounds: number;
  gamePhase: GamePhase;
  onRaceFinished: (winnerStudent: Student) => void;
  onStartCountdown: () => void;
  onOpenTeacherDrawer: () => void;
}

// Exactly 10.0 seconds race duration
const TOTAL_RACE_SECONDS = 10.0;

interface HorseVisualState {
  studentId: string;
  xProgress: number; // 0 to 100%
  baseYPercent: number; // Y position on the track field (0% to 90%)
  currentYOffset: number; // Dynamic micro weaving
  speedFactor: number;
  burstTime: number;
  burstDuration: number;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  students,
  settings,
  currentRound,
  totalRounds,
  gamePhase,
  onRaceFinished,
  onStartCountdown,
  onOpenTeacherDrawer,
}) => {
  const [horseStates, setHorseStates] = useState<HorseVisualState[]>([]);
  const [countdownNum, setCountdownNum] = useState<number | string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [raceElapsedSec, setRaceElapsedSec] = useState<number>(0);
  const [commentary, setCommentary] = useState<string>('🏛️ Sẵn sàng xuất phát cuộc đua Đấu Trường Olympia 10 giây!');
  const [isPhotoFinish, setIsPhotoFinish] = useState(false);
  const [showRosterOverlay, setShowRosterOverlay] = useState(false);
  const [isMuted, setIsMuted] = useState(!settings.soundEnabled);

  const animationFrameRef = useRef<number | null>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const winnerDeterminedRef = useRef(false);
  const raceStartTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Initialize or reset horse positions in an open-field flock/pack layout
  const resetTrack = () => {
    winnerDeterminedRef.current = false;
    setRaceElapsedSec(0);
    setIsPaused(false);
    setIsPhotoFinish(false);
    setCommentary('🏛️ Nhấn BẮT ĐẦU ĐUA để mở cổng xuất phát Đấu trường Olympia!');

    const count = students.length;
    // Calculate organic positions for all horses in a clustered pack on the left side
    const initialHorses: HorseVisualState[] = students.map((s, idx) => {
      // Distribute Y across track field with safe top and bottom padding
      const yStep = count > 1 ? 78 / (count - 1) : 40;
      const baseY = 8 + idx * yStep + (Math.sin(idx * 3.7) * 4);
      
      // Cluster pack on the left side: X between 1% and 14%
      const startXCluster = 2 + (idx % 4) * 3.5 + Math.random() * 2;

      return {
        studentId: s.id,
        xProgress: startXCluster,
        baseYPercent: Math.min(84, Math.max(6, baseY)),
        currentYOffset: 0,
        speedFactor: 0.96 + Math.random() * 0.08,
        burstTime: 3.0 + Math.random() * 4.5,
        burstDuration: 1.5 + Math.random() * 1.5,
      };
    });

    setHorseStates(initialHorses);
  };

  useEffect(() => {
    resetTrack();
  }, [students, currentRound]);

  // Handle Countdown sequence (3 - 2 - 1 - XUẤT PHÁT)
  useEffect(() => {
    if (gamePhase === 'RACE_COUNTDOWN') {
      winnerDeterminedRef.current = false;
      setRaceElapsedSec(0);
      setIsPhotoFinish(false);
      let count = 3;
      setCountdownNum(count);
      sound.playCountdown(false);

      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownNum(count);
          sound.playCountdown(false);
        } else if (count === 0) {
          setCountdownNum('XUẤT PHÁT!');
          sound.playCountdown(true);
          sound.playStartBell();
          sound.playWhistle();
        } else {
          clearInterval(interval);
          setCountdownNum(null);
          sound.startRaceGallop(170);
          onStartCountdown(); // Moves to RACING
        }
      }, 900);

      return () => clearInterval(interval);
    }
  }, [gamePhase]);

  // 10-Second Realistic Derby Physics & Pacing Engine across open racecourse
  useEffect(() => {
    if (gamePhase !== 'RACING') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    raceStartTimeRef.current = performance.now() - pausedTimeRef.current;
    let lastHoofTempoUpdate = 0;

    const raceLoop = (currentTimestamp: number) => {
      if (!raceStartTimeRef.current) {
        raceStartTimeRef.current = currentTimestamp;
      }

      if (isPaused) {
        animationFrameRef.current = requestAnimationFrame(raceLoop);
        return;
      }

      const elapsedMs = currentTimestamp - raceStartTimeRef.current;
      const elapsedSeconds = Math.min(TOTAL_RACE_SECONDS, elapsedMs / 1000);
      setRaceElapsedSec(elapsedSeconds);

      // Fraction of total 10 seconds (0.0 to 1.0)
      const raceProgressRatio = elapsedSeconds / TOTAL_RACE_SECONDS;

      // Update sound tempo dynamically as race intensifies
      if (elapsedSeconds > 6.5 && lastHoofTempoUpdate < 1) {
        sound.setGallopTempo(135);
        lastHoofTempoUpdate = 1;
      } else if (elapsedSeconds > 8.5 && lastHoofTempoUpdate < 2) {
        sound.setGallopTempo(95); // Final burst sprint!
        lastHoofTempoUpdate = 2;
      }

      // Update horse flock progress
      setHorseStates((prev) => {
        let winnerFound: Student | null = null;

        // Base track progress curve across 10 seconds (0% to 100% of the course distance):
        // Finish line is at ~82% of field width
        let baseCourseProgress = 0;
        if (raceProgressRatio < 0.25) {
          // Phase 1: 0 - 2.5s (0% -> 22%)
          baseCourseProgress = (raceProgressRatio / 0.25) * 22;
        } else if (raceProgressRatio < 0.65) {
          // Phase 2: 2.5 - 6.5s (22% -> 64%)
          const p = (raceProgressRatio - 0.25) / 0.4;
          baseCourseProgress = 22 + p * 42;
        } else if (raceProgressRatio < 0.85) {
          // Phase 3: 6.5 - 8.5s (64% -> 86%)
          const p = (raceProgressRatio - 0.65) / 0.2;
          baseCourseProgress = 64 + p * 22;
        } else {
          // Phase 4: 8.5 - 10.0s (86% -> 100%)
          const p = (raceProgressRatio - 0.85) / 0.15;
          baseCourseProgress = 86 + p * 14;
        }

        const updated = prev.map((horse, idx) => {
          if (winnerDeterminedRef.current) return horse;

          // Unique micro-burst and sinusoidal gallop wobble
          const horseOffsetSin = Math.sin(elapsedSeconds * 2.8 + idx * 1.6) * 3.8;
          const horseStaminaBurst = Math.cos(elapsedSeconds * 2.1 + idx * 2.4) * 3.2;

          // Gentle Y-axis bobbing/weaving like horses on turf
          const yWobble = Math.sin(elapsedSeconds * 1.5 + idx * 2.0) * 1.8;

          // Compute raw progress
          let progress = baseCourseProgress * horse.speedFactor + horseOffsetSin + horseStaminaBurst;
          progress = Math.max(0, progress);

          // If reached 10.0 seconds, force the leader past 100% (crossing the finish line ribbon)
          if (elapsedSeconds >= TOTAL_RACE_SECONDS) {
            const isHighest = prev.every(
              (other) => other.studentId === horse.studentId || other.xProgress <= horse.xProgress
            );
            if (isHighest) {
              progress = 100;
              if (!winnerDeterminedRef.current) {
                winnerDeterminedRef.current = true;
                const winStudent = students.find((s) => s.id === horse.studentId);
                if (winStudent) winnerFound = winStudent;
              }
            } else {
              progress = Math.min(98.5, progress);
            }
          }

          if (progress >= 100 && !winnerDeterminedRef.current) {
            winnerDeterminedRef.current = true;
            const winStudent = students.find((s) => s.id === horse.studentId);
            if (winStudent) winnerFound = winStudent;
          }

          return {
            ...horse,
            xProgress: Math.min(100, Math.max(0, progress)),
            currentYOffset: yWobble,
          };
        });

        // Trigger winner celebration
        if (winnerFound) {
          setIsPhotoFinish(true);
          sound.stopRaceGallop();
          sound.playWinnerFanfare();
          setTimeout(() => {
            onRaceFinished(winnerFound!);
          }, 900);
        }

        return updated;
      });

      // Update live race commentary (by Horse Number only)
      if (!winnerDeterminedRef.current) {
        if (elapsedSeconds < 2.5) {
          setCommentary('🏛️ CỔNG ĐẤU TRƯỜNG MỞ! Các chiến mã Hy Lạp đồng loạt phi nước đại!');
        } else if (elapsedSeconds < 5.0) {
          const leader = sortedHorses[0];
          const st = students.find((s) => s.id === leader?.studentId);
          setCommentary(
            `⚡ Chiến mã số ${String(st?.horseNumber || '??').padStart(2, '0')} đang tạm thời bứt phá dẫn đầu đoàn đua!`
          );
        } else if (elapsedSeconds < 7.5) {
          const top2 = sortedHorses[1];
          const st2 = students.find((s) => s.id === top2?.studentId);
          setCommentary(
            `🔥 TRANH ĐUA NGHẸT THỞ! Chiến mã số ${String(st2?.horseNumber || '??').padStart(2, '0')} đang bám đuổi quyết liệt!`
          );
        } else if (elapsedSeconds < 9.0) {
          setCommentary('🚩 ĐOẠN ĐƯỜNG NƯỚC RÚT! Tiến thẳng về Cổng Vinh Quang Khải Hoàn!');
        } else {
          setCommentary('🏆 PHOTO-FINISH! Chiến mã vô địch đã cán qua vạch đích Đấu trường!');
        }
      }

      if (!winnerDeterminedRef.current && elapsedSeconds < TOTAL_RACE_SECONDS + 0.1) {
        animationFrameRef.current = requestAnimationFrame(raceLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(raceLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gamePhase, isPaused, students, onRaceFinished]);

  // Sorted horses by X progress
  const sortedHorses = useMemo(() => {
    return [...horseStates].sort((a, b) => b.xProgress - a.xProgress);
  }, [horseStates]);

  const leadingHorse = sortedHorses[0];
  const secondHorse = sortedHorses[1];
  const thirdHorse = sortedHorses[2];

  const leadingStudent = students.find((s) => s.id === leadingHorse?.studentId);
  const secondStudent = students.find((s) => s.id === secondHorse?.studentId);
  const thirdStudent = students.find((s) => s.id === thirdHorse?.studentId);

  // Format digital stopwatch: "00:00:01" or "00:00:10"
  const formattedSeconds = Math.floor(raceElapsedSec);
  const formattedCentis = Math.floor((raceElapsedSec % 1) * 100);
  const digitalStopwatchText = `00:00:${String(formattedSeconds).padStart(2, '0')}`;

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setEnabled(!next);
  };

  // Only show horses on the active race track during preparation, countdown, and active racing
  // When WINNER_REVEAL, QUESTION_ACTIVE, ANSWER_RESULT or finish modals are open, horses on track are completely hidden
  const shouldRenderTrackHorses =
    gamePhase === 'RACE_READY' || gamePhase === 'RACE_COUNTDOWN' || gamePhase === 'RACING';

  return (
    <div className="relative w-full px-2 sm:px-4 py-2 flex flex-col gap-2.5 h-full select-none">
      {/* TOP HEADER CONTROLS & CENTER DIGITAL STOPWATCH (ANCIENT ARENA STYLE) */}
      <div className="bg-gradient-to-r from-[#2a1a0f]/95 via-[#382315]/95 to-[#2a1a0f]/95 border-2 border-amber-600/60 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Top-Left Action Icons & Quick Buttons */}
        <div className="flex items-center gap-3">
          {/* Quick Icon Controls: Settings, Music, Bell */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-amber-500/30">
            {/* Settings (Teacher Drawer) */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenTeacherDrawer();
              }}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all cursor-pointer border border-amber-400/30"
              title="Cài đặt giáo viên (⚙️)"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Sound / Music Toggle */}
            <button
              onClick={() => {
                toggleSound();
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30'
              }`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            </button>

            {/* Sound Bell */}
            <button
              onClick={() => {
                sound.playStartBell();
              }}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 transition-all cursor-pointer border border-amber-400/30"
              title="Rung chuông đấu trường"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Text Links (Pause, Clear/Reset) */}
          <div className="flex flex-col text-xs font-bold gap-0.5 select-none">
            {gamePhase === 'RACING' ? (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-left text-amber-300 hover:text-white transition-colors cursor-pointer"
              >
                {isPaused ? '▶ Tiếp Tục' : '⏸ Tạm Dừng'}
              </button>
            ) : gamePhase === 'RACE_READY' ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onStartCountdown();
                }}
                className="text-left text-emerald-400 hover:text-white transition-colors font-black cursor-pointer text-sm"
              >
                ▶ Bắt Đầu Đua
              </button>
            ) : null}

            <button
              onClick={() => {
                sound.playClick();
                resetTrack();
              }}
              className="text-left text-amber-200/70 hover:text-red-300 transition-colors cursor-pointer"
            >
              ↺ Đặt Lại Đấu Trường
            </button>
          </div>
        </div>

        {/* Center: BIG DIGITAL STOPWATCH CLOCK CARD (EXTRA LARGE FOR PROJECTOR) */}
        <div className="flex-1 flex justify-center min-w-[240px]">
          <div className="bg-gradient-to-b from-[#fffbeb] to-[#fef3c7] px-6 sm:px-12 py-1.5 sm:py-2 rounded-2xl border-4 border-amber-600 shadow-2xl flex items-center justify-center">
            <span className="font-mono text-4xl sm:text-6xl md:text-7xl font-black text-amber-950 tracking-wider drop-shadow-sm">
              {digitalStopwatchText}
            </span>
            <span className="font-mono text-lg sm:text-2xl font-bold text-amber-700 ml-2">
              .{String(formattedCentis).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Top-Right: Class & Round Badge + Teacher Roster Eye */}
        <div className="flex items-center gap-2.5">
          {/* Round & Class Info */}
          <div className="text-right hidden sm:block">
            <div className="text-sm font-black text-amber-300 uppercase tracking-wide flex items-center justify-end gap-1">
              <span>🏛️ VÒNG #{String(currentRound).padStart(2, '0')} / {totalRounds}</span>
            </div>
            <div className="text-xs text-amber-100/90 font-extrabold">
              {settings.className} ({students.length} Chiến Mã)
            </div>
          </div>

          {/* Peek Student Roster Button */}
          <button
            onClick={() => setShowRosterOverlay(!showRosterOverlay)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              showRosterOverlay
                ? 'bg-amber-500/40 text-amber-200 border-amber-400'
                : 'bg-amber-950/60 text-amber-200 border-amber-500/40 hover:text-white'
            }`}
            title="Xem danh sách mã số ngựa & học sinh"
          >
            {showRosterOverlay ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Big Start Button when Ready */}
          {gamePhase === 'RACE_READY' && (
            <button
              onClick={() => {
                sound.playClick();
                onStartCountdown();
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-red-500 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-orange-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer glow-gold border border-yellow-200"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>BẮT ĐẦU ĐUA (10S)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Commentary & Top Horse Contenders Bar */}
      <div className="bg-gradient-to-r from-slate-900/95 via-[#251810]/95 to-slate-900/95 rounded-2xl p-2.5 sm:p-3 border border-amber-600/40 flex flex-wrap items-center justify-between gap-2.5 shadow-lg">
        <div className="flex items-center gap-2.5 text-slate-100 font-bold flex-1 min-w-[280px]">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
          <Radio className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-amber-400 font-black uppercase text-xs sm:text-sm shrink-0 tracking-wider">
            Bình luận:
          </span>
          <span className="text-white text-sm sm:text-base md:text-lg font-extrabold truncate drop-shadow-sm">
            {commentary}
          </span>
        </div>

        {/* Live Top Leading Horses (Numbers only) */}
        {gamePhase === 'RACING' && leadingStudent && (
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-black text-amber-300/80 uppercase">DẪN ĐẦU:</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/30 border-2 border-amber-400 text-amber-200 font-black text-sm shadow-md">
              <span>🥇 NGỰA #{String(leadingStudent.horseNumber).padStart(2, '0')}</span>
              <span className="text-sm">🔥</span>
            </div>
            {secondStudent && (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-600 text-slate-200 font-bold text-xs">
                <span>🥈 #{String(secondStudent.horseNumber).padStart(2, '0')}</span>
              </div>
            )}
            {thirdStudent && (
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#452814]/80 border border-amber-800 text-amber-400 font-bold text-xs">
                <span>🥉 #{String(thirdStudent.horseNumber).padStart(2, '0')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ANCIENT GREEK HIPPODROME ARENA (FULL HORIZONTAL WIDTH) */}
      <div
        ref={trackContainerRef}
        className="relative w-full h-[60vh] sm:h-[68vh] min-h-[440px] max-h-[800px] rounded-3xl border-4 border-[#8c5626] shadow-2xl overflow-hidden select-none bg-[#c89255]"
      >
        {/* 1. TOP ANCIENT GREEK COLONNADE & AMPHITHEATER SPECTATOR TIER */}
        <div className="absolute top-0 inset-x-0 h-20 sm:h-24 bg-gradient-to-b from-[#2a1a10] via-[#3a2416] to-[#25170e] border-b-4 border-amber-700/80 z-0 flex items-center justify-between px-4 sm:px-8 relative overflow-hidden shadow-md">
          {/* Classical Greek Doric/Ionic Columns & Olympic Torches on the Left */}
          <div className="flex items-center gap-4 sm:gap-8 text-2xl sm:text-3xl opacity-95 pointer-events-none z-10">
            <div className="flex items-center gap-1.5" title="Đuốc Olympic cổ đại">
              <span className="text-3xl animate-torch drop-shadow">🔥</span>
              <span className="text-2xl drop-shadow">🏛️</span>
            </div>
            <span className="drop-shadow hidden sm:inline text-2xl">🏛️</span>
            <div className="flex items-center gap-1" title="Vòng nguyệt quế">
              <span className="text-2xl drop-shadow">🌿</span>
              <span className="text-2xl drop-shadow">🏛️</span>
            </div>
          </div>

          {/* Grand Greek Arena Title Banner */}
          <div className="flex flex-col items-center justify-center text-center z-10 px-2 drop-shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-base sm:text-xl">⚡</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 font-black text-sm sm:text-lg md:text-xl tracking-widest uppercase font-serif">
                ĐẤU TRƯỜNG HY LẠP CỔ ĐẠI • OLYMPIA
              </span>
              <span className="text-amber-400 text-base sm:text-xl">⚡</span>
            </div>
            <span className="text-[10px] sm:text-xs font-black text-amber-400/90 tracking-widest uppercase">
              🏛️ CUỘC TRANH TÀI 10 GIÂY CỦA CÁC CHIẾN MÃ 🏛️
            </span>
          </div>

          {/* Classical Greek Doric/Ionic Columns & Olympic Torches on the Right */}
          <div className="flex items-center gap-4 sm:gap-8 text-2xl sm:text-3xl opacity-95 pointer-events-none z-10">
            <div className="flex items-center gap-1" title="Vòng nguyệt quế">
              <span className="text-2xl drop-shadow">🏛️</span>
              <span className="text-2xl drop-shadow">🌿</span>
            </div>
            <span className="drop-shadow hidden sm:inline text-2xl">🏛️</span>
            <div className="flex items-center gap-1.5" title="Đuốc Olympic cổ đại">
              <span className="text-2xl drop-shadow">🏛️</span>
              <span className="text-3xl animate-torch drop-shadow">🔥</span>
            </div>
          </div>

          {/* Greek Key / Meander Frieze Border */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 opacity-70" />

          {/* Carved Marble Balustrade / Stone Railing */}
          <div className="absolute bottom-0 inset-x-0 h-3.5 bg-gradient-to-b from-[#f3ece0] via-[#e5dcce] to-[#bda68c] border-t border-b border-[#7c5630] shadow-md flex items-center justify-around opacity-95">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-1.5 h-full bg-[#8c6b45] opacity-50" />
            ))}
          </div>
        </div>

        {/* 2. THE MAIN RACING HIPPODROME SAND TRACK GROUND (FROM LEFT TO RIGHT) */}
        <div className="absolute top-20 sm:top-24 bottom-0 inset-x-0 bg-gradient-to-b from-[#cb955a] via-[#dcab6f] to-[#b67e43] overflow-hidden">
          {/* Ancient Sand Arena Texture & Chariot Track Ruts */}
          <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#683e16_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_bottom,#4a2707_1px,transparent_1px)] [background-size:100%_40px]" />
          
          {/* Subtle Greek Sand Arena Dust Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#ffffff_2px,transparent_2px)] [background-size:120px_100%]" />

          {/* 3. ANCIENT GREEK TRIUMPHAL FINISH LINE & MARBLE PILLARS (AT ~82% WIDTH) */}
          <div
            className="absolute top-0 bottom-0 right-[15%] sm:right-[18%] w-12 sm:w-16 pointer-events-none z-10 shadow-2xl flex flex-col items-center justify-between py-1 transform -skew-x-6 border-x-4 border-[#3d2411]"
            style={{
              backgroundImage:
                'repeating-conic-gradient(#1e130a 0% 25%, #ffffff 0% 50%)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Top Finish Badge - Greek Victory Arch / Nikē */}
            <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg shadow-2xl border-2 border-yellow-300 transform skew-x-6 -mt-1 tracking-wider text-center">
              <div className="text-[9px] text-yellow-200">🏛️ NIKĒ</div>
              <span>ĐÍCH</span>
            </div>

            {/* Bottom Finish Flag - Ancient Greek Laurel & Victory */}
            <div className="bg-slate-950 text-amber-300 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-lg shadow-2xl border-2 border-amber-400 transform skew-x-6 -mb-1 tracking-wider flex items-center gap-1">
              <span>🏆 VICTORY</span>
            </div>
          </div>

          {/* 4. RUNNING HORSES FLOCK - ONLY RENDERED DURING ACTIVE RACING & COUNTDOWN */}
          {/* When modal (Winner, Question, Answer Result) is open, horses are completely hidden to avoid distraction */}
          {shouldRenderTrackHorses &&
            horseStates.map((horse) => {
              const student = students.find((s) => s.id === horse.studentId);
              if (!student) return null;

              const isLeading = horse.studentId === leadingHorse?.studentId && horse.xProgress > 8;
              const isSprinting = raceElapsedSec > 8.0 && isLeading;
              const isWinner = horse.xProgress >= 100 || (isPhotoFinish && horse.studentId === leadingHorse?.studentId);

              // Compute visual X position across field from Left (2%) to Finish Line (~80%)
              const leftPercent = Math.min(84, Math.max(1, (horse.xProgress / 100) * 80));
              const topPercent = horse.baseYPercent + horse.currentYOffset;

              // Depth Sorting (Y-Index): Horses with higher Y appear in front
              const zIndex = Math.round(topPercent * 10) + (isLeading ? 200 : 0);

              return (
                <div
                  key={horse.studentId}
                  className="absolute transition-transform duration-75 ease-linear will-change-transform flex items-center"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    zIndex,
                  }}
                >
                  <div className="relative group cursor-pointer">
                    {/* Galloping Race Horse */}
                    <Horse
                      number={student.horseNumber}
                      color={student.horseColor}
                      isRacing={gamePhase === 'RACING' && horse.xProgress < 100}
                      isWinner={isWinner}
                      isLeader={isLeading}
                      isSprinting={isSprinting}
                      size={students.length > 24 ? 'sm' : students.length > 10 ? 'md' : 'lg'}
                    />

                    {/* Leading Flame Indicator */}
                    {isLeading && gamePhase === 'RACING' && (
                      <div className="absolute -top-3.5 -right-2 flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-orange-500 border border-amber-200 px-1.5 py-0.5 rounded-full shadow-lg animate-bounce z-30">
                        <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                        <span className="text-[10px] font-black text-slate-950">#1</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Optional Teacher Roster Peek Overlay */}
      {showRosterOverlay && (
        <div className="p-4 bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl shadow-2xl animate-in fade-in z-20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Bảng Đối Chiếu Mã Số Ngựa & Học Sinh (Dành cho Giáo Viên)</span>
            </h4>
            <button
              onClick={() => setShowRosterOverlay(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
            >
              ✕ Đóng
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-44 overflow-y-auto">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs shadow"
              >
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] text-white shrink-0 shadow"
                  style={{ backgroundColor: s.horseColor }}
                >
                  {s.horseNumber}
                </span>
                <div className="truncate">
                  <p className="font-bold text-slate-200 truncate">{s.name}</p>
                  {s.className && <p className="text-[10px] text-slate-400 truncate">{s.className}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3D Countdown Gate Overlay */}
      {countdownNum !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-bounce">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 border-4 border-amber-300 shadow-2xl flex items-center justify-center mx-auto mb-4 glow-gold">
              <span className="text-5xl sm:text-7xl font-black text-white drop-shadow-lg tracking-wider">
                {countdownNum}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-widest drop-shadow">
              {countdownNum === 'XUẤT PHÁT!' ? '🔥 MỞ CỔNG ĐẤU TRƯỜNG (10 GIÂY)!' : '🏛️ CHUẨN BỊ XUẤT PHÁT...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
