import React, { useState, useEffect, useRef } from 'react';
import { X, Shield, Plus, Check, Camera, Upload, Image as ImageIcon, Sparkles, ClipboardPaste, Grid } from 'lucide-react';
import type { Guild } from '../types.ts';
import { EMBLEM_PRESETS } from '../utils/presets.ts';
import { ALL_CLAN_EMBLEMS, type ClanEmblem } from '../utils/clanEmblems.ts';
import { ClanEmblemPicker } from './ClanEmblemPicker.tsx';
import { soundFx } from '../utils/sound.ts';
import { parseGuildFromText } from '../utils/clipboard.ts';

interface GuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guildData: Omit<Guild, 'id' | 'updatedAt'>, idToEdit?: string | number) => void;
  editingGuild?: Guild | null;
  initialGuildData?: Partial<Guild> | null;
}

// Compress uploaded image to compact 256px square/fitted thumbnail for fast localStorage storage
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

export const GuildModal: React.FC<GuildModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGuild,
  initialGuildData,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [icon, setIcon] = useState('');
  const [noteType, setNoteType] = useState('1.ของเข้าตัว');
  const [customNote, setCustomNote] = useState('');
  const [targetBoss, setTargetBoss] = useState('');
  const [status, setStatus] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Check if current icon matches any of the 135 clan emblems
  const currentEmblemMatch = ALL_CLAN_EMBLEMS.find((e) => e.dataUrl === icon);

  useEffect(() => {
    if (editingGuild) {
      setName(editingGuild.name || '');
      setLevel(editingGuild.level || '');
      setIcon(editingGuild.icon || '');
      setTargetBoss(editingGuild.targetBoss || '');
      setStatus(editingGuild.status || false);

      if (editingGuild.note.startsWith('1.ของเข้าตัว') || editingGuild.note.startsWith('1. ของเข้าตัว')) {
        setNoteType('1.ของเข้าตัว');
        setCustomNote('');
      } else if (editingGuild.note.startsWith('2.เข้ากิล') || editingGuild.note.startsWith('2. เข้ากิล')) {
        setNoteType('2.เข้ากิล');
        setCustomNote('');
      } else {
        setNoteType('3.อื่นๆ');
        const extracted = editingGuild.note.replace(/^3\.\s*อื่นๆ[:\s-]*/i, '');
        setCustomNote(extracted);
      }
    } else if (initialGuildData) {
      setName(initialGuildData.name || '');
      setLevel(initialGuildData.level || '1 คนเช็คชื่อ');
      setIcon(initialGuildData.icon || EMBLEM_PRESETS[0].url);
      setNoteType(initialGuildData.note || '1.ของเข้าตัว');
      setCustomNote('');
      setTargetBoss(initialGuildData.targetBoss || '');
      setStatus(initialGuildData.status || false);
    } else {
      setName('');
      setLevel('1 คนเช็คชื่อ');
      setIcon(EMBLEM_PRESETS[0].url);
      setNoteType('1.ของเข้าตัว');
      setCustomNote('');
      setTargetBoss('');
      setStatus(false);
    }
    setShowUrlInput(false);
    setPasteNotice(null);

    // Auto-focus name input if modal opened
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [editingGuild, initialGuildData, isOpen]);

  // Handle Ctrl+V inside the modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
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
                setIcon(dataUrl);
                soundFx.playCheck();
                setPasteNotice('🖼️ วางรูปภาพตรากิลด์จากคลิปบอร์ดสำเร็จ!');
                setTimeout(() => setPasteNotice(null), 3000);
                return;
              }
            }
          }
        }
      }

      // 2. Check for text in clipboard
      const target = e.target as HTMLElement;
      // If user is focused on level or custom note, let normal typing happen
      if (target && (target.id === 'guild-level' || target.id === 'custom-note' || target.id === 'target-boss')) {
        return;
      }

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && pastedText.trim()) {
        const parsed = parseGuildFromText(pastedText);
        if (parsed.name) {
          e.preventDefault();
          setName(parsed.name);
          if (parsed.level) setLevel(parsed.level);
          if (parsed.note) setNoteType(parsed.note);
          if (parsed.targetBoss) setTargetBoss(parsed.targetBoss);

          soundFx.playCheck();
          setPasteNotice(`📋 วางชื่อกิลด์สำเร็จ: "${parsed.name}"`);
          setTimeout(() => setPasteNotice(null), 3000);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasteFromClipboardBtn = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const parsed = parseGuildFromText(text);
        if (parsed.name) {
          setName(parsed.name);
          if (parsed.level) setLevel(parsed.level);
          if (parsed.note) setNoteType(parsed.note);
          if (parsed.targetBoss) setTargetBoss(parsed.targetBoss);

          soundFx.playCheck();
          setPasteNotice(`📋 วางชื่อกิลด์สำเร็จ: "${parsed.name}"`);
          setTimeout(() => setPasteNotice(null), 3000);
        }
      }
    } catch {
      // If clipboard read is blocked by browser permission, focus name input
      nameInputRef.current?.focus();
      setPasteNotice('กดปุ่ม Ctrl + V บนคีย์บอร์ดได้เลย');
      setTimeout(() => setPasteNotice(null), 3000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImage(file, 256);
      if (dataUrl) {
        setIcon(dataUrl);
        soundFx.playCheck();
      }
    } catch {
      // ignore error
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalNote = noteType;
    if (noteType === '3.อื่นๆ') {
      finalNote = customNote.trim() ? `3.อื่นๆ: ${customNote.trim()}` : '3.อื่นๆ';
    }

    onSave(
      {
        name: name.trim(),
        level: level.trim() || 'ไม่ระบุเลเวล',
        icon: icon.trim(),
        note: finalNote,
        targetBoss: targetBoss.trim() || undefined,
        status,
      },
      editingGuild?.id
    );

    soundFx.playCheck();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingGuild ? 'แก้ไขข้อมูลกิลด์' : 'เพิ่มกิลด์ใหม่'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingGuild ? `กิลด์ ${editingGuild.name}` : 'กด Ctrl+V เพื่อวางชื่อหรือรูปได้ทันที'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Paste Notification Feedback */}
          {pasteNotice && (
            <div className="p-3 rounded-xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs flex items-center gap-2 animate-fade-in shadow-md">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">{pasteNotice}</span>
            </div>
          )}

          {/* Hidden File Input for Direct Image Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Direct Clickable Avatar Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            {/* Clickable Image Box */}
            <div
              onClick={handleAvatarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAvatarClick();
                }
              }}
              title="กดเพื่อเลือกรูปภาพจากเครื่องของคุณ"
              className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/60 bg-slate-900 cursor-pointer group shadow-lg shadow-indigo-950/50 hover:border-indigo-400 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {icon ? (
                <img
                  src={icon}
                  alt="Guild Emblem"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                  <ImageIcon className="w-8 h-8 text-indigo-400" />
                </div>
              )}

              {/* Hover / Tap overlay */}
              <div className="absolute inset-0 bg-black/55 group-hover:bg-black/40 flex flex-col items-center justify-center text-white transition-opacity opacity-90 group-hover:opacity-100">
                <Camera className="w-5 h-5 text-indigo-300 drop-shadow" />
                <span className="text-[10px] font-semibold mt-0.5 tracking-tight">กดเปลี่ยนรูป</span>
              </div>
            </div>

            {/* Quick explanation & Action */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-white mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>กดที่รูปเพื่ออัปโหลดรูปภาพ</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                เลือกรูปจากเครื่อง หรือกด <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-slate-700">Ctrl+V</kbd> เพื่อวางรูปภาพที่แคปมาได้เลย!
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-600 text-white transition-colors flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-3 h-3" />
                  <span>เลือกรูปจากเครื่อง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-colors"
                >
                  {showUrlInput ? 'ซ่อนใส่ URL' : 'หรือใส่ลิงก์ URL'}
                </button>
              </div>
            </div>
          </div>

          {/* Optional URL Input if toggled */}
          {showUrlInput && (
            <div className="animate-fade-in">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                วาง URL รูปภาพ (https://...)
              </label>
              <input
                type="url"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* 135 Official Clan Emblems Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300">
                ตราสัญลักษณ์แคลน (135 สัญลักษณ์ในเกม)
              </label>
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/30 hover:bg-indigo-900/60"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>ดูทั้งหมด 135 แบบ</span>
              </button>
            </div>

            {currentEmblemMatch && (
              <div className="mb-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  เลือกอยู่: <strong className="text-white">{currentEmblemMatch.label}</strong> - {currentEmblemMatch.name}
                </span>
              </div>
            )}

            {/* Quick Strip of Popular Clan Emblems + Open All Button */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ALL_CLAN_EMBLEMS.slice(0, 5).map((emblem) => {
                const isSelected = icon === emblem.dataUrl;
                return (
                  <button
                    key={emblem.id}
                    type="button"
                    onClick={() => {
                      setIcon(emblem.dataUrl);
                      soundFx.playCheck();
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 relative flex items-center justify-center">
                      <img src={emblem.dataUrl} alt={emblem.label} className="w-full h-full object-contain" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
                      {emblem.label}
                    </span>
                  </button>
                );
              })}

              {/* View all 135 emblems tile */}
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="p-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-indigo-300 hover:text-white"
              >
                <div className="w-10 h-10 rounded-lg border border-dashed border-indigo-400/50 flex items-center justify-center">
                  <Grid className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-bold truncate w-full text-center">
                  ครบ 135 แบบ
                </span>
              </button>
            </div>
          </div>

          {/* Guild Name with quick Ctrl+V shortcut badge */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                ชื่อกิลด์ <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboardBtn}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                title="คลิกเพื่อวางข้อความจากคลิปบอร์ด หรือกดปุ่ม Ctrl+V"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>กด Ctrl+V เพื่อวางชื่อ</span>
              </button>
            </div>
            <div className="relative">
              <input
                ref={nameInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น SOLOLEVELING (หรือกด Ctrl+V ได้เลย)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Level / Member Count & Target Boss */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                เลเวลกิลด์ / ข้อมูลสมาชิก
              </label>
              <input
                id="guild-level"
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="เช่น 1 คนเช็คชื่อ, Lv. 10"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                เป้าหมายบอสประจำสัปดาห์ (ถ้ามี)
              </label>
              <input
                id="target-boss"
                type="text"
                value={targetBoss}
                onChange={(e) => setTargetBoss(e.target.value)}
                placeholder="เช่น บอสสายฟ้า, บอสไฟ"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Drop Note Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              หมายเหตุการได้รับของดรอป
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 mb-2 cursor-pointer"
            >
              <option value="1.ของเข้าตัว">🎒 1. ของเข้าตัว</option>
              <option value="2.เข้ากิล">🏰 2. เข้ากิล</option>
              <option value="3.อื่นๆ">❓ 3. อื่นๆ (ระบุเอง)</option>
            </select>

            {noteType === '3.อื่นๆ' && (
              <input
                id="custom-note"
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="ระบุรายละเอียดเพิ่มเติม (เช่น บอสสายฟ้า, เก็บกล่องกิลด์)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 animate-fade-in"
                autoFocus
              />
            )}
          </div>

          {/* Initial Status checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300 select-none">
              <input
                type="checkbox"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <span>สถานะสัปดาห์นี้: ตีบอสเรียบร้อยแล้ว</span>
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              {editingGuild ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>บันทึกการแก้ไข</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มกิลด์</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 135 Official In-Game Clan Emblem Picker */}
      <ClanEmblemPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDataUrl={icon}
        onSelectEmblem={(dataUrl, emblem) => {
          setIcon(dataUrl);
          soundFx.playCheck();
          setPasteNotice(`✨ เลือก ${emblem.label} (${emblem.name}) เรียบร้อยแล้ว`);
          setTimeout(() => setPasteNotice(null), 3500);
        }}
      />
    </div>
  );
};


