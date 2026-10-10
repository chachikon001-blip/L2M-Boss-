import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Search, Filter, Sparkles, CheckCircle2, Clock, AlertCircle, RefreshCw, Clipboard, Check, X, Layers, ArrowUpDown } from 'lucide-react';
import type { Guild, StatusFilter, NoteFilter } from './types.ts';
import { INITIAL_GUILDS, EMBLEM_PRESETS } from './utils/presets.ts';
import { soundFx } from './utils/sound.ts';
import { getLastResetDate } from './utils/timer.ts';
import { parseGuildFromText, parseMultipleGuilds, type ParsedGuildText } from './utils/clipboard.ts';
import { ResetTimerCard } from './components/ResetTimerCard.tsx';
import { GuildCard } from './components/GuildCard.tsx';
import { GuildModal } from './components/GuildModal.tsx';
import { ShareSummaryModal } from './components/ShareSummaryModal.tsx';
import { DataBackupModal } from './components/DataBackupModal.tsx';
import { ClanEmblemPicker } from './components/ClanEmblemPicker.tsx';
import { RealtimeRoomBar } from './components/RealtimeRoomBar.tsx';
import { useRealtimeSync } from './utils/useRealtimeSync.ts';

const STORAGE_KEY = 'boss_tracker_guilds';
const LAST_CYCLE_KEY = 'boss_tracker_last_cycle_timestamp';

