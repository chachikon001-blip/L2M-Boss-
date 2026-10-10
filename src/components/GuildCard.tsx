import React, { useState } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Shield, Swords, Users, AlertTriangle } from 'lucide-react';
import type { Guild } from '../types.ts';
import { soundFx } from '../utils/sound.ts';

interface GuildCardProps {
  guild: Guild;
  onToggleStatus: (id: string | number) => void;
  onEditGuild: (guild: Guild) => void;
  onDeleteGuild: (id: string | number) => void;
}

export const GuildCard: React.FC<GuildCardProps> = ({
  guild,
  onToggleStatus,
  onEditGuild,
  onDeleteGuild,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Badge styling based on note
  let badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let badgeLabel = guild.note;

  if (guild.note.includes('2.เข้ากิล') || guild.note.includes('2. เข้ากิล')) {
    badgeStyle = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  } else if (guild.note.includes('3.อื่นๆ') || guild.note.includes('3. อื่นๆ')) {
    badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  const handleToggle = () => {
    if (!guild.status) {
      soundFx.playVictory();
    } else {
      soundFx.playUncheck();
    }
    onToggleStatus(guild.id);
  };

  const handleDelete = () => {
    soundFx.playReset();
    onDeleteGuild(guild.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 backdrop-blur-sm ${
        guild.status
          ? 'bg-slate-900/70 border-emerald-500/40 opacity-80 ring-1 ring-emerald-500/20'
          : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
      }`}
    >
      {/* Status indicator bar on top edge */}
      <div
        className={`absolute top-0 left-6 right-6 h-0.5 rounded-full ${
          guild.status ? 'bg-emerald-500' : 'bg-slate-700/50'
        }`}
      />

      <div>
        {/* Top Header Row with Icon, Name, and Quick Edit */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Emblem / Icon Container - Clickable to edit */}
            <div
              onClick={() => onEditGuild(guild)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onEditGuild(guild);
              }}
              title="กดเพื่อดูหรือเปลี่ยนรูปกิลด์"
              className="w-13 h-13 w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group cursor-pointer hover:border-indigo-500/80 transition-all relative"
            >
              {guild.icon && !imageError ? (
                <img
                  src={guild.icon}
                  alt={guild.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/60 to-slate-900 text-indigo-400">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
              )}
              {/* Subtle hover overlay indicating clickability */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Edit2 className="w-3.5 h-3.5 text-indigo-300 drop-shadow" />
              </div>
            </div>

            {/* Guild Name & Member Level Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white truncate" title={guild.name}>
                  {guild.name}
                </h3>
                {guild.status && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                    ตีแล้ว{guild.lastUpdatedBy ? ` · ${guild.lastUpdatedBy}` : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{guild.level || 'ไม่ระบุเลเวล'}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEditGuild(guild)}
            title="แก้ไขข้อมูลกิลด์"
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Boss Target if exists */}
        {guild.targetBoss && (
          <div className="mb-2.5 flex items-center gap-1.5 text-xs text-indigo-300/90 font-medium">
            <Swords className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">เป้าหมาย: {guild.targetBoss}</span>
          </div>
        )}

        {/* Note Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${badgeStyle}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="truncate max-w-[260px]">{badgeLabel}</span>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div>
        {showDeleteConfirm ? (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>ลบกิลด์ {guild.name}?</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
            {/* Status toggle button */}
            <button
              onClick={handleToggle}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                guild.status
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80'
              }`}
            >
              {guild.status ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>ตีแล้วเรียบร้อย</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>ยังไม่ได้ตี</span>
                </>
              )}
            </button>

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="ลบกิลด์นี้"
              className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
