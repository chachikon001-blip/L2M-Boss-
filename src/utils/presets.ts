import type { Guild } from '../types.ts';
import dragonEmblem from '../assets/images/guild_emblem_dragon_1791591679703.jpg';
import crowsEmblem from '../assets/images/guild_emblem_crows_1791591689853.jpg';
import shieldEmblem from '../assets/images/guild_emblem_shield_1791591700097.jpg';

export interface EmblemPreset {
  id: string;
  name: string;
  url: string;
}

export const EMBLEM_PRESETS: EmblemPreset[] = [
  {
    id: 'dragon',
    name: 'มังกรเพลิงฟ้า (Dragon)',
    url: dragonEmblem,
  },
  {
    id: 'crows',
    name: 'อีกาดำ (Crows)',
    url: crowsEmblem,
  },
  {
    id: 'shield',
    name: 'โล่อัสนีบาต (Storm Shield)',
    url: shieldEmblem,
  },
];

export const INITIAL_GUILDS: Guild[] = [
  {
    id: 1,
    name: 'SOLOLEVELING',
    level: '1 คนเช็คชื่อ',
    icon: dragonEmblem,
    note: '1.ของเข้าตัว',
    status: false,
    targetBoss: 'บอสมังกรโลหิต',
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 2,
    name: 'Crows',
    level: '2 คนเช็คชื่อ',
    icon: crowsEmblem,
    note: '2.เข้ากิล',
    status: false,
    targetBoss: 'บอสเงาแห่งความมืด',
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 3,
    name: 'THAILAND',
    level: '1 คนเช็คชื่อ',
    icon: shieldEmblem,
    note: '3.อื่นๆ: บอสสายฟ้า',
    status: true,
    targetBoss: 'บอสสายฟ้าเทวะ',
    updatedAt: Date.now() - 10800000,
  },
];
