// 135 Official In-Game Clan Emblems (ตราสัญลักษณ์แคลน สัญลักษณ์ 01 - 135)
export interface ClanEmblem {
  id: number;
  label: string; // e.g. "สัญลักษณ์ 01"
  name: string;  // Thai descriptive name
  category: string;
  themeColor: string;
  dataUrl: string;
}

// Generate high quality vector SVG markup for each emblem 1 - 135
export function generateEmblemSvg(id: number): string {
  const pad = String(id).padStart(2, '0');
  
  // Color palette definitions based on game screenshots
  let mainColor = '#ffffff';
  let accentColor = '#94a3b8';
  let bgGradient = ['#1e293b', '#0f172a'];
  let glowColor = 'rgba(255,255,255,0.2)';

  if (id >= 1 && id <= 30) {
    // White monochrome heraldry
    mainColor = '#ffffff';
    accentColor = '#cbd5e1';
    bgGradient = ['#182030', '#0a0f1d'];
  } else if (id >= 31 && id <= 40) {
    // Neon green beasts & crests
    mainColor = '#4ade80';
    accentColor = '#22c55e';
    glowColor = 'rgba(74, 222, 128, 0.4)';
    bgGradient = ['#052e16', '#021a0c'];
  } else if (id >= 41 && id <= 50) {
    // Cyan / Teal luminous crests
    mainColor = '#38bdf8';
    accentColor = '#06b6d4';
    glowColor = 'rgba(56, 189, 248, 0.4)';
    bgGradient = ['#082f49', '#031726'];
  } else if (id >= 51 && id <= 55) {
    // Radiant golden crests (Phoenix, Unicorn, Wings, Sun, Trophy)
    mainColor = '#fbbf24';
    accentColor = '#f59e0b';
    glowColor = 'rgba(251, 191, 36, 0.4)';
    bgGradient = ['#451a03', '#1c0a02'];
  } else if (id >= 56 && id <= 60) {
    // Royal purple dragons & crowns
    mainColor = '#c084fc';
    accentColor = '#9333ea';
    glowColor = 'rgba(192, 132, 252, 0.4)';
    bgGradient = ['#3b0764', '#19032d'];
  } else if (id >= 61 && id <= 75) {
    // Colorful Badges: Red, Gold, Blue, Pink
    if ([62, 67].includes(id)) {
      mainColor = '#facc15';
      accentColor = '#eab308';
    } else if ([65, 70, 71, 75].includes(id)) {
      mainColor = '#f87171';
      accentColor = '#ef4444';
    } else if ([73, 74].includes(id)) {
      mainColor = '#f472b6';
      accentColor = '#ec4899';
    } else {
      mainColor = '#38bdf8';
      accentColor = '#0284c7';
    }
    bgGradient = ['#1e293b', '#090d16'];
  } else if (id >= 76 && id <= 90) {
    // Fun & Meme badges
    if ([76].includes(id)) { mainColor = '#f472b6'; accentColor = '#ec4899'; }
    else if ([77].includes(id)) { mainColor = '#22d3ee'; accentColor = '#06b6d4'; }
    else if ([78, 84, 85, 87, 88].includes(id)) { mainColor = '#fbbf24'; accentColor = '#d97706'; }
    else if ([80, 83].includes(id)) { mainColor = '#4ade80'; accentColor = '#16a34a'; }
    else if ([89].includes(id)) { mainColor = '#f87171'; accentColor = '#dc2626'; }
    else { mainColor = '#f8fafc'; accentColor = '#94a3b8'; }
    bgGradient = ['#1e293b', '#0a0e17'];
  } else if (id >= 91 && id <= 105) {
    // Legendary Warriors & Red/Gold/Purple
    if ([91, 93, 95].includes(id)) { mainColor = '#ef4444'; accentColor = '#b91c1c'; }
    else if ([94, 96, 101, 105].includes(id)) { mainColor = '#f59e0b'; accentColor = '#d97706'; }
    else if ([98, 102].includes(id)) { mainColor = '#a855f7'; accentColor = '#7e22ce'; }
    else if ([103, 104].includes(id)) { mainColor = '#f97316'; accentColor = '#ea580c'; }
    else { mainColor = '#38bdf8'; accentColor = '#0284c7'; }
    bgGradient = ['#1e293b', '#0a0e17'];
  } else if (id >= 106 && id <= 120) {
    // Battle & Valor
    if ([106, 107, 108].includes(id)) { mainColor = '#22c55e'; accentColor = '#16a34a'; }
    else if ([109, 112].includes(id)) { mainColor = '#f472b6'; accentColor = '#db2777'; }
    else if ([110, 111, 113, 114, 116, 117, 118].includes(id)) { mainColor = '#ef4444'; accentColor = '#dc2626'; }
    else if ([119].includes(id)) { mainColor = '#f59e0b'; accentColor = '#d97706'; }
    else { mainColor = '#38bdf8'; accentColor = '#0284c7'; }
    bgGradient = ['#1e293b', '#0a0e17'];
  } else {
    // 121 - 135 Myth & Champions
    if ([121, 122].includes(id)) { mainColor = '#3b82f6'; accentColor = '#2563eb'; }
    else if ([123, 125].includes(id)) { mainColor = '#c084fc'; accentColor = '#9333ea'; }
    else if ([124, 132].includes(id)) { mainColor = '#4ade80'; accentColor = '#10b981'; }
    else if ([126, 127, 128, 130].includes(id)) { mainColor = '#f59e0b'; accentColor = '#d97706'; }
    else if ([131, 134].includes(id)) { mainColor = '#ef4444'; accentColor = '#b91c1c'; }
    else if ([133].includes(id)) { mainColor = '#f43f5e'; accentColor = '#8b5cf6'; }
    else { mainColor = '#f8fafc'; accentColor = '#cbd5e1'; }
    bgGradient = ['#1e293b', '#0a0e17'];
  }

  // Generate distinct graphic paths depending on ID
  const graphic = getEmblemGraphic(id, mainColor, accentColor);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="bg_${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <filter id="glow_${id}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${mainColor}" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect width="100" height="100" rx="16" fill="url(#bg_${id})" />
    <rect x="2" y="2" width="96" height="96" rx="14" fill="none" stroke="${mainColor}" stroke-opacity="0.18" stroke-width="1.5" />
    <g filter="url(#glow_${id})">
      ${graphic}
    </g>
    <!-- Emblem number badge -->
    <rect x="18" y="82" width="64" height="13" rx="6.5" fill="#020617" fill-opacity="0.85" />
    <text x="50" y="91.5" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#94a3b8" text-anchor="middle">
      ${pad}
    </text>
  </svg>`;
}

// Map each emblem to characteristic SVG paths
function getEmblemGraphic(id: number, c: string, a: string): string {
  switch (id) {
    // 01 - 15
    case 1: // Dog in serrated circle
      return `<circle cx="50" cy="45" r="30" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="4 2" />
              <path d="M40 54 L44 46 L40 40 L45 34 L52 38 L62 42 L65 52 L57 52 L53 46 L47 48 L44 54 Z" fill="${c}" />`;
    case 2: // Spider
      return `<ellipse cx="50" cy="46" rx="7" ry="10" fill="${c}" />
              <circle cx="50" cy="34" r="5" fill="${c}" />
              <path d="M43 38 Q32 30 26 34 M57 38 Q68 30 74 34 M43 43 Q28 40 22 47 M57 43 Q72 40 78 47 M43 48 Q30 52 26 62 M57 48 Q70 52 74 62 M45 53 Q34 62 30 70 M55 53 Q66 62 70 70" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" />`;
    case 3: // Turtle
      return `<ellipse cx="50" cy="47" rx="15" ry="18" fill="none" stroke="${c}" stroke-width="3" />
              <circle cx="50" cy="24" r="5" fill="${c}" />
              <path d="M50 30 L50 64 M40 38 L60 38 M37 54 L63 54 M35 34 L27 26 M65 34 L73 26 M36 58 L28 66 M64 58 L72 66" stroke="${c}" stroke-width="2.5" stroke-linecap="round" />`;
    case 4: // Wildcat / Tiger
      return `<path d="M30 30 L40 38 Q50 36 60 38 L70 30 L67 44 Q74 54 64 64 Q50 72 36 64 Q26 54 33 44 Z" fill="${c}" />
              <circle cx="43" cy="48" r="3" fill="#0f172a" /><circle cx="57" cy="48" r="3" fill="#0f172a" />
              <path d="M46 56 Q50 58 54 56 M36 54 L24 50 M36 58 L22 58 M64 54 L76 50 M64 58 L78 58" stroke="#0f172a" stroke-width="1.8" />`;
    case 5: // Crossed battle flags
      return `<path d="M30 22 L50 68 M70 22 L50 68" stroke="${a}" stroke-width="3" stroke-linecap="round" />
              <path d="M30 24 Q42 20 50 28 L50 44 Q38 36 30 40 Z" fill="${c}" />
              <path d="M70 24 Q58 20 50 28 L50 44 Q62 36 70 40 Z" fill="${c}" />`;
    case 6: // Raven in circle
      return `<circle cx="50" cy="45" r="28" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M38 58 L68 34 M38 52 Q42 36 54 34 Q64 36 62 46 Q56 56 46 58 Z" fill="${c}" />`;
    case 7: // 8-Petal Lotus
      return `<g transform="translate(50,45)">
                ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
                  <ellipse cx="0" cy="-16" rx="5" ry="11" fill="${c}" transform="rotate(${deg})" />
                `).join('')}
                <circle cx="0" cy="0" r="6" fill="#0f172a" />
              </g>`;
    case 8: // Butterfly
      return `<path d="M50 45 Q36 24 20 28 Q18 44 38 48 Q20 58 26 68 Q42 66 50 50 Q58 66 74 68 Q80 58 62 48 Q82 44 80 28 Q64 24 50 45 Z" fill="${c}" />
              <path d="M50 30 L50 62" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />`;
    case 9: // Wolf head front
      return `<path d="M26 28 L40 40 L50 32 L60 40 L74 28 L68 48 L76 58 L58 68 L50 72 L42 68 L24 58 L32 48 Z" fill="${c}" />
              <path d="M42 48 L48 50 L42 54 Z M58 48 L52 50 L58 54 Z" fill="#0f172a" />`;
    case 10: // 8-Point Compass Star
      return `<path d="M50 18 L55 38 L76 45 L55 52 L50 72 L45 52 L24 45 L45 38 Z" fill="${c}" />
              <circle cx="50" cy="45" r="6" fill="#0f172a" stroke="${c}" stroke-width="2" />`;
    case 11: // Scroll
      return `<path d="M30 32 Q50 24 70 32 Q62 60 68 64 Q48 56 28 64 Z" fill="${c}" />
              <circle cx="30" cy="32" r="5" fill="${a}" /><circle cx="68" cy="64" r="5" fill="${a}" />`;
    case 12: // Stallion / Horse
      return `<path d="M34 68 L42 54 L38 42 L48 30 Q54 22 62 26 L60 36 L68 40 Q56 46 54 54 L62 68 L52 68 L48 58 L42 68 Z" fill="${c}" />`;
    case 13: // Hourglass
      return `<path d="M32 24 L68 24 L54 45 L68 66 L32 66 L46 45 Z" fill="none" stroke="${c}" stroke-width="3.5" />
              <line x1="28" y1="24" x2="72" y2="24" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <line x1="28" y1="66" x2="72" y2="66" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <circle cx="50" cy="54" r="5" fill="${c}" />`;
    case 14: // Hammer & Anvil
      return `<path d="M32 48 L68 48 Q60 56 60 64 L40 64 Q40 56 32 48 Z" fill="${c}" />
              <rect x="42" y="24" width="28" height="10" rx="3" fill="${a}" />
              <line x1="56" y1="34" x2="48" y2="48" stroke="${c}" stroke-width="3" />`;
    case 15: // Double Fish
      return `<circle cx="50" cy="45" r="28" fill="none" stroke="${c}" stroke-width="2.5" />
              <path d="M34 40 Q50 30 62 44 Q50 48 38 42 Z M66 50 Q50 60 38 46 Q50 42 62 48 Z" fill="${c}" />`;

    // 16 - 30
    case 16: // Cross Shield
      return `<path d="M30 25 L70 25 L70 48 Q70 68 50 74 Q30 68 30 48 Z" fill="none" stroke="${c}" stroke-width="3.5" />
              <line x1="50" y1="30" x2="50" y2="68" stroke="${c}" stroke-width="4" />
              <line x1="36" y1="46" x2="64" y2="46" stroke="${c}" stroke-width="4" />`;
    case 17: // Eagle Dive
      return `<circle cx="50" cy="45" r="28" fill="none" stroke="${c}" stroke-width="2.5" />
              <path d="M36 32 Q50 46 64 36 Q62 56 46 62 Q52 48 36 32 Z" fill="${c}" />`;
    case 18: // Owl in Crescent Moon
      return `<path d="M60 22 Q34 26 38 66 Q52 66 64 56 Q44 48 46 32 Q54 22 60 22 Z" fill="${c}" />
              <ellipse cx="56" cy="45" rx="8" ry="14" fill="${c}" />
              <circle cx="53" cy="38" r="2" fill="#0f172a" /><circle cx="59" cy="38" r="2" fill="#0f172a" />`;
    case 19: // Flame in circle
      return `<circle cx="50" cy="45" r="28" fill="none" stroke="${c}" stroke-width="2.5" />
              <path d="M50 24 Q58 38 64 46 Q68 56 60 64 Q50 72 40 64 Q32 54 44 44 Q46 36 50 24 Z" fill="${c}" />`;
    case 20: // Stag Horns
      return `<path d="M44 54 Q50 68 56 54 L52 46 L48 46 Z" fill="${c}" />
              <path d="M46 44 Q36 36 30 24 M35 34 L26 34 M38 28 L32 20 M54 44 Q64 36 70 24 M65 34 L74 34 M62 28 L68 20" stroke="${c}" stroke-width="3" stroke-linecap="round" />`;
    case 21: // Lion Head in Shield
      return `<path d="M30 24 L70 24 L70 48 Q70 68 50 74 Q30 68 30 48 Z" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M38 34 Q50 30 62 34 L66 44 L60 52 L50 62 L40 52 L34 44 Z" fill="${c}" />`;
    case 22: // Ram Head Horns
      return `<path d="M44 44 L56 44 L50 64 Z" fill="${c}" />
              <path d="M44 44 Q32 30 24 40 Q22 52 36 48 M56 44 Q68 30 76 40 Q78 52 64 48" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" />`;
    case 23: // 3 Sprout Leaves
      return `<path d="M48 68 L52 68 L50 48 M50 48 Q32 38 34 26 Q46 26 50 42 M50 42 Q68 32 66 20 Q54 22 50 36 M50 36 Q50 20 54 16 Q58 24 50 34" fill="${c}" stroke="${c}" stroke-width="1.5" />`;
    case 24: // Crossbow
      return `<path d="M26 42 Q50 26 74 42 L66 46 Q50 36 34 46 Z" fill="${c}" />
              <line x1="50" y1="28" x2="50" y2="70" stroke="${c}" stroke-width="3.5" />
              <line x1="38" y1="64" x2="62" y2="64" stroke="${c}" stroke-width="3.5" />`;
    case 25: // Ghost
      return `<path d="M32 45 Q32 26 50 26 Q68 26 68 45 Q68 68 62 64 Q56 60 50 66 Q44 60 38 64 Q32 68 32 45 Z" fill="${c}" />
              <circle cx="43" cy="40" r="3" fill="#0f172a" /><circle cx="57" cy="40" r="3" fill="#0f172a" />
              <ellipse cx="50" cy="50" rx="3" ry="5" fill="#0f172a" />`;
    case 26: // Crossed Swords Shield
      return `<path d="M34 28 L66 28 L66 50 Q66 66 50 72 Q34 66 34 50 Z" fill="none" stroke="${c}" stroke-width="2.5" />
              <line x1="24" y1="22" x2="76" y2="70" stroke="${c}" stroke-width="3" />
              <line x1="76" y1="22" x2="24" y2="70" stroke="${c}" stroke-width="3" />`;
    case 27: // Songbird
      return `<path d="M28 54 Q40 40 54 38 Q68 38 72 44 L58 56 Q42 62 28 54 Z M54 38 L68 36 L62 44 Z" fill="${c}" />
              <line x1="26" y1="62" x2="74" y2="62" stroke="${c}" stroke-width="3" stroke-linecap="round" />`;
    case 28: // Scales
      return `<line x1="50" y1="24" x2="50" y2="68" stroke="${c}" stroke-width="3" />
              <line x1="30" y1="32" x2="70" y2="32" stroke="${c}" stroke-width="3.5" stroke-linecap="round" />
              <path d="M24 50 L36 50 L30 36 Z M64 50 L76 50 L70 36 Z" fill="${c}" />
              <line x1="36" y1="68" x2="64" y2="68" stroke="${c}" stroke-width="4" stroke-linecap="round" />`;
    case 29: // Knight Helmet
      return `<path d="M34 40 Q34 24 50 24 Q66 24 66 40 L64 62 Q50 68 36 62 Z" fill="none" stroke="${c}" stroke-width="3" />
              <line x1="42" y1="46" x2="42" y2="60" stroke="${c}" stroke-width="2.5" />
              <line x1="50" y1="46" x2="50" y2="62" stroke="${c}" stroke-width="2.5" />
              <line x1="58" y1="46" x2="58" y2="60" stroke="${c}" stroke-width="2.5" />
              <rect x="36" y="38" width="28" height="6" rx="2" fill="${c}" />`;
    case 30: // Bow & Arrow
      return `<path d="M30 64 Q60 48 30 24" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <line x1="30" y1="24" x2="30" y2="64" stroke="${a}" stroke-width="1.5" />
              <line x1="24" y1="44" x2="74" y2="44" stroke="${c}" stroke-width="3" stroke-linecap="round" />
              <polygon points="74,44 64,39 64,49" fill="${c}" />`;

    // 31 - 40 (Neon Green)
    case 31: // Cat in Green Circle
      return `<circle cx="50" cy="45" r="28" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M42 62 Q36 46 44 38 L42 28 L50 34 Q56 32 60 36 L66 30 L64 42 Q68 54 60 62 Z" fill="${c}" />`;
    case 32: // Bear Claw Shield
      return `<path d="M50 20 L76 45 L50 70 L24 45 Z" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M38 52 L42 34 M46 54 L50 30 M54 54 L58 34 M62 52 L66 38" stroke="${c}" stroke-width="3.5" stroke-linecap="round" />`;
    case 33: // Howling Wolf in Circle
      return `<circle cx="50" cy="45" r="28" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="6 3" />
              <path d="M40 64 L46 54 L44 44 L54 30 L58 32 L56 42 L66 52 L64 64 Z" fill="${c}" />`;
    case 34: // Green Eagle
      return `<path d="M24 38 Q42 24 50 42 Q58 24 76 38 Q62 52 50 68 Q38 52 24 38 Z" fill="${c}" />`;
    case 35: // Compass on Book
      return `<path d="M30 64 Q50 58 70 64 L68 56 Q50 50 32 56 Z" fill="${a}" />
              <circle cx="50" cy="40" r="14" fill="none" stroke="${c}" stroke-width="2.5" />
              <polygon points="50,22 54,38 50,44 46,38" fill="${c}" />
              <polygon points="50,58 54,42 50,36 46,42" fill="${a}" />`;
    case 36: // Green Dragon Ouroboros
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="3.5" stroke-dasharray="12 4" />
              <path d="M54 22 L66 22 L62 30 L54 26 Z M48 24 Q68 34 64 54 Q56 68 40 64 Q28 54 36 38" fill="none" stroke="${c}" stroke-width="4" />`;
    case 37: // Green Scorpion
      return `<path d="M50 64 Q64 56 64 40 Q64 28 52 26" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" />
              <polygon points="52,26 48,22 56,22" fill="${c}" />
              <ellipse cx="46" cy="50" rx="8" ry="12" fill="${c}" />
              <path d="M42 42 Q30 36 28 44 M50 42 Q62 36 64 44" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" />`;
    case 38: // Celtic Heart
      return `<path d="M50 68 C24 50 24 28 38 28 C45 28 50 36 50 36 C50 36 55 28 62 28 C76 28 76 50 50 68 Z" fill="none" stroke="${c}" stroke-width="4.5" />
              <circle cx="50" cy="44" r="5" fill="${c}" />`;
    case 39: // Green Skull Crossbones
      return `<line x1="28" y1="28" x2="72" y2="62" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <line x1="72" y1="28" x2="28" y2="62" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <path d="M38 32 Q50 22 62 32 Q66 44 58 52 L42 52 Q34 44 38 32 Z" fill="${c}" />
              <circle cx="45" cy="40" r="2.5" fill="#021a0c" /><circle cx="55" cy="40" r="2.5" fill="#021a0c" />`;
    case 40: // Green Panther Shield
      return `<path d="M30 26 L70 26 L70 48 Q70 66 50 72 Q30 66 30 48 Z" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M38 38 L48 48 L62 38 L58 54 Q50 62 42 54 Z" fill="${c}" />`;

    // 41 - 50 (Cyan / Teal)
    case 41: // Winged Lotus
      return `<path d="M50 26 Q40 40 32 46 Q24 34 26 26 Q36 36 50 48 Q64 36 74 26 Q76 34 68 46 Q60 40 50 26 Z" fill="${c}" />
              <circle cx="50" cy="54" r="5" fill="${a}" />`;
    case 42: // Crescent Moon & Star
      return `<path d="M50 66 Q26 66 32 40 Q40 60 58 52 Q42 42 46 26 Q68 34 66 54 Q64 66 50 66 Z" fill="${c}" />
              <polygon points="50,22 52,28 58,28 53,32 55,38 50,34 45,38 47,32 42,28 48,28" fill="${a}" />`;
    case 43: // Assassin Crest
      return `<path d="M50 20 L66 48 L58 48 L50 36 L42 48 L34 48 Z" fill="${c}" />
              <path d="M30 52 Q50 68 70 52 L64 58 Q50 72 36 58 Z" fill="${a}" />`;
    case 44: // Dimensional Star
      return `<polygon points="50,18 58,36 78,38 62,50 68,70 50,58 32,70 38,50 22,38 42,36" fill="${c}" />
              <polygon points="50,28 55,40 68,42 58,50 61,62 50,54 39,62 42,50 32,42 45,40" fill="${a}" />`;
    case 45: // Diamond
      return `<path d="M34 32 L66 32 L78 46 L50 72 L22 46 Z" fill="${c}" />
              <path d="M34 32 L50 46 L66 32 M50 46 L50 72 M22 46 L78 46" stroke="#031726" stroke-width="1.5" />`;
    case 46: // Grim Reaper
      return `<path d="M42 30 Q50 22 58 30 Q64 44 58 58 L42 58 Q36 44 42 30 Z" fill="${c}" />
              <circle cx="46" cy="40" r="2.5" fill="#031726" /><circle cx="54" cy="40" r="2.5" fill="#031726" />
              <path d="M68 22 Q48 20 40 32" stroke="${a}" stroke-width="3" fill="none" />
              <line x1="68" y1="22" x2="68" y2="68" stroke="${a}" stroke-width="2.5" />`;
    case 47: // Crowned Lion Profile
      return `<path d="M36 40 Q44 32 56 36 L64 42 Q68 54 58 64 L46 64 L36 54 Z" fill="${c}" />
              <polygon points="44,28 48,22 52,28 56,22 60,28 64,22 64,32 44,32" fill="${a}" />`;
    case 48: // Voodoo Doll
      return `<circle cx="50" cy="30" r="8" fill="${c}" />
              <path d="M44 40 L56 40 L60 52 L54 68 L46 68 L40 52 Z" fill="${c}" />
              <line x1="32" y1="42" x2="44" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round" />
              <line x1="68" y1="42" x2="56" y2="44" stroke="${c}" stroke-width="3.5" stroke-linecap="round" />`;
    case 49: // Handshake
      return `<path d="M26 44 L44 36 L56 46 L46 56 Z M74 44 L56 36 L44 46 L54 56 Z" fill="${c}" stroke="#031726" stroke-width="2" />`;
    case 50: // Crowned Skull
      return `<path d="M38 38 Q50 30 62 38 Q66 48 58 56 L42 56 Q34 48 38 38 Z" fill="${c}" />
              <circle cx="45" cy="44" r="3" fill="#031726" /><circle cx="55" cy="44" r="3" fill="#031726" />
              <polygon points="40,24 45,32 50,22 55,32 60,24 60,34 40,34" fill="${a}" />`;

    // 51 - 55 (Golden Crests)
    case 51: // Phoenix
      return `<path d="M50 22 Q58 34 68 32 Q62 44 72 48 Q58 56 50 68 Q42 56 28 48 Q38 44 32 32 Q42 34 50 22 Z" fill="${c}" />`;
    case 52: // Unicorn
      return `<path d="M36 68 L44 52 L40 40 Q48 32 58 34 L66 44 L60 54 L52 68 Z" fill="${c}" />
              <polygon points="56,34 76,20 60,30" fill="${a}" />`;
    case 53: // Winged Sword
      return `<line x1="50" y1="18" x2="50" y2="70" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <line x1="38" y1="34" x2="62" y2="34" stroke="${c}" stroke-width="3" />
              <path d="M48 34 Q30 26 26 42 Q38 46 48 48 Z M52 34 Q70 26 74 42 Q62 46 52 48 Z" fill="${a}" />`;
    case 54: // Radiant Sun
      return `<circle cx="50" cy="45" r="12" fill="${c}" />
              ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => `
                <path d="M50 24 Q53 28 50 31" stroke="${c}" stroke-width="2.5" stroke-linecap="round" transform="rotate(${deg} 50 45)" />
              `).join('')}`;
    case 55: // Golden Trophy
      return `<path d="M36 28 L64 28 L60 50 Q56 60 50 60 Q44 60 40 50 Z" fill="${c}" />
              <path d="M36 32 Q24 36 30 46 Q36 48 40 46 M64 32 Q76 36 70 46 Q64 48 60 46" fill="none" stroke="${c}" stroke-width="3" />
              <rect x="46" y="60" width="8" height="6" fill="${a}" />
              <rect x="40" y="66" width="20" height="4" rx="2" fill="${c}" />`;

    // 56 - 60 (Purple Dragons & Kings)
    case 56: // Coiled Purple Dragon
      return `<path d="M50 24 Q68 28 66 48 Q64 64 48 64 Q32 64 34 46 Q36 34 46 36 L52 44 L44 46" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" />
              <polygon points="54,24 62,20 60,28" fill="${c}" />`;
    case 57: // Dual Winged Dragon
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M38 34 Q52 42 62 34 Q58 56 46 58 Q40 48 38 34 Z" fill="${c}" />`;
    case 58: // Vicious Dragon Head
      return `<path d="M32 38 L48 26 L64 36 L70 46 L58 52 L62 60 L50 56 L42 64 L40 50 Z" fill="${c}" />`;
    case 59: // Crystal Crown
      return `<path d="M30 48 L40 28 L50 38 L60 28 L70 48 L64 58 L36 58 Z" fill="${c}" />
              <polygon points="50,38 45,46 50,54 55,46" fill="#19032d" />`;
    case 60: // Demon Dragon Face
      return `<path d="M30 26 L42 42 L50 36 L58 42 L70 26 L64 52 L50 68 L36 52 Z" fill="${c}" />
              <circle cx="44" cy="46" r="2.5" fill="#19032d" /><circle cx="56" cy="46" r="2.5" fill="#19032d" />`;

    // 61 - 75 (Colorful Badges)
    case 61: // Triple Layer Shield
      return `<path d="M30 28 L70 28 L64 52 L50 68 L36 52 Z" fill="${c}" />
              <path d="M36 36 L64 36 L60 54 L50 64 L40 54 Z" fill="${a}" />`;
    case 62: // Rocket on Moon
      return `<circle cx="50" cy="45" r="26" fill="${a}" />
              <path d="M50 26 Q56 34 56 46 L44 46 Q44 34 50 26 Z" fill="#ffffff" />
              <polygon points="44,44 38,52 44,50" fill="${c}" /><polygon points="56,44 62,52 56,50" fill="${c}" />`;
    case 63: // American Bald Eagle
      return `<circle cx="50" cy="45" r="26" fill="#881337" />
              <path d="M36 40 Q50 30 64 42 Q66 58 50 64 Q38 56 36 40 Z" fill="#ffffff" />
              <polygon points="58,44 68,48 58,52" fill="#fbbf24" />`;
    case 64: // Camper Van Mountain
      return `<path d="M30 52 L70 52 L70 38 L40 38 L30 46 Z" fill="${c}" />
              <rect x="36" y="42" width="10" height="6" fill="#ffffff" /><rect x="52" y="42" width="12" height="6" fill="#ffffff" />
              <circle cx="40" cy="54" r="4" fill="#0f172a" /><circle cx="62" cy="54" r="4" fill="#0f172a" />`;
    case 65: // Red Bullseye
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="4" />
              <circle cx="50" cy="45" r="16" fill="none" stroke="${c}" stroke-width="4" />
              <circle cx="50" cy="45" r="6" fill="${c}" />
              <line x1="68" y1="26" x2="52" y2="43" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />`;
    case 66: // Doge Shiba Inu Shield
      return `<path d="M30 26 L70 26 L70 50 Q70 66 50 72 Q30 66 30 50 Z" fill="${a}" />
              <ellipse cx="50" cy="48" rx="14" ry="12" fill="#ffffff" />
              <polygon points="40,36 34,26 44,32" fill="#d97706" /><polygon points="60,36 66,26 56,32" fill="#d97706" />`;
    case 67: // Gold Trophy Laurel
      return `<path d="M40 30 L60 30 L58 48 Q50 56 42 48 Z" fill="${c}" />
              <path d="M30 46 Q24 34 34 24 M70 46 Q76 34 66 24" fill="none" stroke="${c}" stroke-width="3" />`;
    case 68: // Puzzle
      return `<rect x="34" y="30" width="32" height="32" rx="4" fill="${c}" transform="rotate(45 50 46)" />`;
    case 69: // Cowboy Pirate
      return `<ellipse cx="50" cy="38" rx="26" ry="6" fill="${c}" />
              <path d="M38 38 Q38 24 50 24 Q62 24 62 38 Z" fill="${c}" />
              <path d="M42 44 Q50 64 58 44 Z" fill="${a}" />`;
    case 70: // Boxing Gloves Blood
      return `<path d="M36 38 Q30 48 40 54 Q48 54 46 42 Z M64 38 Q70 48 60 54 Q52 54 54 42 Z" fill="#ffffff" />
              <circle cx="50" cy="46" r="24" fill="#dc2626" fill-opacity="0.25" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3 3" />`;
    case 71: // R.I.P Tombstone
      return `<path d="M34 66 L34 38 Q34 24 50 24 Q66 24 66 38 L66 66 Z" fill="${c}" />
              <text x="50" y="48" font-family="monospace" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">R.I.P</text>`;
    case 72: // GG Pixel
      return `<rect x="28" y="32" width="44" height="28" rx="4" fill="none" stroke="${c}" stroke-width="3" />
              <text x="50" y="52" font-family="monospace" font-size="18" font-weight="900" fill="${c}" text-anchor="middle">GG</text>`;
    case 73: // Pink Pig
      return `<rect x="26" y="24" width="48" height="42" rx="8" fill="${a}" />
              <ellipse cx="50" cy="45" rx="16" ry="10" fill="#ffffff" />`;
    case 74: // Cherry Blossoms
      return `<circle cx="44" cy="40" r="10" fill="${c}" /><circle cx="58" cy="44" r="10" fill="${a}" /><circle cx="50" cy="54" r="9" fill="${c}" />`;
    case 75: // Royal Flush Poker
      return `<path d="M32 30 L46 26 L52 56 L38 60 Z M46 26 L60 26 L60 58 L46 58 Z M60 26 L74 30 L68 60 L54 56 Z" fill="#ffffff" stroke="${c}" stroke-width="2" />
              <text x="50" y="48" font-family="sans-serif" font-size="12" font-weight="900" fill="${c}" text-anchor="middle">♥</text>`;

    // 76 - 90
    case 76: // Gift Box
      return `<rect x="32" y="38" width="36" height="28" rx="3" fill="${c}" />
              <rect x="28" y="32" width="44" height="8" rx="2" fill="${a}" />
              <line x1="50" y1="32" x2="50" y2="66" stroke="#ffffff" stroke-width="4" />`;
    case 77: // Lightning Bolt Circle
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="3" />
              <polygon points="52,24 40,44 49,44 46,66 62,42 52,42" fill="${c}" />`;
    case 78: // Golden Castle
      return `<rect x="32" y="42" width="36" height="24" fill="${c}" />
              <polygon points="32,42 32,34 38,34 38,42 44,42 44,34 50,34 50,42 56,42 56,34 62,34 62,42 68,42 68,34" fill="${c}" />
              <path d="M46 66 L46 54 Q50 50 54 54 L54 66 Z" fill="#0f172a" />`;
    case 79: // Hatching Chick
      return `<circle cx="50" cy="45" r="18" fill="${c}" />
              <polygon points="32,54 40,46 48,54 56,46 64,54 68,46 68,64 32,64" fill="#ffffff" />
              <polygon points="46,42 52,46 46,50" fill="#ea580c" />`;
    case 80: // Stock Chart Green
      return `<polyline points="30,62 44,52 54,56 70,30" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <polygon points="70,30 62,30 70,38" fill="${c}" />`;
    case 81: // Dumpster Fire Cute
      return `<rect x="32" y="42" width="36" height="24" rx="2" fill="${c}" />
              <path d="M42 42 Q46 26 50 20 Q54 26 58 42 Z" fill="#f97316" />
              <circle cx="44" cy="52" r="2" fill="#0f172a" /><circle cx="56" cy="52" r="2" fill="#0f172a" />`;
    case 82: // White Tiger
      return `<circle cx="50" cy="45" r="24" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
              <path d="M40 38 L44 48 M60 38 L56 48 M50 32 L50 42" stroke="#0f172a" stroke-width="2" />`;
    case 83: // Alien Green
      return `<path d="M34 34 Q50 20 66 34 Q70 54 50 68 Q30 54 34 34 Z" fill="${c}" />
              <ellipse cx="42" cy="42" rx="4" ry="7" fill="#0f172a" transform="rotate(-15 42 42)" />
              <ellipse cx="58" cy="42" rx="4" ry="7" fill="#0f172a" transform="rotate(15 58 42)" />`;
    case 84: // Golden Scorpion Circle
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M50 62 Q62 52 62 38 L54 32 Q42 44 42 56 Z" fill="${c}" />`;
    case 85: // Briefcase Shield
      return `<path d="M32 26 L68 26 L68 48 Q68 64 50 70 Q32 64 32 48 Z" fill="none" stroke="${c}" stroke-width="3" />
              <rect x="40" y="40" width="20" height="14" rx="2" fill="${c}" />`;
    case 86: // Sunglasses Emoji
      return `<circle cx="50" cy="45" r="24" fill="${c}" />
              <rect x="34" y="38" width="14" height="8" rx="2" fill="#0f172a" />
              <rect x="52" y="38" width="14" height="8" rx="2" fill="#0f172a" />
              <line x1="48" y1="42" x2="52" y2="42" stroke="#0f172a" stroke-width="2" />`;
    case 87: // Diamond Hands
      return `<path d="M34 54 L44 38 L50 44 L42 60 Z M66 54 L56 38 L50 44 L58 60 Z" fill="${c}" />
              <polygon points="50,30 58,38 50,48 42,38" fill="#38bdf8" />`;
    case 88: // #1 Ribbon
      return `<rect x="42" y="24" width="16" height="30" rx="3" fill="${c}" />
              <text x="50" y="45" font-family="sans-serif" font-size="20" font-weight="900" fill="#0f172a" text-anchor="middle">1</text>`;
    case 89: // Red Devil
      return `<path d="M36 34 Q50 30 64 34 Q68 54 50 66 Q32 54 36 34 Z" fill="${c}" />
              <polygon points="38,34 32,24 44,28" fill="${c}" /><polygon points="62,34 68,24 56,28" fill="${c}" />`;
    case 90: // Cool Gamer
      return `<circle cx="50" cy="45" r="22" fill="${c}" />
              <rect x="36" y="40" width="28" height="8" rx="2" fill="#0f172a" />
              <path d="M36 52 Q50 60 64 52" stroke="#0f172a" stroke-width="3" fill="none" />`;

    // 91 - 105
    case 91: // Red Wolf
      return `<path d="M38 64 Q32 46 44 34 L56 24 L52 38 Q68 46 64 64 Z" fill="${c}" />`;
    case 92: // Bigfoot
      return `<circle cx="50" cy="45" r="26" fill="#0284c7" />
              <path d="M46 28 Q50 24 54 28 L56 42 L64 64 L54 64 L50 48 L46 64 L36 64 Z" fill="#ffffff" />`;
    case 93: // Jester Hat
      return `<path d="M32 58 Q36 38 22 36 Q38 34 44 48 Q50 26 56 48 Q62 34 78 36 Q64 38 68 58 Z" fill="${c}" />
              <circle cx="22" cy="36" r="3" fill="#fbbf24" /><circle cx="78" cy="36" r="3" fill="#fbbf24" />`;
    case 94: // Crown in Star
      return `<circle cx="50" cy="45" r="24" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="6 3" />
              <polygon points="40,50 44,40 50,46 56,40 60,50 60,54 40,54" fill="${c}" />`;
    case 95: // Hot Chili Pepper
      return `<path d="M42 34 Q46 22 62 26 Q64 48 48 64 Q38 64 42 34 Z" fill="${c}" />
              <path d="M60 26 Q64 20 60 16" stroke="#22c55e" stroke-width="3" fill="none" />`;
    case 96: // Golden Key in Rings
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="3" />
              <circle cx="40" cy="45" r="8" fill="none" stroke="${c}" stroke-width="3" />
              <line x1="48" y1="45" x2="68" y2="45" stroke="${c}" stroke-width="3.5" />
              <line x1="64" y1="45" x2="64" y2="52" stroke="${c}" stroke-width="3" />`;
    case 97: // Silver Military Wings
      return `<path d="M26 38 L50 48 L74 38 L68 56 L50 66 L32 56 Z" fill="${c}" />`;
    case 98: // Sword in the Stone
      return `<polygon points="34,64 66,64 58,50 42,50" fill="${c}" />
              <line x1="50" y1="24" x2="50" y2="52" stroke="#ffffff" stroke-width="3.5" />
              <line x1="42" y1="32" x2="58" y2="32" stroke="#ffffff" stroke-width="3" />`;
    case 99: // Thumbs Up
      return `<path d="M38 60 L38 46 L46 46 L54 28 Q58 28 58 34 L56 42 L66 42 Q70 42 70 48 L66 60 Z" fill="${c}" />`;
    case 100: // 4 Card Suits
      return `<text x="40" y="40" font-size="14" fill="#ef4444" text-anchor="middle">♥</text>
              <text x="60" y="40" font-size="14" fill="#38bdf8" text-anchor="middle">♠</text>
              <text x="40" y="58" font-size="14" fill="#38bdf8" text-anchor="middle">♣</text>
              <text x="60" y="58" font-size="14" fill="#ef4444" text-anchor="middle">♦</text>`;
    case 101: // Celtic Triple Swords
      return `<line x1="50" y1="20" x2="50" y2="70" stroke="${c}" stroke-width="3.5" />
              <line x1="38" y1="26" x2="62" y2="64" stroke="${c}" stroke-width="3" />
              <line x1="62" y1="26" x2="38" y2="64" stroke="${c}" stroke-width="3" />`;
    case 102: // Mountain Star
      return `<polygon points="26,62 50,30 74,62" fill="${c}" />
              <polygon points="50,22 52,26 56,26 53,29 54,33 50,30 46,33 47,29 44,26 48,26" fill="#ffffff" />`;
    case 103: // Orange Dragon
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="4" />
              <path d="M42 32 Q62 38 58 56 Q48 64 40 54 L52 46" fill="${c}" />`;
    case 104: // Orange Cowboy
      return `<ellipse cx="50" cy="38" rx="24" ry="6" fill="${c}" />
              <path d="M38 44 Q50 64 62 44 Z" fill="${c}" />`;
    case 105: // Sheriff Star Boot
      return `<polygon points="50,20 56,32 68,32 60,42 64,54 50,46 36,54 40,42 32,32 44,32" fill="${c}" />
              <circle cx="50" cy="38" r="4" fill="#0f172a" />`;

    // 106 - 120
    case 106: // Tech Cross Shield
      return `<rect x="42" y="24" width="16" height="42" rx="4" fill="${c}" />
              <rect x="28" y="38" width="44" height="14" rx="4" fill="${c}" />`;
    case 107: // Saluting Soldier
      return `<path d="M30 26 L70 26 L70 48 Q70 66 50 72 Q30 66 30 48 Z" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M42 54 L50 36 L62 44" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none" />`;
    case 108: // Dog Cat Circle
      return `<circle cx="50" cy="45" r="24" fill="${c}" />
              <circle cx="44" cy="44" r="3" fill="#ffffff" /><circle cx="56" cy="44" r="3" fill="#ffffff" />`;
    case 109: // Dancing Friends Heart
      return `<path d="M50 66 C30 50 30 32 42 32 C48 32 50 38 50 38 C50 38 52 32 58 32 C70 32 70 50 50 66 Z" fill="${c}" />`;
    case 110: // Flaming Bull
      return `<path d="M42 44 L58 44 L50 64 Z" fill="${c}" />
              <path d="M36 34 Q34 22 44 32 M64 34 Q66 22 56 32" stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none" />`;
    case 111: // Stop Hand
      return `<polygon points="34,24 66,24 76,34 76,56 66,66 34,66 24,56 24,34" fill="${c}" />
              <line x1="38" y1="45" x2="62" y2="45" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />`;
    case 112: // Pink Fleur Swords
      return `<line x1="28" y1="45" x2="72" y2="45" stroke="${c}" stroke-width="4" />
              <path d="M50 32 Q42 42 50 54 Q58 42 50 32 Z" fill="${c}" />`;
    case 113: // King Cobra
      return `<path d="M36 36 Q50 24 64 36 Q68 52 50 66 Q32 52 36 36 Z" fill="${c}" />
              <line x1="50" y1="42" x2="50" y2="58" stroke="#ffffff" stroke-width="3" />`;
    case 114: // Scream Mask
      return `<path d="M36 32 Q50 20 64 32 Q68 56 50 68 Q32 56 36 32 Z" fill="#ffffff" />
              <ellipse cx="44" cy="42" rx="3" ry="7" fill="#0f172a" /><ellipse cx="56" cy="42" rx="3" ry="7" fill="#0f172a" />
              <ellipse cx="50" cy="56" rx="4" ry="8" fill="#0f172a" />`;
    case 115: // Chelsea Lion Shield
      return `<path d="M30 26 L70 26 L70 48 Q70 66 50 72 Q30 66 30 48 Z" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M42 42 Q50 34 58 42 Q60 54 50 62 Q40 54 42 42 Z" fill="${c}" />`;
    case 116: // Pirate Captain Skull
      return `<path d="M28 36 Q50 24 72 36 L64 42 L36 42 Z" fill="${c}" />
              <circle cx="50" cy="52" r="12" fill="#ffffff" />
              <circle cx="46" cy="50" r="2.5" fill="#0f172a" /><circle cx="54" cy="50" r="2.5" fill="#0f172a" />`;
    case 117: // Dripping Vampire Lips
      return `<path d="M32 46 Q50 38 68 46 Q50 56 32 46 Z" fill="${c}" />
              <polygon points="42,46 45,56 48,46" fill="#ffffff" /><polygon points="52,46 55,56 58,46" fill="#ffffff" />`;
    case 118: // Battle Swords Shield
      return `<line x1="28" y1="24" x2="72" y2="66" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <line x1="72" y1="24" x2="28" y2="66" stroke="${c}" stroke-width="4" stroke-linecap="round" />
              <circle cx="50" cy="45" r="14" fill="${c}" />`;
    case 119: // Swirling Golden Sun
      return `<circle cx="50" cy="45" r="14" fill="${c}" />
              ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
                <path d="M50 24 Q56 28 52 34" stroke="${c}" stroke-width="3" stroke-linecap="round" transform="rotate(${deg} 50 45)" />
              `).join('')}`;
    case 120: // Squad Trio
      return `<circle cx="50" cy="34" r="5" fill="${c}" /><rect x="45" y="42" width="10" height="22" rx="3" fill="${c}" />
              <circle cx="36" cy="38" r="4" fill="${a}" /><rect x="32" y="44" width="8" height="20" rx="2" fill="${a}" />
              <circle cx="64" cy="38" r="4" fill="${a}" /><rect x="60" y="44" width="8" height="20" rx="2" fill="${a}" />`;

    // 121 - 135
    case 121: // Blue Flying Owl
      return `<circle cx="50" cy="45" r="26" fill="${c}" />
              <path d="M32 38 Q50 46 68 38 Q60 56 50 56 Q40 56 32 38 Z" fill="#ffffff" />`;
    case 122: // Blue Knight Plumes
      return `<path d="M42 38 Q50 26 62 36 L58 56 Q50 64 42 56 Z" fill="${c}" />
              <path d="M60 28 Q74 24 72 38" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />`;
    case 123: // VIP Sword
      return `<text x="50" y="52" font-family="sans-serif" font-size="20" font-weight="900" fill="${c}" text-anchor="middle">VIP</text>
              <line x1="50" y1="20" x2="50" y2="68" stroke="${c}" stroke-width="2.5" />`;
    case 124: // Green Star Medal
      return `<polygon points="50,40 54,48 64,48 56,54 59,64 50,58 41,64 44,54 36,48 46,48" fill="${c}" />
              <rect x="42" y="24" width="16" height="12" fill="${a}" />`;
    case 125: // Bodybuilder Flex
      return `<circle cx="50" cy="32" r="6" fill="${c}" />
              <path d="M42 42 L58 42 L54 60 L46 60 Z" fill="${c}" />
              <path d="M42 44 Q28 44 32 32 M58 44 Q72 44 68 32" stroke="${c}" stroke-width="4.5" stroke-linecap="round" fill="none" />`;
    case 126: // Gold Bullion Bars
      return `<polygon points="34,54 50,48 66,54 50,60" fill="${c}" stroke="#0f172a" stroke-width="1.5" />
              <polygon points="42,42 58,36 74,42 58,48" fill="${c}" stroke="#0f172a" stroke-width="1.5" />`;
    case 127: // Lion Rampant Shield
      return `<path d="M30 26 L70 26 L70 48 Q70 66 50 72 Q30 66 30 48 Z" fill="none" stroke="${c}" stroke-width="3" />
              <path d="M44 60 L48 48 L44 42 Q52 34 56 42 L62 44 L56 50 L58 60 Z" fill="${c}" />`;
    case 128: // Sagittarius Centaur
      return `<polygon points="34,28 66,28 66,60 34,60" fill="none" stroke="${c}" stroke-width="2.5" transform="rotate(45 50 44)" />
              <line x1="36" y1="54" x2="64" y2="34" stroke="${c}" stroke-width="3" stroke-linecap="round" />
              <polygon points="64,34 56,36 62,42" fill="${c}" />`;
    case 129: // Fist Punching Anvil
      return `<path d="M34 56 L66 56 L60 64 L40 64 Z" fill="#ffffff" />
              <rect x="42" y="32" width="16" height="18" rx="4" fill="${c}" />
              <path d="M38 46 L30 42 M62 46 L70 42" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />`;
    case 130: // Eagle Black Flag
      return `<line x1="32" y1="22" x2="32" y2="68" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
              <path d="M32 24 L72 32 L32 44 Z" fill="${a}" />
              <circle cx="48" cy="34" r="5" fill="${c}" />`;
    case 131: // Red Rose Blade Crest
      return `<circle cx="50" cy="45" r="16" fill="${c}" />
              <path d="M50 22 L54 36 L50 40 L46 36 Z M50 68 L54 54 L50 50 L46 54 Z" fill="${a}" />
              <line x1="32" y1="45" x2="68" y2="45" stroke="${a}" stroke-width="2" />`;
    case 132: // Mint Ghost
      return `<path d="M34 44 Q34 26 50 26 Q66 26 66 44 Q66 64 58 60 Q50 66 42 60 Q34 64 34 44 Z" fill="${c}" />
              <circle cx="45" cy="40" r="2.5" fill="#022c22" /><circle cx="55" cy="40" r="2.5" fill="#022c22" />`;
    case 133: // Synthwave Sunset Palm
      return `<circle cx="50" cy="45" r="26" fill="${c}" />
              <line x1="26" y1="48" x2="74" y2="48" stroke="#0f172a" stroke-width="2" />
              <line x1="28" y1="54" x2="72" y2="54" stroke="#0f172a" stroke-width="2.5" />
              <path d="M46 62 Q52 46 60 40" stroke="#0f172a" stroke-width="3" fill="none" stroke-linecap="round" />`;
    case 134: // Spartan Helmet
      return `<circle cx="50" cy="45" r="26" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="8 4" />
              <path d="M40 34 Q50 26 60 34 L62 50 L54 48 L50 62 L46 48 L38 50 Z" fill="${c}" />`;
    case 135: // Claw Scratch Tear
      return `<path d="M30 26 Q40 46 36 64 M44 22 Q52 44 48 68 M58 24 Q64 46 60 66 M70 28 Q76 46 72 62" stroke="${c}" stroke-width="4.5" stroke-linecap="round" fill="none" />`;

    default:
      return `<circle cx="50" cy="45" r="24" fill="none" stroke="${c}" stroke-width="3" />
              <text x="50" y="52" font-size="20" font-weight="900" fill="${c}" text-anchor="middle">${id}</text>`;
  }
}

// Category helpers
function getCategoryName(id: number): string {
  if (id <= 30) return 'คลาสสิก (01-30)';
  if (id <= 40) return 'เขียวนีออน (31-40)';
  if (id <= 50) return 'ฟ้าเทอร์ควอยซ์ (41-50)';
  if (id <= 55) return 'ทองคำเรืองรอง (51-55)';
  if (id <= 60) return 'ม่วงมังกร (56-60)';
  if (id <= 75) return 'สีสันพิเศษ (61-75)';
  if (id <= 90) return 'ไอคอนมีม & กีฬา (76-90)';
  if (id <= 105) return 'ตำนานนักรบ (91-105)';
  if (id <= 120) return 'สมรภูมิ & สยองขวัญ (106-120)';
  return 'ยอดฝีมือ (121-135)';
}

function getEmblemThaiName(id: number): string {
  const names: Record<number, string> = {
    1: 'หมาป่าในวงกลม', 2: 'แมงมุมทมิฬ', 3: 'เต่าเหล็กไหล', 4: 'เสือสมิง', 5: 'ธงศึกคู่',
    6: 'อีกาในดวงจันทร์', 7: 'บงกชแปดกลีบ', 8: 'ผีเสื้อราตรี', 9: 'หมาป่าหิมะ', 10: 'เข็มทิศแปดทิศ',
    11: 'คัมภีร์เวท', 12: 'อาชาคะนองศึก', 13: 'นาฬิกาทรายกาลเวลา', 14: 'ค้อนช่างตีเหล็ก', 15: 'มัสยาคู่',
    16: 'โล่กางเขนศักดิ์สิทธิ์', 17: 'เหยี่ยวเวหา', 18: 'นกฮูกจันทรา', 19: 'เพลิงสุริยัน', 20: 'กวางพฤกษา',
    21: 'ราชสีห์พิทักษ์', 22: 'แกะทองคำ', 23: 'หน่อไม้แห่งชีวิต', 24: 'หน้าไม้สังหาร', 25: 'วิญญาณน้อย',
    26: 'ดาบคู่พิทักษ์โล่', 27: 'ปักษาสวรรค์', 28: 'ตราชั่งเที่ยงธรรม', 29: 'เกราะอัศวินโบราณ', 30: 'ศรเทวะ',
    31: 'แมวนีออน', 32: 'กรงเล็บหมีหยก', 33: 'หมาป่าพรายเขียว', 34: 'อินทรีมรกต', 35: 'เข็มทิศปัญญา',
    36: 'มังกรพิษเขียว', 37: 'แมงป่องมรกต', 38: 'หทัยพฤกษา', 39: 'กะโหลกพิษ', 40: 'เสือดาวหยก',
    41: 'ปีกบัวคราม', 42: 'เสี้ยวจันทราดวงดาว', 43: 'ตรานักฆ่าวารี', 44: 'ดารามิติ', 45: 'เพชรไพลิน',
    46: 'ยมทูตเคียวฟ้า', 47: 'สิงโตมงกุฎคราม', 48: 'ตุ๊กตาสาปแช่ง', 49: 'พันธมิตรไร้พ่าย', 50: 'กะโหลกราชันย์',
    51: 'วิหคเพลิงฟีนิกซ์ทอง', 52: 'ยูนิคอร์นทองคำ', 53: 'ดาบปีกเทพทอง', 54: 'สุริยเทพทองคำ', 55: 'ถ้วยทองแชมป์เปี้ยน',
    56: 'มังกรม่วงวน', 57: 'ไวเวิร์นม่วง', 58: 'พญามังกรคลั่ง', 59: 'มงกุฎจักรพรรดิม่วง', 60: 'มังกรปีศาจม่วง',
    61: 'โล่สามมิติฟ้า', 62: 'จรวดท่องอวกาศ', 63: 'อินทรีอเมริกัน', 64: 'รถแคมป์เปอร์ผจญภัย', 65: 'เป้าธนูเล็งเป้า',
    66: 'ชิบะอินุชิลด์ Doge', 67: 'ถ้วยเกียรติยศช่อมะกอก', 68: 'จิ๊กซอว์รวมพลัง', 69: 'คาวบอยโจรสลัด', 70: 'นวมศึกเลือดสาด',
    71: 'ป้ายหลุมศพ R.I.P', 72: 'Good Game พิกเซล', 73: 'หมูชมพูนำโชค', 74: 'ซากุระบานสะพรั่ง', 75: 'รอยัลสเตรทฟลัช',
    76: 'กล่องของขวัญสุขสันต์', 77: 'อัสนีบาตเขียว', 78: 'ป้อมปราการทอง', 79: 'ลูกเจี๊ยบนักสู้', 80: 'กราฟหุ้นขึ้นสู่ดวงจันทร์',
    81: 'ถังขยะไฟลุก Dumpster', 82: 'พยัคฆ์ขาวคำราม', 83: 'เอเลี่ยนต่างดาว', 84: 'แมงป่องทองคำ', 85: 'กระเป๋าเศรษฐี',
    86: 'แว่นดำสุดเท่', 87: 'มือเพชร Diamond Hands', 88: 'ริบบิ้นยอดเยี่ยมอันดับ 1', 89: 'ปีศาจน้อยขี้เล่น', 90: 'เกมเมอร์พันธุ์แท้',
    91: 'หมาป่าโลหิตแดง', 92: 'บิ๊กฟุตป่าลึก', 93: 'เจสเตอร์หน้ากากเลือด', 94: 'ดารามงกุฎทอง', 95: 'พริกไฟเผ็ดร้อน',
    96: 'กุญแจทองคำไขคลัง', 97: 'ปีกเกียรติยศทหาร', 98: 'ดาบเอ็กซ์คาลิเบอร์ในศิลา', 99: 'ยกนิ้วโป้งเยี่ยมยอด', 100: 'สี่สัญลักษณ์สำรับไพ่',
    101: 'สามกระบี่เซลติก', 102: 'ยอดเขาหิมะดาราสวรรค์', 103: 'มังกรเพลิงส้ม', 104: 'นักสืบเงามืด', 105: 'ดาวนายอำเภอคาวบอย',
    106: 'กางเขนเทคโนโลยีเขียว', 107: 'ทหารกล้าทำความเคารพ', 108: 'หมาแมวคู่หู', 109: 'มิตรภาพหัวใจชมพู', 110: 'กระทิงเพลิงพิโรธ',
    111: 'ป้ายหยุดคำสั่งเด็ดขาด', 112: 'ธงดาบดอกลิลลี่ชมพู', 113: 'พญางูจงอางแดง', 114: 'หน้ากากหวีดสยอง Scream', 115: 'สิงโตเกราะน้ำเงินแดง',
    116: 'กัปตันโจรสลัดโครงกระดูก', 117: 'เขี้ยวแวมไพร์กระหายเลือด', 118: 'โล่ดาบไขว้ศึกสีชาด', 119: 'สุริยันหมุนวนทอง', 120: 'สามทหารเสือรวมใจ',
    121: 'นกฮูกเวหาคราม', 122: 'อัศวินเกราะน้ำเงิน', 123: 'ดาบ VIP นีออนม่วง', 124: 'ดาราดาวทหารกล้า', 125: 'นักกล้ามพลังเวท',
    126: 'ทองคำแท่งมั่งคั่ง', 127: 'สิงโตผงาดโล่ทอง', 128: 'เซนทอร์นักแม่นปืนทอง', 129: 'หมัดเหล็กตีทั่งประกายไฟ', 130: 'ธงอินทรีทมิฬทอง',
    131: 'กุหลาบแดงดาบศักดิ์สิทธิ์', 132: 'ผีน้อยมินต์เรืองแสง', 133: 'อาทิตย์อัสดง Synthwave', 134: 'หมวกนักรบสปาร์ตันแดง', 135: 'รอยกรงเล็บสังหารสัตว์ร้าย'
  };
  return names[id] || `สัญลักษณ์ ${String(id).padStart(2, '0')}`;
}

// Generate all 135 emblems with dataUrl precomputed
export const ALL_CLAN_EMBLEMS: ClanEmblem[] = Array.from({ length: 135 }, (_, index) => {
  const id = index + 1;
  const pad = String(id).padStart(2, '0');
  const svg = generateEmblemSvg(id);
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return {
    id,
    label: `สัญลักษณ์ ${pad}`,
    name: getEmblemThaiName(id),
    category: getCategoryName(id),
    themeColor: id <= 30 ? '#ffffff' : (id <= 40 ? '#4ade80' : (id <= 50 ? '#38bdf8' : (id <= 55 ? '#fbbf24' : (id <= 60 ? '#c084fc' : '#f43f5e')))),
    dataUrl,
  };
});
