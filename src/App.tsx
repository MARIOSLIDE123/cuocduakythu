/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  Question,
  GameSettings,
  GamePhase,
  RoundResult,
} from './types';
import {
  DEFAULT_SETTINGS,
  INITIAL_STUDENTS,
  INITIAL_QUESTIONS,
} from './utils/demoData';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { StudentManager } from './components/StudentManager';
import { QuestionBank } from './components/QuestionBank';
import { GameSetup } from './components/GameSetup';
import { RaceTrack } from './components/RaceTrack';
import { WinnerModal } from './components/WinnerModal';
import { QuestionModal } from './components/QuestionModal';
import { AnswerResultModal } from './components/AnswerResultModal';
import { Leaderboard } from './components/Leaderboard';
import { GameResult } from './components/GameResult';
import { TeacherModeDrawer } from './components/TeacherModeDrawer';
import { sound } from './utils/soundEngine';

const STORAGE_KEYS = {
  SETTINGS: 'cdkt_game_settings_v2',
  STUDENTS: 'cdkt_students_v32',
  QUESTIONS: 'cdkt_questions_v5_pythagore',
  HISTORY: 'cdkt_history_v1',
  GAME_STATE: 'cdkt_state_v1',
};

export default function App() {
  // Load initial states from LocalStorage or defaults
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [history, setHistory] = useState<RoundResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Game Flow State
  const [gamePhase, setGamePhase] = useState<GamePhase>('LOBBY');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentWinner, setCurrentWinner] = useState<Student | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [lastAnswerData, setLastAnswerData] = useState<{
    selectedOptionIndex: number;
    isCorrect: boolean;
    pointsEarned: number;
  } | null>(null);

  // UI state
  const [isTeacherDrawerOpen, setIsTeacherDrawerOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {
      // Ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {
      // Ignore
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // Sync sound settings with audio engine
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Update Settings Partial
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('Khôi phục danh sách học sinh và câu hỏi mẫu mặc định?')) {
      setStudents(INITIAL_STUDENTS);
      setQuestions(INITIAL_QUESTIONS);
      setSettings(DEFAULT_SETTINGS);
      setHistory([]);
      sound.playCorrect();
    }
  };

  // Start a New Match
  const handleStartGame = () => {
    if (students.length === 0) {
      alert('Vui lòng thêm học sinh trước khi bắt đầu cuộc đua!');
      setGamePhase('STUDENTS');
      return;
    }
    if (questions.length === 0) {
      alert('Vui lòng thêm câu hỏi vào ngân hàng trước khi bắt đầu!');
      setGamePhase('QUESTIONS');
      return;
    }

    setCurrentRound(1);
    setUsedQuestionIds([]);
    setLastAnswerData(null);
    setCurrentWinner(null);
    setCurrentQuestion(null);
    setGamePhase('RACE_READY');
  };

  // Pick Next Question from Bank
  const pickNextQuestion = (): Question => {
    // Filter available questions not used in this match
    let available = questions.filter((q) => !usedQuestionIds.includes(q.id));
    if (available.length === 0) {
      // If all questions used, recycle
      available = [...questions];
      setUsedQuestionIds([]);
    }

    let selected: Question;
    if (settings.questionMode === 'random') {
      const randIdx = Math.floor(Math.random() * available.length);
      selected = available[randIdx];
    } else {
      selected = available[0];
    }

    setUsedQuestionIds((prev) => [...prev, selected.id]);
    return selected;
  };

  // Race Countdown trigger
  const handleStartCountdown = () => {
    if (gamePhase === 'RACE_READY') {
      setGamePhase('RACE_COUNTDOWN');
    } else if (gamePhase === 'RACE_COUNTDOWN') {
      setGamePhase('RACING');
    }
  };

  // Race Finished - Winner Reached Finish Line
  const handleRaceFinished = (winnerStudent: Student) => {
    setCurrentWinner(winnerStudent);
    // Update student racesWon count
    setStudents((prev) =>
      prev.map((s) => (s.id === winnerStudent.id ? { ...s, racesWon: s.racesWon + 1 } : s))
    );
    setGamePhase('WINNER_REVEAL');
  };

  // Move from Winner celebration to Question Screen
  const handleProceedToQuestion = () => {
    const q = pickNextQuestion();
    setCurrentQuestion(q);
    setGamePhase('QUESTION_ACTIVE');
  };

  // Reroll Question during active question
  const handleRerollQuestion = () => {
    const q = pickNextQuestion();
    setCurrentQuestion(q);
    sound.playClick();
  };

  // Skip question
  const handleSkipQuestion = () => {
    if (currentRound >= settings.totalQuestions) {
      setGamePhase('GAME_FINISH');
    } else {
      setCurrentRound((r) => r + 1);
      setGamePhase('RACE_READY');
    }
  };

  // Answer Submitted
  const handleAnswerSelected = (selectedOptionIndex: number, isCorrect: boolean) => {
    if (!currentWinner || !currentQuestion) return;

    const points = isCorrect ? currentQuestion.points || 10 : 0;

    // Update student score & accuracy stats
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === currentWinner.id) {
          return {
            ...s,
            score: s.score + points,
            correctAnswers: s.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: s.wrongAnswers + (isCorrect ? 0 : 1),
          };
        }
        return s;
      })
    );

    // Record round history
    const roundLog: RoundResult = {
      roundNumber: currentRound,
      winnerStudentId: currentWinner.id,
      winnerStudentName: currentWinner.name,
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      selectedAnswer: selectedOptionIndex,
      isCorrect,
      pointsAwarded: points,
      timestamp: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => [...prev, roundLog]);

    setLastAnswerData({
      selectedOptionIndex,
      isCorrect,
      pointsEarned: points,
    });

    setGamePhase('ANSWER_RESULT');
  };

  // Move to Next Round or Finish
  const handleNextRound = () => {
    if (currentRound >= settings.totalQuestions) {
      setGamePhase('GAME_FINISH');
    } else {
      setCurrentRound((r) => r + 1);
      setGamePhase('RACE_READY');
    }
  };

  // Retry same question (if setting allows)
  const handleRetryQuestion = () => {
    setGamePhase('QUESTION_ACTIVE');
  };

  // Teacher Force Manual Winner
  const handleForcePickWinner = (winnerStudent: Student) => {
    handleRaceFinished(winnerStudent);
  };

  // Reset Student Scores
  const handleResetScores = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        racesWon: 0,
      }))
    );
    setHistory([]);
  };

  // Full Wipe & Reset
  const handleResetAllData = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setQuestions(INITIAL_QUESTIONS);
    setSettings(DEFAULT_SETTINGS);
    setHistory([]);
    setGamePhase('LOBBY');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Navbar
        currentPhase={gamePhase}
        currentRound={currentRound}
        totalRounds={settings.totalQuestions}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onNavigate={(phase) => setGamePhase(phase)}
        onOpenTeacherDrawer={() => setIsTeacherDrawerOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Screen Views */}
      <main className="flex-1 w-full overflow-x-hidden flex flex-col justify-center">
        {gamePhase === 'LOBBY' && (
          <Home
            settings={settings}
            students={students}
            questions={questions}
            onNavigate={(phase) => setGamePhase(phase)}
            onStartGame={handleStartGame}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {gamePhase === 'STUDENTS' && (
          <StudentManager
            students={students}
            onUpdateStudents={setStudents}
            onConfirmAndPlay={handleStartGame}
          />
        )}

        {gamePhase === 'QUESTIONS' && (
          <QuestionBank questions={questions} onUpdateQuestions={setQuestions} />
        )}

        {gamePhase === 'SETUP' && (
          <GameSetup
            settings={settings}
            studentsCount={students.length}
            questionsCount={questions.length}
            onSaveSettings={(newSet) => setSettings(newSet)}
            onStartGame={handleStartGame}
          />
        )}

        {(gamePhase === 'RACE_READY' ||
          gamePhase === 'RACE_COUNTDOWN' ||
          gamePhase === 'RACING' ||
          gamePhase === 'WINNER_REVEAL' ||
          gamePhase === 'QUESTION_ACTIVE' ||
          gamePhase === 'ANSWER_RESULT') && (
          <RaceTrack
            students={students}
            settings={settings}
            currentRound={currentRound}
            totalRounds={settings.totalQuestions}
            gamePhase={gamePhase}
            onRaceFinished={handleRaceFinished}
            onStartCountdown={handleStartCountdown}
            onOpenTeacherDrawer={() => setIsTeacherDrawerOpen(true)}
          />
        )}

        {gamePhase === 'LEADERBOARD_ROUND' && (
          <Leaderboard
            students={students}
            history={history}
            settings={settings}
            currentRound={currentRound}
            totalRounds={settings.totalQuestions}
            onContinueGame={() => setGamePhase('RACE_READY')}
            onGoHome={() => setGamePhase('LOBBY')}
          />
        )}

        {gamePhase === 'GAME_FINISH' && (
          <GameResult
            students={students}
            history={history}
            settings={settings}
            onPlayAgain={handleStartGame}
            onGoHome={() => setGamePhase('LOBBY')}
          />
        )}
      </main>

      {/* OVERLAY MODALS */}

      {/* 1. Winner Reveal Modal */}
      {gamePhase === 'WINNER_REVEAL' && currentWinner && (
        <WinnerModal
          winner={currentWinner}
          roundNumber={currentRound}
          onProceedToQuestion={handleProceedToQuestion}
        />
      )}

      {/* 2. Active Question Modal */}
      {gamePhase === 'QUESTION_ACTIVE' && currentQuestion && currentWinner && (
        <QuestionModal
          question={currentQuestion}
          student={currentWinner}
          roundNumber={currentRound}
          totalRounds={settings.totalQuestions}
          settings={settings}
          onAnswerSelected={handleAnswerSelected}
          onRerollQuestion={handleRerollQuestion}
          onSkipQuestion={handleSkipQuestion}
        />
      )}

      {/* 3. Answer Result Modal */}
      {gamePhase === 'ANSWER_RESULT' && lastAnswerData && currentWinner && currentQuestion && (
        <AnswerResultModal
          isCorrect={lastAnswerData.isCorrect}
          student={currentWinner}
          question={currentQuestion}
          selectedOptionIndex={lastAnswerData.selectedOptionIndex}
          pointsEarned={lastAnswerData.pointsEarned}
          settings={settings}
          onNextRound={handleNextRound}
          onRetryQuestion={handleRetryQuestion}
        />
      )}

      {/* 4. Teacher Drawer Panel */}
      <TeacherModeDrawer
        isOpen={isTeacherDrawerOpen}
        onClose={() => setIsTeacherDrawerOpen(false)}
        students={students}
        currentRound={currentRound}
        totalRounds={settings.totalQuestions}
        gamePhase={gamePhase}
        settings={settings}
        onForcePickWinner={handleForcePickWinner}
        onSkipRound={handleSkipQuestion}
        onResetScores={handleResetScores}
        onResetGame={handleStartGame}
        onResetAllData={handleResetAllData}
        onJumpToLeaderboard={() => setGamePhase('LEADERBOARD_ROUND')}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
