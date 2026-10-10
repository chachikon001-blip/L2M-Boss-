import type { Guild } from '../types.ts';
import { EMBLEM_PRESETS } from './presets.ts';

export interface ParsedGuildText {
  name: string;
  level?: string;
  note?: string;
  targetBoss?: string;
}

export function parseGuildFromText(rawText: string): ParsedGuildText {
  let text = rawText.trim();

  // Strip leading bullet numbers or symbols like: "1.", "1)", "[1]", "•", "-", "*"
  text = text.replace(/^(\d+[\.\)]\s*|\[\d+\]\s*|[\u2022\-\*\>]\s*)/, '').trim();

  let note: string | undefined = undefined;
  let level: string | undefined = undefined;
  let targetBoss: string | undefined = undefined;

  // Check for drop notes
  if (text.includes('1.ของเข้าตัว') || text.includes('1. ของเข้าตัว') || text.includes('ของเข้าตัว')) {
    note = '1.ของเข้าตัว';
  } else if (text.includes('2.เข้ากิล') || text.includes('2. เข้ากิล') || text.includes('เข้ากิล')) {
    note = '2.เข้ากิล';
  }

  // Extract parentheses or bracketed level info: e.g. "SOLOLEVELING (1 คนเช็คชื่อ)" or "SOLOLEVELING [Lv. 10]"
  const bracketMatch = text.match(/[\(\[]([^\)\]]+)[\)\]]/);
  if (bracketMatch) {
    const inside = bracketMatch[1].trim();
    if (inside.includes('Lv') || inside.includes('คน') || inside.includes('สมาชิก') || inside.includes('เช็คชื่อ')) {
      level = inside;
      text = text.replace(bracketMatch[0], '').trim();
    } else if (inside.includes('บอส')) {
      targetBoss = inside;
      text = text.replace(bracketMatch[0], '').trim();
    }
  }

  // Extract hyphenated level: e.g. "SOLOLEVELING - 1 คนเช็คชื่อ"
  if (!level && text.includes(' - ')) {
    const parts = text.split(' - ');
    if (parts.length >= 2) {
      const candidate = parts[1].trim();
      if (candidate.includes('คน') || candidate.includes('Lv') || candidate.includes('เช็คชื่อ')) {
        level = candidate;
        text = parts[0].trim();
      }
    }
  }

  // Final cleanup on name
  const name = text.replace(/[\(\[\{\]\}\)]/g, '').trim();

  return {
    name: name || rawText.trim(),
    level,
    note,
    targetBoss,
  };
}

export function parseMultipleGuilds(rawText: string): ParsedGuildText[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('===') && !l.startsWith('---') && !l.startsWith('⚔️') && !l.startsWith('📊'));

  return lines.map((line) => parseGuildFromText(line)).filter((g) => g.name.length > 0);
}