// Helper to extract numeric level from guild level string (e.g. "Lv. 10" -> 10, "2 คนเช็คชื่อ" -> 2)
function extractLevelNumber(levelStr: string): number {
  if (!levelStr) return 0;
  const match = levelStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Simple image compressor for clipboard images
function compressImage(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [guilds, setGuilds] = useState<Guild[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_GUILDS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundFx.enabled);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [noteFilter, setNoteFilter] = useState<NoteFilter>('all');
  const [sortLevelOrder, setSortLevelOrder] = useState<'desc' | 'asc'>('desc');

  // Modals
  const [isGuildModalOpen, setIsGuildModalOpen] = useState(false);
  const [editingGuild, setEditingGuild] = useState<Guild | null>(null);
  const [initialGuildData, setInitialGuildData] = useState<Partial<Guild> | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isEmblemGalleryOpen, setIsEmblemGalleryOpen] = useState(false);

  // Batch paste popup state
  const [batchPasteList, setBatchPasteList] = useState<ParsedGuildText[] | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }, []);

  // New cycle banner alert
  const [showNewCycleAlert, setShowNewCycleAlert] = useState(false);

  // Sync guilds with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guilds));
  }, [guilds]);

  const guildsRef = useRef<Guild[]>(guilds);
  useEffect(() => {
    guildsRef.current = guilds;
  }, [guilds]);

  // Real-time synchronization hook for multi-user collaboration
  const {
    isConnected,
    isSyncing,
    roomId,
    userCount,
    members,
    userName,
    setUserName,
    switchRoom,
    broadcastGuildsUpdate,
    broadcastToggleStatus,
    broadcastResetAll,
    broadcastMarkAllCleared,
    getShareableLink,
  } = useRealtimeSync({
    getCurrentGuilds: () => guildsRef.current,
    onRemoteGuildsUpdate: (remoteGuilds, senderName, actionDesc) => {
      setGuilds(remoteGuilds);
      soundFx.playCheck();
      showToast(`⚡ ${senderName}: ${actionDesc || 'อัปเดตข้อมูลกิลด์'}`);
    },
    onRemoteStatusChanged: (guildId, newStatus, guildName, senderName) => {
      setGuilds((prev) =>
        prev.map((g) =>
          g.id === guildId
            ? { ...g, status: newStatus, updatedAt: Date.now(), lastUpdatedBy: senderName }
            : g
        )
      );
      if (newStatus) {
        soundFx.playVictory();
        showToast(`🏆 ${senderName} ตีบอส "${guildName || 'กิลด์'}" สำเร็จแล้ว!`);
      } else {
        soundFx.playUncheck();
        showToast(`🔄 ${senderName} เปลี่ยน "${guildName || 'กิลด์'}" เป็น ยังไม่ได้ตี`);
      }
    },
    onRemoteResetAll: (senderName) => {
      setGuilds((prev) => prev.map((g) => ({ ...g, status: false, updatedAt: Date.now() })));
      soundFx.playReset();
      showToast(`⚠️ ${senderName} รีเซ็ตสถานะกิลด์ทั้งหมดกลับเป็น ยังไม่ได้ตี`);
    },
    onRemoteClearedAll: (senderName) => {
      setGuilds((prev) =>
        prev.map((g) => ({ ...g, status: true, updatedAt: Date.now(), lastUpdatedBy: senderName }))
      );
      soundFx.playVictory();
      showToast(`🎉 ${senderName} ทำเครื่องหมายว่าตีครบทุกกิลด์แล้ว!`);
    },
    onRemoteUserJoined: (joinedUser) => {
      showToast(`👋 ${joinedUser} ได้เข้าร่วมห้องเรียลไทม์`);
    },
  });

  // Global Ctrl+V listener
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // If modal is open or typing inside an input/textarea, let modal or input handle it
      if (isGuildModalOpen || isShareModalOpen || isBackupModalOpen || batchPasteList) {
        return;
      }

      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }

      // 1. Check for image in clipboard
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              const dataUrl = await compressImage(file, 256);
              if (dataUrl) {
                setEditingGuild(null);
                setInitialGuildData({ icon: dataUrl, name: '' });
                setIsGuildModalOpen(true);
                soundFx.playCheck();
                showToast('🖼️ กด Ctrl+V: วางรูปภาพกิลด์เรียบร้อยแล้ว!');
                return;
              }
            }
          }
        }
      }

      // 2. Check for text in clipboard
      const text = e.clipboardData?.getData('text');
      if (text && text.trim()) {
        e.preventDefault();
        const parsedList = parseMultipleGuilds(text);

        if (parsedList.length > 1) {
          // Multiple guilds detected
          setBatchPasteList(parsedList);
          soundFx.playCheck();
          showToast(`📋 ตรวจพบรายชื่อกิลด์ ${parsedList.length} รายการจากการกด Ctrl+V`);
        } else if (parsedList.length === 1) {
          // Single guild detected - immediately open Add Guild modal with name filled!
          const item = parsedList[0];
          setEditingGuild(null);
          setInitialGuildData({
            name: item.name,
            level: item.level || '1 คนเช็คชื่อ',
            note: item.note || '1.ของเข้าตัว',
            targetBoss: item.targetBoss || '',
          });
          setIsGuildModalOpen(true);
          soundFx.playCheck();
          showToast(`📋 กด Ctrl+V: เขียนชื่อกิลด์ "${item.name}" ให้อัตโนมัติแล้ว!`);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isGuildModalOpen, isShareModalOpen, isBackupModalOpen, batchPasteList, showToast]);

  // Check if a new Wednesday 05:00 AM cycle arrived
  useEffect(() => {
    const currentCycleStart = getLastResetDate().getTime();
    const recordedCycle = localStorage.getItem(LAST_CYCLE_KEY);

    if (!recordedCycle) {
      localStorage.setItem(LAST_CYCLE_KEY, String(currentCycleStart));
    } else {
      const lastRecorded = parseInt(recordedCycle, 10);
      if (currentCycleStart > lastRecorded) {
        const hasCleared = guilds.some((g) => g.status);
        if (hasCleared) {
          setShowNewCycleAlert(true);
        } else {
          localStorage.setItem(LAST_CYCLE_KEY, String(currentCycleStart));
        }
      }
    }
  }, [guilds]);

  const handleCycleReset = (shouldResetStatuses: boolean) => {
    const currentCycleStart = getLastResetDate().getTime();
    localStorage.setItem(LAST_CYCLE_KEY, String(currentCycleStart));
    if (shouldResetStatuses) {
      const updated = guilds.map((g) => ({ ...g, status: false, updatedAt: Date.now() }));
      setGuilds(updated);
      broadcastResetAll();
      soundFx.playReset();
      showToast('🔄 รีเซ็ตรอบสัปดาห์ใหม่เรียบร้อยแล้ว!');
    }
    setShowNewCycleAlert(false);
  };

  const handleToggleStatus = (id: string | number) => {
    let nextStatus = false;
    let targetGuildName = '';
    const updated = guilds.map((g) => {
      if (g.id === id) {
        nextStatus = !g.status;
        targetGuildName = g.name;
        return {
          ...g,
          status: nextStatus,
          updatedAt: Date.now(),
          lastUpdatedBy: userName,
        };
      }
      return g;
    });
    setGuilds(updated);
    broadcastToggleStatus(id, nextStatus, targetGuildName);
  };

  const handleSaveGuild = (
    guildData: Omit<Guild, 'id' | 'updatedAt'>,
    idToEdit?: string | number
  ) => {
    let nextGuilds: Guild[];
    if (idToEdit !== undefined && idToEdit !== null) {
      nextGuilds = guilds.map((g) =>
        g.id === idToEdit
          ? { ...g, ...guildData, updatedAt: Date.now(), lastUpdatedBy: userName }
          : g
      );
    } else {
      const newGuild: Guild = {
        ...guildData,
        id: Date.now(),
        updatedAt: Date.now(),
        lastUpdatedBy: userName,
      };
      nextGuilds = [newGuild, ...guilds];
    }
    setGuilds(nextGuilds);
    broadcastGuildsUpdate(
      nextGuilds,
      idToEdit ? `แก้ไขข้อมูลกิลด์ "${guildData.name}"` : `เพิ่มกิลด์ใหม่ "${guildData.name}"`
    );
    setInitialGuildData(null);
  };

  const handleConfirmBatchPaste = () => {
    if (!batchPasteList || batchPasteList.length === 0) return;

    const newGuilds: Guild[] = batchPasteList.map((item, idx) => ({
      id: Date.now() + idx,
      name: item.name,
      level: item.level || '1 คนเช็คชื่อ',
      icon: EMBLEM_PRESETS[idx % EMBLEM_PRESETS.length].url,
      note: item.note || '1.ของเข้าตัว',
      targetBoss: item.targetBoss,
      status: false,
      updatedAt: Date.now(),
      lastUpdatedBy: userName,
    }));

    const nextGuilds = [...newGuilds, ...guilds];
    setGuilds(nextGuilds);
    broadcastGuildsUpdate(nextGuilds, `เพิ่มกิลด์ ${newGuilds.length} รายการ (Ctrl+V)`);
    soundFx.playVictory();
    showToast(`🎉 เพิ่มกิลด์ทั้งหมด ${newGuilds.length} รายการเรียบร้อยแล้ว!`);
    setBatchPasteList(null);
  };

  const handleDeleteGuild = (id: string | number) => {
    const deleted = guilds.find((g) => g.id === id);
    const remaining = guilds.filter((g) => g.id !== id);
    setGuilds(remaining);
    broadcastGuildsUpdate(remaining, `ลบกิลด์ "${deleted?.name || ''}"`);
    showToast(`ลบกิลด์ "${deleted?.name || ''}" สำเร็จ`);
  };

  const handleResetAll = () => {
    const updated = guilds.map((g) => ({ ...g, status: false, updatedAt: Date.now() }));
    setGuilds(updated);
    broadcastResetAll();
    showToast('🔄 รีเซ็ตกิลด์ทั้งหมดเป็น "ยังไม่ได้ตี" สำเร็จ');
  };

  const handleMarkAllCleared = () => {
    const updated = guilds.map((g) => ({
      ...g,
      status: true,
      updatedAt: Date.now(),
      lastUpdatedBy: userName,
    }));
    setGuilds(updated);
    broadcastMarkAllCleared();
    showToast('🎉 ทำเครื่องหมายกิลด์ทั้งหมดเป็น "ตีแล้ว" สำเร็จ');
  };

  const handleToggleSound = () => {
    const nextState = soundFx.toggle();
    setSoundEnabled(nextState);
  };

  const handleImportGuilds = (imported: Guild[]) => {
    setGuilds(imported);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    broadcastGuildsUpdate(imported, 'นำเข้าไฟล์สำรองข้อมูลกิลด์');
  };

  const handleResetToDefaults = () => {
    setGuilds(INITIAL_GUILDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GUILDS));
    broadcastGuildsUpdate(INITIAL_GUILDS, 'รีเซ็ตข้อมูลเป็นค่าเริ่มต้น');
  };

  // Filter and sort guilds:
  // 1. Unbeaten ("ยังไม่ได้ตี" / status === false) ALWAYS on top
  // 2. Sort by Guild Lv. (level number)
  // 3. Alphabetical name fallback
  const filteredGuilds = useMemo(() => {
    const list = guilds.filter((guild) => {
      // Search
      const matchesSearch =
        searchQuery.trim() === '' ||
        guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guild.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guild.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guild.targetBoss && guild.targetBoss.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status
      if (statusFilter === 'pending' && guild.status) return false;
      if (statusFilter === 'cleared' && !guild.status) return false;

      // Note category
      if (noteFilter === 'personal' && !guild.note.includes('1.ของเข้าตัว') && !guild.note.includes('1. ของเข้าตัว')) return false;
      if (noteFilter === 'guild' && !guild.note.includes('2.เข้ากิล') && !guild.note.includes('2. เข้ากิล')) return false;
      if (noteFilter === 'other' && !guild.note.includes('3.อื่นๆ') && !guild.note.includes('3. อื่นๆ')) return false;

      return true;
    });

    return list.sort((a, b) => {
      // Primary: Unbeaten ("ยังไม่ได้ตี") on top!
      if (a.status !== b.status) {
        return a.status ? 1 : -1;
      }

      // Secondary: Sort by Guild Level
      const lvA = extractLevelNumber(a.level);
      const lvB = extractLevelNumber(b.level);
      if (lvA !== lvB) {
        return sortLevelOrder === 'desc' ? lvB - lvA : lvA - lvB;
      }

      // Tertiary: Alphabetical Name
      return a.name.localeCompare(b.name, 'th');
    });
  }, [guilds, searchQuery, statusFilter, noteFilter, sortLevelOrder]);

  const clearedCount = guilds.filter((g) => g.status).length;
  const pendingCount = guilds.length - clearedCount;
  const progressPercent = guilds.length ? Math.round((clearedCount / guilds.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-indigo-900/95 border border-indigo-400 text-white px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs md:text-sm font-semibold animate-fade-in pointer-events-none">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Weekly Reset Notification Banner if a new cycle arrived */}
        {showNewCycleAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">รอบสัปดาห์ใหม่มาถึงแล้ว! (วันพุธ 05:00 น.)</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  คุณต้องการรีเซ็ตสถานะกิลด์ทั้งหมดกลับเป็น "ยังไม่ได้ตี" สำหรับสัปดาห์นี้หรือไม่?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCycleReset(false)}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                เก็บสถานะเดิมไว้
              </button>
              <button
                onClick={() => handleCycleReset(true)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเซ็ตสัปดาห์ใหม่ทันที</span>
              </button>
            </div>
          </div>
        )}

        {/* Real-time Multi-User Room Sync & Live Link Sharing */}
        <RealtimeRoomBar
          isConnected={isConnected}
          isSyncing={isSyncing}
          roomId={roomId}
          userCount={userCount}
          members={members}
          userName={userName}
          onUpdateUserName={setUserName}
          onSwitchRoom={switchRoom}
          getShareableLink={getShareableLink}
          showToast={showToast}
        />

        {/* Header & Weekly Reset Countdown */}
        <ResetTimerCard
          onResetAll={handleResetAll}
          onMarkAllCleared={handleMarkAllCleared}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          onOpenEmblemsModal={() => setIsEmblemGalleryOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          totalCount={guilds.length}
          clearedCount={clearedCount}
        />

        {/* Progress & Quick Stats Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 mb-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                สรุปความคืบหน้ารวม
              </span>
              <span className="text-xs font-bold text-indigo-400 font-mono tabular-nums">
                {clearedCount}/{guilds.length} กิลด์ ({progressPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="text-slate-400">
                ยังไม่ตี: <strong className="text-amber-400 font-mono tabular-nums">{pendingCount}</strong>
              </span>
              <span className="text-slate-400">
                ตีเสร็จแล้ว: <strong className="text-emerald-400 font-mono tabular-nums">{clearedCount}</strong>
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Search, Filter Tabs & Add Guild Action Bar */}
        <div className="space-y-3.5 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหากิลด์, เลเวล, ของดรอป, บอส..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Quick Actions & Add Guild Button */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
                <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>กด <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-indigo-300 border border-slate-700">Ctrl+V</kbd> เขียนชื่อกิลด์ได้ทันที</span>
              </div>

              <button
                onClick={() => {
                  setEditingGuild(null);
                  setInitialGuildData(null);
                  setIsGuildModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0 text-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มกิลด์ใหม่</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            {/* Status Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ทั้งหมด ({guilds.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ยังไม่ได้ตี ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('cleared')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  statusFilter === 'cleared'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ตีแล้ว ({clearedCount})
              </button>
            </div>

            {/* Drop note filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto pb-1 sm:pb-0">
              <span className="hidden md:inline mr-1 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                ของดรอป:
              </span>
              <button
                onClick={() => setNoteFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap border ${
                  noteFilter === 'all'
                    ? 'bg-slate-800 border-slate-600 text-white font-medium'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setNoteFilter('personal')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap border ${
                  noteFilter === 'personal'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-medium'
                    : 'border-transparent text-slate-400 hover:text-emerald-300'
                }`}
              >
                🎒 ของเข้าตัว
              </button>
              <button
                onClick={() => setNoteFilter('guild')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap border ${
                  noteFilter === 'guild'
                    ? 'bg-sky-950/70 border-sky-500/50 text-sky-300 font-medium'
                    : 'border-transparent text-slate-400 hover:text-sky-300'
                }`}
              >
                🏰 เข้ากิล
              </button>
              <button
                onClick={() => setNoteFilter('other')}
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap border ${
                  noteFilter === 'other'
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 font-medium'
                    : 'border-transparent text-slate-400 hover:text-amber-300'
                }`}
              >
                ❓ อื่นๆ
              </button>
            </div>

            {/* Sort Toggle Button */}
            <button
              onClick={() => {
                const nextOrder = sortLevelOrder === 'desc' ? 'asc' : 'desc';
                setSortLevelOrder(nextOrder);
                soundFx.playCheck();
                showToast(`🔄 เรียงลำดับ: ยังไม่ตีไว้บนสุด · Lv. ${nextOrder === 'desc' ? 'มาก ➔ น้อย' : 'น้อย ➔ มาก'}`);
              }}
              title="กดเพื่อสลับการเรียงระดับเลเวล (มากไปน้อย / น้อยไปมาก)"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm ml-auto sm:ml-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>ยังไม่ตีบนสุด · Lv. {sortLevelOrder === 'desc' ? 'มาก ➔ น้อย' : 'น้อย ➔ มาก'}</span>
            </button>
          </div>
        </div>

        {/* Guild Cards Grid */}
        {filteredGuilds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuilds.map((guild) => (
              <GuildCard
                key={guild.id}
                guild={guild}
                onToggleStatus={handleToggleStatus}
                onEditGuild={(g) => {
                  setEditingGuild(g);
                  setInitialGuildData(null);
                  setIsGuildModalOpen(true);
                }}
                onDeleteGuild={handleDeleteGuild}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-10 text-center max-w-md mx-auto my-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">ไม่พบข้อมูลกิลด์</h3>
            <p className="text-xs text-slate-400 mb-4">
              {searchQuery || statusFilter !== 'all' || noteFilter !== 'all'
                ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง'
                : 'ยังไม่มีรายการกิลด์ในระบบ เริ่มต้นสร้างกิลด์แรกได้เลย (หรือกด Ctrl+V เพื่อวางชื่อ)'}
            </p>
            {searchQuery || statusFilter !== 'all' || noteFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setNoteFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingGuild(null);
                  setInitialGuildData(null);
                  setIsGuildModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                เพิ่มกิลด์แรก
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Guild & Boss Tracker · ระบบจดบันทึกบอสประจำสัปดาห์</span>
          <span>รีเซ็ตอัตโนมัติทุกวันพุธ เวลา 05:00 น. · รองรับ Ctrl+V นำเข้าชื่อและรูป</span>
        </div>
      </footer>

      {/* Modals */}
      <GuildModal
        isOpen={isGuildModalOpen}
        onClose={() => {
          setIsGuildModalOpen(false);
          setEditingGuild(null);
          setInitialGuildData(null);
        }}
        onSave={handleSaveGuild}
        editingGuild={editingGuild}
        initialGuildData={initialGuildData}
      />

      {/* Batch Paste Import Confirmation Modal */}
      {batchPasteList && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <Layers className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">ตรวจพบรายชื่อกิลด์ ({batchPasteList.length} รายการ)</h3>
              </div>
              <button
                onClick={() => setBatchPasteList(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              คุณได้กด Ctrl+V วางข้อความหลายบรรทัด ต้องการเพิ่มกิลด์ทั้งหมดนี้เข้าสู่ระบบทันทีหรือไม่?
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-4">
              {batchPasteList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-200 py-0.5 border-b border-slate-800/60 last:border-0">
                  <span className="font-semibold text-white">{idx + 1}. {item.name}</span>
                  <span className="text-slate-400 text-[11px]">{item.level || '1 คนเช็คชื่อ'}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setBatchPasteList(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmBatchPaste}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>เพิ่มทั้งหมด ({batchPasteList.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareSummaryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        guilds={guilds}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        guilds={guilds}
        onImportGuilds={handleImportGuilds}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Global 135 Clan Emblem Gallery */}
      <ClanEmblemPicker
        isOpen={isEmblemGalleryOpen}
        onClose={() => setIsEmblemGalleryOpen(false)}
        selectedDataUrl=""
        onSelectEmblem={(dataUrl, emblem) => {
          setIsEmblemGalleryOpen(false);
          setEditingGuild(null);
          setInitialGuildData({ icon: dataUrl, name: '' });
          setIsGuildModalOpen(true);
          soundFx.playCheck();
          showToast(`✨ เลือก ${emblem.label} (${emblem.name}) พร้อมสำหรับเพิ่มกิลด์ใหม่!`);
        }}
      />
    </div>
  );
}

