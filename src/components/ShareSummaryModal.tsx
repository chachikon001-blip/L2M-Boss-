import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import type { Guild } from '../types.ts';
import { getResetCountdown } from '../utils/timer.ts';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  guilds: Guild[];
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  guilds,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const countdown = getResetCountdown();
  const clearedList = guilds.filter((g) => g.status);
  const pendingList = guilds.filter((g) => !g.status);
  const percent = guilds.length ? Math.round((clearedList.length / guilds.length) * 100) : 0;

  let summaryText = `⚔️ [Guild & Boss Tracker] รายงานสถานะตีบอสประจำสัปดาห์\n`;
  summaryText += `⏰ รีเซ็ตรอบถัดไป: วันพุธ 05:00 น. (เหลือ ${countdown.days} วัน ${countdown.hours} ชม.)\n`;
  summaryText += `📊 ความคืบหน้า: ตีแล้ว ${clearedList.length}/${guilds.length} กิลด์ (${percent}%)\n\n`;

  if (pendingList.length > 0) {
    summaryText += `❌ ยังไม่ได้ตี (${pendingList.length} กิลด์):\n`;
    pendingList.forEach((g) => {
      summaryText += `• ${g.name} (${g.level || 'ไม่ระบุ'}) - [${g.note}]${g.targetBoss ? ` (เป้าหมาย: ${g.targetBoss})` : ''}\n`;
    });
    summaryText += `\n`;
  } else {
    summaryText += `🎉 ยอดเยี่ยม! ตีบอสครบทุกกิลด์แล้วในสัปดาห์นี้\n\n`;
  }

  if (clearedList.length > 0) {
    summaryText += `✅ ตีเสร็จแล้ว (${clearedList.length} กิลด์):\n`;
    clearedList.forEach((g) => {
      summaryText += `• ${g.name} (${g.level || 'ไม่ระบุ'}) - [${g.note}]\n`;
    });
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = summaryText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ส่งสรุปสถานะ (LINE / Discord)</h2>
              <p className="text-xs text-slate-400">คัดลอกข้อความไปโพสต์ในกลุ่มหรือห้องแชทกิลด์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto selection:bg-indigo-600">
            {summaryText}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>คัดลอกสำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกข้อความ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
