import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Users,
  HelpCircle,
  Trophy,
  Home,
  Sliders,
  Flag,
} from 'lucide-react';
import { GamePhase, GameSettings } from '../types';
import { sound } from '../utils/soundEngine';

interface NavbarProps {
  currentPhase: GamePhase;
  currentRound: number;
  totalRounds: number;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onNavigate: (phase: GamePhase) => void;
  onOpenTeacherDrawer: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPhase,
  currentRound,
  totalRounds,
  settings,
  onUpdateSettings,
  onNavigate,
  onOpenTeacherDrawer,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  const toggleSound = () => {
    const nextState = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextState });
    sound.setEnabled(nextState);
    if (nextState) sound.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ soundVolume: val });
    sound.setVolume(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
      {/* Brand Title */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('LOBBY');
          }}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          title="Về màn hình chính"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🏇</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 text-sm sm:text-base tracking-wide uppercase">
                {settings.gameTitle || 'CUỘC ĐUA KỲ THÚ'}
              </h1>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {settings.className} • {settings.teacherName}
            </p>
          </div>
        </button>

        {/* Round Badge during Game */}
        {currentPhase !== 'LOBBY' && currentPhase !== 'SETUP' && currentPhase !== 'STUDENTS' && currentPhase !== 'QUESTIONS' && (
          <div className="ml-2 sm:ml-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-inner">
            <Flag className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Vòng {currentRound} / {totalRounds}</span>
          </div>
        )}
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Navigation Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => { sound.playClick(); onNavigate('LOBBY'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentPhase === 'LOBBY' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </button>
          <button
            onClick={() => { sound.playClick(); onNavigate('STUDENTS'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentPhase === 'STUDENTS' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Học sinh
          </button>
          <button
            onClick={() => { sound.playClick(); onNavigate('QUESTIONS'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentPhase === 'QUESTIONS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Câu hỏi
          </button>
          <button
            onClick={() => { sound.playClick(); onNavigate('SETUP'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentPhase === 'SETUP' ? 'bg-slate-700 text-white shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Cài đặt
          </button>
          <button
            onClick={() => { sound.playClick(); onNavigate('LEADERBOARD_ROUND'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentPhase === 'LEADERBOARD_ROUND' ? 'bg-yellow-500 text-slate-950 shadow' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            BXH
          </button>
        </div>

        {/* Sound Control */}
        <div className="relative">
          <button
            onClick={toggleSound}
            onMouseEnter={() => setShowVolumePopup(true)}
            className={`p-2 rounded-xl border transition-all ${
              settings.soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
                : 'bg-slate-800/40 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={settings.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Volume Slider Popup */}
          {showVolumePopup && settings.soundEnabled && (
            <div
              onMouseLeave={() => setShowVolumePopup(false)}
              className="absolute right-0 top-full mt-2 p-3 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl flex items-center gap-2 z-50 min-w-[150px]"
            >
              <span className="text-[10px] font-bold text-slate-400">Âm lượng</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] font-bold text-amber-400">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleFullscreen();
          }}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 hover:bg-slate-700 hover:text-cyan-300 transition-all"
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình (F11)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Teacher Mode Drawer Toggle Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenTeacherDrawer();
          }}
          className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          title="Mở bảng điều khiển giáo viên"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Giáo Viên</span>
        </button>
      </div>
    </header>
  );
};
