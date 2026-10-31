/**
 * The skin pack's single source of truth. Every skin fills the same ~30 tokens (--sk-*);
 * each app maps these onto its own colour names in a small adapter.
 */
const lightStatus = { ok: '#2b7a4b', okBg: '#e3f3e9', warn: '#8c5d00', warnBg: '#fdf0d2', err: '#b42318', errBg: '#fde4e1' }
const darkStatus = { ok: '#7fd8a2', okBg: '#173326', warn: '#f2c979', warnBg: '#3a2f14', err: '#ff9f92', errBg: '#45201c' }

export const SKINS = [
  {
    id: 'minimal', name: 'Modern Minimal', blurb: 'Clean, airy and professional', scheme: 'light',
    t: { bg: '#f6f7f9', surface: '#ffffff', surface2: '#f1f3f6', line: '#e3e7ec', ink: '#1a2130', sub: '#566074', faint: '#8a93a4',
      accent: '#2f6fe4', accent2: '#2459c2', accentSoft: '#e7effd', onAccent: '#ffffff', accentText: '#2459c2',
      hdr1: '#ffffff', hdr2: '#ffffff', hdrInk: '#1a2130', radius: '14px', radiusSm: '10px',
      shadow: '0 1px 2px rgb(16 24 40 / .05), 0 4px 14px rgb(16 24 40 / .05)', blur: 'none', tintMix: '38%',
      display: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', displayWeight: '750', cell: '#ffffff', cellLine: '#e3e7ec', cellBorder: '1px', cellRadius: '10px', cellShadow: '0 1px 2px rgb(16 24 40 / .06)', cellTint: '20%', ...lightStatus },
  },
  {
    id: 'elegant', name: 'Dark Elegant', blurb: 'Black and gold, refined', scheme: 'dark',
    t: { bg: '#0d0c0a', surface: '#17150f', surface2: '#1f1c15', line: '#2f2a1e', ink: '#f1e9d8', sub: '#c4b89f', faint: '#8f846c',
      accent: '#c9a24a', accent2: '#e0bd6c', accentSoft: '#2a2414', onAccent: '#18130a', accentText: '#e3c477',
      hdr1: '#0d0c0a', hdr2: '#1a170f', hdrInk: '#f1e9d8', radius: '12px', radiusSm: '8px',
      shadow: '0 1px 0 rgb(201 162 74 / .12) inset, 0 8px 24px rgb(0 0 0 / .35)', blur: 'none', tintMix: '20%',
      display: '"Cormorant Garamond", Georgia, serif', displayWeight: '600', cell: 'rgb(23 21 15 / .9)', cellLine: 'rgb(201 162 74 / .38)', cellBorder: '1px', cellRadius: '6px', cellShadow: 'none', cellTint: '12%', ...darkStatus },
    art: { deco: 'art/elegant-corner-bl.webp', deco2: 'art/elegant-corner-tr.webp', extras: ['art/elegant-branch.webp', 'art/elegant-sprig.webp', 'art/elegant-divider.webp'] },
  },
  {
    id: 'glass', name: 'Glass', blurb: 'Dusk gradient with frosted panels', scheme: 'dark',
    t: { bg: '#3a2d6e', surface: 'rgb(44 34 100 / .38)', surface2: 'rgb(44 34 100 / .26)', line: 'rgb(255 255 255 / .26)', ink: '#ffffff', sub: 'rgb(255 255 255 / .84)', faint: 'rgb(255 255 255 / .64)',
      accent: '#ffb48c', accent2: '#ffc9a8', accentSoft: 'rgb(255 255 255 / .18)', onAccent: '#2a1f4f', accentText: '#ffd2b8',
      hdr1: 'rgb(36 28 88 / .45)', hdr2: 'rgb(36 28 88 / .30)', hdrInk: '#ffffff', radius: '20px', radiusSm: '14px',
      shadow: '0 8px 30px rgb(20 10 60 / .25)', blur: 'blur(18px) saturate(1.2)', tintMix: '30%',
      display: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', displayWeight: '700', cell: 'rgb(255 255 255 / .16)', cellLine: 'rgb(255 255 255 / .32)', cellBorder: '1px', cellRadius: '14px', cellShadow: '0 4px 14px rgb(20 10 60 / .18)', cellTint: '16%', ...darkStatus },
    art: { wide: 'art/glass-wide.webp', tall: 'art/glass-tall.webp' },
  },
  {
    id: 'editorial', name: 'Editorial', blurb: 'Magazine serif, cream paper', scheme: 'light',
    t: { bg: '#f6f0e4', surface: '#fffaf1', surface2: '#f0e7d6', line: '#dccfb6', ink: '#1e1a15', sub: '#584e42', faint: '#8a7f70',
      accent: '#7d2e2e', accent2: '#622323', accentSoft: '#f1e0d6', onAccent: '#ffffff', accentText: '#7d2e2e',
      hdr1: '#f6f0e4', hdr2: '#f6f0e4', hdrInk: '#1e1a15', radius: '6px', radiusSm: '4px',
      shadow: 'none', blur: 'none', tintMix: '34%',
      display: '"Playfair Display", Georgia, serif', displayWeight: '600', cell: 'rgb(255 250 241 / .92)', cellLine: '#cdbfa4', cellBorder: '1px', cellRadius: '2px', cellShadow: 'none', cellTint: '14%', ...lightStatus },
    art: { deco: 'art/editorial-magnolia-branch.webp', deco2: 'art/editorial-magnolia-sprig.webp', extras: ['art/editorial-magnolia-bloom.webp', 'art/editorial-petals.webp'] },
  },
  {
    id: 'impressionist', name: 'Impressionist', blurb: 'Painted riverside at golden hour', scheme: 'light',
    t: { bg: '#e8d6b8', surface: 'rgb(255 249 238 / .86)', surface2: 'rgb(255 244 226 / .78)', line: 'rgb(120 88 48 / .22)', ink: '#2b2216', sub: '#5c4930', faint: '#86704f',
      accent: '#2f5d8a', accent2: '#244a70', accentSoft: 'rgb(47 93 138 / .14)', onAccent: '#ffffff', accentText: '#244a70',
      hdr1: 'rgb(255 247 232 / .78)', hdr2: 'rgb(255 240 215 / .70)', hdrInk: '#2b2216', radius: '18px', radiusSm: '12px',
      shadow: '0 6px 22px rgb(70 45 15 / .16)', blur: 'blur(10px) saturate(1.1)', tintMix: '40%',
      display: '"Cormorant Garamond", Georgia, serif', displayWeight: '600', displayStyle: 'italic', cell: 'rgb(255 249 238 / .58)', cellLine: 'rgb(255 255 255 / .6)', cellBorder: '1px', cellRadius: '14px', cellShadow: '0 4px 12px rgb(70 45 15 / .14)', cellTint: '20%', ...lightStatus },
    art: { wide: 'art/impressionist-wide.webp', tall: 'art/impressionist-tall.webp' },
  },
  {
    id: 'playful', name: 'Playful', blurb: 'Cozy storybook, warm and friendly', scheme: 'light',
    t: { bg: '#fbf3e6', surface: '#fffaf2', surface2: '#f7ecd9', line: '#ecdcc2', ink: '#3a2a1c', sub: '#6b5440', faint: '#9a8268',
      accent: '#d9652c', accent2: '#bd5423', accentSoft: '#fde4d2', onAccent: '#ffffff', accentText: '#b4501f',
      hdr1: '#fbf3e6', hdr2: '#fbf3e6', hdrInk: '#3a2a1c', radius: '22px', radiusSm: '16px',
      shadow: '0 4px 0 #ecdcc2', blur: 'none', tintMix: '40%',
      display: '"Fredoka", ui-rounded, system-ui, sans-serif', displayWeight: '600', cell: '#fffaf2', cellLine: '#ecdcc2', cellBorder: '1.5px', cellRadius: '18px', cellShadow: '0 3px 0 #ecdcc2', cellTint: '22%', ...lightStatus },
    art: { deco: 'art/playful-cat.webp', deco2: 'art/playful-vine.webp', extras: ['art/playful-mug-books.webp', 'art/playful-plant.webp', 'art/playful-sprig.webp', 'art/playful-papers.webp', 'art/playful-lamp.webp', 'art/playful-heart.webp'] },
  },
  {
    id: 'pop', name: 'Pop', blurb: 'Bold comic red, black and cream', scheme: 'light',
    t: { bg: '#c40000', surface: '#fff8ec', surface2: '#f2e7d6', line: '#111111', ink: '#111111', sub: '#3b3b3b', faint: '#666666',
      accent: '#111111', accent2: '#333333', accentSoft: '#ffd9d2', onAccent: '#ffffff', accentText: '#b00000',
      hdr1: '#111111', hdr2: '#1c1c1c', hdrInk: '#ffffff', radius: '4px', radiusSm: '3px',
      shadow: '5px 5px 0 #111111', blur: 'none', tintMix: '32%',
      display: '"Anton", Impact, "Arial Narrow", sans-serif', displayWeight: '400', cell: '#fff8ec', cellLine: '#111111', cellBorder: '2px', cellRadius: '3px', cellShadow: '3px 3px 0 #111111', cellTint: '16%', ...lightStatus },
    art: { wide: 'art/pop-wide.webp', tall: 'art/pop-tall.webp', deco2: 'art/pop-interrobang.webp', extras: ['art/pop-burst.webp', 'art/pop-star-outline.webp', 'art/pop-arrow.webp', 'art/pop-missions.webp', 'art/pop-levelup.webp', 'art/pop-week1.webp', 'art/pop-complete.webp', 'art/pop-new.webp', 'art/pop-inprogress.webp', 'art/pop-locked.webp'] },
  },
]

export const TOKEN_NAMES = {
  bg: 'page background colour', surface: 'cards and panels', surface2: 'wells, strips, secondary panels', line: 'borders',
  ink: 'main text', sub: 'secondary text', faint: 'hints', accent: 'buttons and active states', accent2: 'hover / pressed accent',
  accentSoft: 'selected backgrounds', onAccent: 'text on accent buttons', accentText: 'links and accent-coloured text',
  hdr1: 'header gradient start', hdr2: 'header gradient end', hdrInk: 'header text', radius: 'card corner radius', radiusSm: 'control corner radius',
  shadow: 'card shadow', blur: 'backdrop-filter for panels (none = solid)', tintMix: 'how strongly to tint cells with a person/category colour',
  cell: 'calendar/grid cell background (may be see-through)', cellLine: 'cell border colour', cellBorder: 'cell border width', cellRadius: 'cell corner radius', cellShadow: 'cell shadow', cellTint: 'how much a person/category colour tints a cell',
  display: 'heading font', displayWeight: 'heading weight', ok: 'success text', okBg: 'success background', warn: 'warning text', warnBg: 'warning background', err: 'error text', errBg: 'error background',
}
