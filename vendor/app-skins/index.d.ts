export interface SkinInfo { id: string; name: string; blurb: string; scheme: 'light' | 'dark'; swatch: [string, string, string]; hasArt: boolean }
export declare const SKINS: SkinInfo[]
export declare function isSkin(id: string | null | undefined): boolean
export declare function applySkin(id: string | null | undefined, root?: HTMLElement): unknown
