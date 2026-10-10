import React, { useState } from 'react';
import { X, Download, Upload, RefreshCw, AlertCircle, Check } from 'lucide-react';
import type { Guild } from '../types.ts';
import { INITIAL_GUILDS } from '../utils/presets.ts';
import { soundFx } from '../utils/sound.ts';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  guilds: Guild[];
  onImportGuilds: (imported: Guild[]) => void;
  onResetToDefaults: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  guilds,
  onImportGuilds,
  onResetToDefaults,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(guilds, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `guild_boss_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImportText = () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (!jsonInput.trim()) {
        setErrorMsg('กรุณาวางโค้ด JSON ข้อมูลกิลด์');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        setErrorMsg('โครงสร้างข้อมูลไม่ถูกต้อง (ต้องเป็นรายการกิลด์)');
        return;
      }
      onImportGuilds(parsed);
      soundFx.playCheck();
      setSuccessMsg(`นำเข้าข้อมูลสำเร็จ ${parsed.length} รายการ`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportGuilds(parsed);
          soundFx.playCheck();
          setSuccessMsg(`นำเข้าข้อมูลจากไฟล์สำเร็จ ${parsed.length} รายการ`);
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 1500);
        } else {
          setErrorMsg('ไฟล์ไม่มีรายการกิลด์ที่ถูกต้อง');
        }
      } catch {
        setErrorMsg('ไม่สามารถอ่านไฟล์ JSON ได้');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลกิลด์ทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      onResetToDefaults();
      soundFx.playReset();
      setSuccessMsg('รีเซ็ตเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">สำรองข้อมูล & กู้คืน (Backup & Restore)</h2>
            <p className="text-xs text-slate-400">บันทึกข้อมูลกิลด์เก็บไว้ หรือนำเข้าจากเครื่องอื่น</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Export Action */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">ส่งออกไฟล์สำรอง (Export)</h3>
              <p className="text-xs text-slate-400 mt-0.5">ดาวน์โหลดข้อมูลทั้งหมด ({guilds.length} กิลด์) เป็นไฟล์ .json</p>
            </div>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด</span>
            </button>
          </div>

          {/* Import JSON text or File */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">นำเข้าข้อมูล (Import)</h3>
              <label className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>เลือกไฟล์ JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={4}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='หรือวางข้อความ JSON ที่นี่ เช่น [{"id": 1, "name": "SOLOLEVELING", ...}]'
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={handleImportText}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-colors"
            >
              นำเข้าจากข้อความ JSON
            </button>
          </div>

          {/* Reset to Defaults */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">ต้องการล้างและคืนค่าข้อมูลตัวอย่างเริ่มต้น?</span>
            <button
              onClick={handleResetDefaults}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>คืนค่าเริ่มต้น</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
