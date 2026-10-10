import React, { useState, useMemo } from 'react';
import { Search, X, Check, Grid, Sparkles } from 'lucide-react';
import { ALL_CLAN_EMBLEMS, type ClanEmblem } from '../utils/clanEmblems.ts';
import { soundFx } from '../utils/sound.ts';

interface ClanEmblemPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDataUrl: string;
  onSelectEmblem: (dataUrl: string, emblem: ClanEmblem) => void;
}

const CATEGORIES = [
  'ทั้งหมด',
  'คลาสสิก (01-30)',
  'เขียวนีออน (31-40)',
  'ฟ้าเทอร์ควอยซ์ (41-50)',
  'ทองคำเรืองรอง (51-55)',
  'ม่วงมังกร (56-60)',
  'สีสันพิเศษ (61-75)',
  'ไอคอนมีม & กีฬา (76-90)',
  'ตำนานนักรบ (91-105)',
  'สมรภูมิ & สยองขวัญ (106-120)',
  'ยอดฝีมือ (121-135)',
];

export const ClanEmblemPicker: React.FC<ClanEmblemPickerProps> = ({
  isOpen,
  onClose,
  selectedDataUrl,
  onSelectEmblem,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');

  const filteredEmblems = useMemo(() => {
    return ALL_CLAN_EMBLEMS.filter((e) => {
      // Category filter
      if (activeCategory !== 'ทั้งหมด' && e.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      const idStr = String(e.id);
      const padStr = String(e.id).padStart(2, '0');
      return (
        idStr === q ||
        padStr === q ||
        e.label.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        `สัญลักษณ์ ${e.id}`.includes(q)
      );
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[60] animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ตราสัญลักษณ์แคลน</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ทั้งหมด 135 สัญลักษณ์
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                เลือกตราสัญลักษณ์ทางการจากในเกม สัญลักษณ์ 01 ถึง 135
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

        {/* Search & Categories Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วยตัวเลข (เช่น 01, 55, 135) หรือชื่อ (หมาป่า, ฟีนิกซ์, มังกร, โล่, กะโหลก)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Emblems Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {filteredEmblems.map((emblem) => {
              const isSelected = selectedDataUrl === emblem.dataUrl;

              return (
                <button
                  key={emblem.id}
                  type="button"
                  onClick={() => {
                    onSelectEmblem(emblem.dataUrl, emblem);
                    soundFx.playCheck();
                    onClose();
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer group text-left relative ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-950'
                      : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 hover:scale-[1.03]'
                  }`}
                >
                  {/* Emblem Image Box */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden relative border border-slate-700/50 bg-slate-950 shadow-inner flex items-center justify-center">
                    <img
                      src={emblem.dataUrl}
                      alt={emblem.label}
                      className="w-full h-full object-contain p-0.5"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/35 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emblem Label & Name */}
                  <div className="w-full text-center overflow-hidden">
                    <div className="text-[11px] font-bold text-white truncate">
                      {emblem.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {emblem.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredEmblems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">ไม่พบสัญลักษณ์ที่ตรงกับ "{search}"</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategory('ทั้งหมด');
                }}
                className="mt-3 px-3.5 py-1.5 text-xs rounded-xl bg-slate-800 text-slate-200 hover:text-white"
              >
                ดูสัญลักษณ์ทั้งหมด 135 แบบ
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>แสดง {filteredEmblems.length} จาก 135 สัญลักษณ์</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
