'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, SkipForward, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';

const MODES = {
  focus:  { label: 'Fokus',         minutes: 25, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  short:  { label: 'Istirahat Singkat', minutes: 5,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  long:   { label: 'Istirahat Panjang', minutes: 15, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function FocusTimer() {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const totalTime = MODES[mode].minutes * 60;
  const progress = timeLeft / totalTime;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (!isMuted) playBeep();
            if (mode === 'focus') {
              setSessions(s => s + 1);
              setCompletedToday(c => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isMuted, mode]);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      [0, 0.3, 0.6].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.3);
      });
    } catch (e) {}
  };

  const changeMode = (m) => {
    clearInterval(intervalRef.current);
    setMode(m);
    setIsRunning(false);
    setTimeLeft(MODES[m].minutes * 60);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const skip = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(0);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const m = MODES[mode];

  return (
    <div className="timer-page animate-fade-in">
      <header>
        <h1>Focus Timer</h1>
        <p className="subtitle">Tingkatkan produktivitas dengan teknik Pomodoro.</p>
      </header>

      <div className="timer-layout">
        {/* Left: Timer */}
        <div className="timer-card glass">
          {/* Mode Selector */}
          <div className="mode-tabs">
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                className={`mode-tab ${mode === key ? 'active' : ''}`}
                style={mode === key ? { background: val.bg, color: val.color, borderColor: `${val.color}44` } : {}}
                onClick={() => changeMode(key)}
              >
                {key === 'focus' ? <Zap size={14} /> : <Coffee size={14} />}
                {val.label}
              </button>
            ))}
          </div>

          {/* Ring */}
          <div className="ring-wrap">
            <svg width="280" height="280" viewBox="0 0 280 280">
              <circle
                cx="140" cy="140" r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="12"
              />
              <circle
                cx="140" cy="140" r={RADIUS}
                fill="none"
                stroke={m.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="ring-center">
              <span className="time-display">{fmt(timeLeft)}</span>
              <span className="mode-label" style={{ color: m.color }}>{m.label.toUpperCase()}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <button className="ctrl-btn secondary" onClick={reset} title="Reset">
              <RotateCcw size={20} />
            </button>
            <button
              className="ctrl-btn play"
              style={{ background: isRunning ? 'rgba(255,255,255,0.1)' : m.color, boxShadow: isRunning ? 'none' : `0 0 30px ${m.color}55` }}
              onClick={() => setIsRunning(r => !r)}
            >
              {isRunning ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '3px' }} />}
            </button>
            <button className="ctrl-btn secondary" onClick={skip} title="Lewati">
              <SkipForward size={20} />
            </button>
          </div>

          {/* Mute */}
          <button className="mute-btn" onClick={() => setIsMuted(m => !m)}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isMuted ? 'Notifikasi Dimatikan' : 'Notifikasi Aktif'}
          </button>
        </div>

        {/* Right: Stats */}
        <div className="timer-side">
          <div className="glass side-card">
            <h3>Sesi Hari Ini</h3>
            <div className="session-grid">
              <div className="session-stat">
                <span className="ss-num" style={{ color: m.color }}>{completedToday}</span>
                <span className="ss-label">Sesi Selesai</span>
              </div>
              <div className="session-stat">
                <span className="ss-num">{completedToday * 25}</span>
                <span className="ss-label">Menit Fokus</span>
              </div>
            </div>

            <div className="pomodoros">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`pomo-dot ${i < completedToday ? 'filled' : ''}`}
                  style={i < completedToday ? { background: m.color, boxShadow: `0 0 8px ${m.color}88` } : {}}
                />
              ))}
            </div>
            <p className="pomo-hint">{completedToday}/8 sesi selesai</p>
          </div>

          <div className="glass side-card">
            <h3>Panduan Teknik</h3>
            <ol className="technique-steps">
              <li className={sessions >= 0 ? 'step-done' : ''}>
                <CheckCircle2 size={14} /> Fokus selama 25 menit
              </li>
              <li className={sessions >= 1 ? 'step-done' : ''}>
                <CheckCircle2 size={14} /> Istirahat singkat 5 menit
              </li>
              <li className={sessions >= 3 ? 'step-done' : ''}>
                <CheckCircle2 size={14} /> Setelah 4 sesi, istirahat 15 menit
              </li>
              <li className={sessions >= 4 ? 'step-done' : ''}>
                <CheckCircle2 size={14} /> Ulangi untuk hasil optimal
              </li>
            </ol>
          </div>

          <div className="glass side-card tips-card">
            <h3>💡 Tips Produktivitas</h3>
            <p>Jauhkan ponsel dari jangkauan saat sesi fokus. Distraksi kecil bisa membuang hingga 23 menit waktu fokus Anda.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timer-page { max-width: 1100px; margin: 0 auto; }
        .subtitle { color: var(--text-muted); margin-top: 0.25rem; margin-bottom: 2.5rem; }

        .timer-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 800px) {
          .timer-layout { grid-template-columns: 1fr; }
        }

        .timer-card {
          padding: 2rem;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .mode-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .mode-tab {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-tab:hover:not(.active) {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .ring-wrap {
          position: relative;
          width: 280px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ring-wrap svg { position: absolute; inset: 0; }
        .ring-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          z-index: 1;
        }
        .time-display {
          font-size: 4.5rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          letter-spacing: -2px;
        }
        .mode-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .ctrl-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .ctrl-btn.secondary {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .ctrl-btn.secondary:hover { background: rgba(255,255,255,0.1); color: white; }
        .ctrl-btn.play {
          width: 76px;
          height: 76px;
          color: white;
          transition: transform 0.15s, box-shadow 0.3s;
        }
        .ctrl-btn.play:hover { transform: scale(1.05); }

        .mute-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          padding: 0.45rem 1rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mute-btn:hover { border-color: rgba(255,255,255,0.2); color: white; }

        .timer-side { display: flex; flex-direction: column; gap: 1rem; }
        .side-card {
          padding: 1.5rem;
          border-radius: 16px;
        }
        .side-card h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.78rem;
        }
        .session-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .session-stat { display: flex; flex-direction: column; }
        .ss-num { font-size: 2.5rem; font-weight: 800; }
        .ss-label { font-size: 0.78rem; color: var(--text-muted); }

        .pomodoros {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }
        .pomo-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s;
        }
        .pomo-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .technique-steps {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          list-style: none;
          padding: 0;
          counter-reset: steps;
        }
        .technique-steps li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.875rem;
          color: var(--text-muted);
          transition: color 0.3s;
        }
        .technique-steps li.step-done { color: #10b981; }

        .tips-card p {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        h1 { font-size: 1.8rem; margin-bottom: 0; }
      `}</style>
    </div>
  );
}
