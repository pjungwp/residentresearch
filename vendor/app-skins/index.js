// app-skins — tiny runtime helper. Import "app-skins/skins.css" once, then call applySkin().
import { SKINS as ALL } from './skins.data.mjs'

/** Skin list for building a picker: id, name, blurb, scheme ('light' | 'dark') and a 3-colour swatch. */
export const SKINS = ALL.map((s) => ({ id: s.id, name: s.name, blurb: s.blurb, scheme: s.scheme, swatch: [s.t.bg, s.t.hdr1.startsWith('rgb') ? s.t.surface2 : s.t.hdr1, s.t.accent], hasArt: !!(s.art?.wide || s.art?.deco) }))

export const isSkin = (id) => ALL.some((s) => s.id === id)

/** Turns a skin on (or off with null). Sets <html data-skin> and the browser colour scheme. */
export function applySkin(id, root = document.documentElement) {
  const s = ALL.find((x) => x.id === id)
  if (!s) { delete root.dataset.skin; root.style.removeProperty('color-scheme'); return null }
  root.dataset.skin = s.id
  root.style.colorScheme = s.scheme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', s.t.hdr1.startsWith('rgb') ? s.t.bg : s.t.hdr1)
  return s
}
