import React, { useState, useMemo } from 'react';
import { Users, Link2, Copy, Check, Radio, Edit3, Sparkles, RefreshCw, LogIn } from 'lucide-react';
import type { RoomMember } from '../utils/useRealtimeSync.ts';
import { soundFx } from '../utils/sound.ts';

interface RealtimeRoomBarProps {
  isConnected: boolean;
  isSyncing: boolean;
  roomId: string;
  userCount: number;
  members: RoomMember[];
  userName: string;
  onUpdateUserName: (name: string) => void;
  onSwitchRoom: (roomId: string) => void;
  getShareableLink: () => string;
  showToast: (msg: string) => void;
}

export const RealtimeRoomBar: React.FC<RealtimeRoomBarProps> = ({
  isConnected,
  isSyncing,
  roomId,
  userCount,
  members,
  userName,
  onUpdateUserName,
  onSwitchRoom,
  getShareableLink,
  showToast,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [newUserNameInput, setNewUserNameInput] = useState('');

  // Strictly deduplicate members by id to guarantee unique items
  const uniqueMembers = useMemo(() => {
    if (!Array.isArray(members)) return [];
    const map = new Map<string, RoomMember>();
    for (const m of members) {
      if (m && m.id && !map.has(m.id)) {
        map.set(m.id, m);
      }
    }
    return Array.from(map.values());
  }, [members]);

  const handleCopyLink = async () => {
    const link = getShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      soundFx.playCheck();
      showToast(`🔗 คัดลอกลิงก์ห้อง "${roomId}" เรียบร้อย! ส่งให้เพื่อนเพื่อดูและอัปเดตแบบเรียลไทม์พร้อมกันได้ทันที`);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      // Fallback
      showToast(`คัดลอกลิงก์: ${link}`);
    }
  };

  const handleOpenRoomSettings = () => {
    setNewRoomInput(roomId);
    setNewUserNameInput(userName);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoomSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserNameInput.trim()) {
      onUpdateUserName(newUserNameInput.trim());
    }
    if (newRoomInput.trim() && newRoomInput.trim().toLowerCase() !== roomId) {
      onSwitchRoom(newRoomInput.trim().toLowerCase());
      showToast(`เข้าสู่ห้อง "${newRoomInput.trim().toLowerCase()}" เรียบร้อยแล้ว!`);
    }
    setIsRoomModalOpen(false);
  };

  const handleGenerateRandomRoom = () => {
    const randomCode = `guild-${Math.floor(1000 + Math.random() * 9000)}`;
    setNewRoomInput(randomCode);
  };

  return (
    <>
      <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-3 md:p-3.5 mb-6 backdrop-blur-md shadow-lg shadow-indigo-950/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          {/* Left: Connection Status & Room Info */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
              </span>
              <span className="font-semibold text-slate-300">
                {isConnected ? 'เรียลไทม์ออนไลน์' : 'กำลังเชื่อมต่อ...'}
              </span>
              {isSyncing && (
                <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 animate-pulse ml-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  ซิงก์
                </span>
              )}
            </div>

            {/* Room Identifier */}
            <button
              onClick={handleOpenRoomSettings}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/30 text-xs text-indigo-300 transition-all hover:text-white"
              title="คลิกเพื่อเปลี่ยนห้อง หรือเปลี่ยนชื่อผู้ใช้ของคุณ"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>ห้อง:</span>
              <strong className="text-white font-mono bg-indigo-900/80 px-1.5 py-0.5 rounded text-[11px] border border-indigo-400/30">
                {roomId}
              </strong>
              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 ml-0.5" />
            </button>

            {/* Active Members Counter & Avatars */}
            <div
              onClick={handleOpenRoomSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700 transition-colors"
              title={`เพื่อนออนไลน์ในห้องนี้: ${uniqueMembers.map((m) => m.name).join(', ') || userName}`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>ออนไลน์:</span>
              <span className="font-bold text-cyan-300 font-mono">
                {Math.max(userCount, uniqueMembers.length, 1)} คน
              </span>

              {/* Mini member avatar dots */}
              <div className="flex -space-x-1.5 ml-1">
                {uniqueMembers.slice(0, 4).map((member, index) => (
                  <div
                    key={`${member.id}-${index}`}
                    style={{ backgroundColor: member.color }}
                    className="w-4 h-4 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[9px] font-bold text-white uppercase shadow-sm"
                    title={member.name}
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>

            {/* Current user name tag */}
            <button
              onClick={handleOpenRoomSettings}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <span>คุณคือ:</span>
              <strong className="text-slate-200">{userName}</strong>
            </button>
          </div>

          {/* Right: 1-Click Share Link to Friends */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                isCopied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 border border-emerald-400'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 border border-indigo-400/40'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>คัดลอกลิงก์แล้ว!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-indigo-200" />
                  <span>คัดลอกลิงก์ส่งให้เพื่อน</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Room Settings & Switch Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    ตั้งค่าห้องติดตามบอสแบบเรียลไทม์
                  </h3>
                  <p className="text-xs text-slate-400">
                    ทุกคนที่อยู่ในรหัสห้องเดียวกันจะเห็นการอัปเดตพร้อมกันแบบสดๆ
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveRoomSettings} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อเล่นของคุณ (เพื่อแสดงให้เพื่อนเห็นว่าใครตีบอส)
                </label>
                <input
                  type="text"
                  value={newUserNameInput}
                  onChange={(e) => setNewUserNameInput(e.target.value)}
                  placeholder="เช่น ปอนด์ มือตีบอส, กัปตันแจ็ค"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Room Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    รหัสห้อง (Room ID)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomRoom}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>สุ่มรหัสห้องใหม่</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value)}
                  placeholder="เช่น myguild, crows-1, boss-th"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  เคล็ดลับ: ตั้งชื่อตามกิลด์ของคุณ แล้วส่งลิงก์ห้องให้เพื่อนในดิสคอร์ดหรือไลน์
                </p>
              </div>

              {/* Member list in current room */}
              {uniqueMembers.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    เพื่อนที่กำลังออนไลน์ในห้องนี้ ({uniqueMembers.length} คน):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueMembers.map((m, index) => (
                      <div
                        key={`${m.id}-${index}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                      >
                        <span
                          style={{ backgroundColor: m.color }}
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                        />
                        <span className="font-medium">{m.name}</span>
                        {m.name === userName && (
                          <span className="text-[10px] text-indigo-400">(คุณ)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs md:text-sm font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <LogIn className="w-4 h-4" />
                  <span>บันทึก & เข้าร่วม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
