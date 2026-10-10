import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Volume2, VolumeX, Share2, Database, ShieldAlert, CheckCheck, Grid } from 'lucide-react';
import { getResetCountdown, type ResetCountdown } from '../utils/timer.ts';
import { soundFx } from '../utils/sound.ts';

interface ResetTimerCardProps {
  onResetAll: () => void;
  onMarkAllCleared: () => void;
  onOpenShareModal: () => void;
  onOpenBackupModal: () => void;
  onOpenEmblemsModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalCount: number;
  clearedCount: number;
}

export const ResetTimerCard: React.FC<ResetTimerCardProps> = ({
  onResetAll,
  onMarkAllCleared,
  onOpenShareModal,
  onOpenBackupModal,
  onOpenEmblemsModal,
  soundEnabled,
  onToggleSound,
  totalCount,
  clearedCount,
}) => {
  const [countdown, setCountdown] = useState<ResetCountdown>(() => getResetCountdown());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getResetCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConfirmReset = () => {
    soundFx.playReset();
    onResetAll();
    setShowResetConfirm(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md relative overflow-hidden mb-6">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <span className="text-xs font-medium text-slate-400">
            รอบประจำสัปดาห์: <span className="text-slate-200 font-semibold">{countdown.nextResetFormatted}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              soundEnabled
                ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'เปิดเสียง' : 'ปิดเสียง'}</span>
          </button>

          <button
            onClick={onOpenEmblemsModal}
            className="p-2 px-3 rounded-xl text-xs font-medium bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 transition-colors flex items-center gap-1.5 hover:text-white"
            title="ดูตราสัญลักษณ์แคลนทั้งหมด 135 แบบจากในเกม"
          >
            <Grid className="w-3.5 h-3.5 text-amber-400" />
            <span>ตราแคลน (135)</span>
          </button>

          <button
            onClick={onOpenShareModal}
            className="p-2 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 hover:text-white"
            title="สร้างข้อความสรุปสำหรับ LINE / Discord"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>คัดลอกส่งไลน์</span>
          </button>

          <button
            onClick={onOpenBackupModal}
            className="p-2 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 hover:text-white"
            title="สำรองข้อมูล JSON หรือ กู้คืน"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">สำรองข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Main Title & Hero Banner */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-inner">
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            Guild & Boss Tracker
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1.5">
          ระบบจดบันทึกและติดตามการตีบอสประจำสัปดาห์ เช็คสถานะรายกิลด์ พร้อมแจ้งเตือนรอบรีเซ็ต
        </p>
      </div>

      {/* Countdown Display Box */}
      <div className="max-w-xl mx-auto bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 md:p-5 shadow-inner text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>เวลารีเซ็ตสัปดาห์ถัดไป (วันพุธ 05:00 น.)</span>
        </div>

        {/* Big Digit Blocks */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-md mx-auto mb-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-amber-400">
              {String(countdown.days).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 font-medium">วัน</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-amber-400">
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 font-medium">ชั่วโมง</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-amber-400">
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 font-medium">นาที</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-amber-400">
              {String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 font-medium">วินาที</span>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 max-w-md mx-auto">
          <div
            className="bg-gradient-to-r from-indigo-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${countdown.progressPercent}%` }}
            title={`ความคืบหน้าของรอบสัปดาห์นี้ ${countdown.progressPercent.toFixed(1)}%`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 max-w-md mx-auto mt-1 px-1">
          <span>พุธ 05:00 น. เริ่มรอบ</span>
          <span>เหลือก่อนรีเซ็ต: {countdown.days} วัน {countdown.hours} ชม.</span>
        </div>
      </div>

      {/* Batch Actions & Confirmation Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {clearedCount > 0 && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700/50 text-slate-300 hover:text-rose-300 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>รีเซ็ตสถานะทั้งหมด</span>
            </button>
          )}

          {totalCount > clearedCount && (
            <button
              onClick={() => {
                soundFx.playVictory();
                onMarkAllCleared();
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-700/50 text-slate-300 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ทำเครื่องหมายว่าตีครบทั้งหมด</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400">
          ตีบอสเสร็จแล้ว{' '}
          <span className="font-mono tabular-nums font-bold text-emerald-400">{clearedCount}</span> /{' '}
          <span className="font-mono tabular-nums font-bold text-slate-200">{totalCount}</span> กิลด์
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      {showResetConfirm && (
        <div className="mt-4 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 text-rose-200 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>ยืนยันรีเซ็ตสถานะทุกกิลด์กลับเป็น "ยังไม่ได้ตี" ใช่หรือไม่? (ข้อมูลกิลด์จะไม่ถูกลบ)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors shadow-md shadow-rose-600/30"
            >
              ยืนยันรีเซ็ต
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
