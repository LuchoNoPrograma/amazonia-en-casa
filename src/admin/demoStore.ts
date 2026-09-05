import { useEffect, useState } from 'react';
import { PRODUCTS } from '../data/products';
import { LEGACY_PRODUCTS } from '../data/legacyProducts';
import { Product } from '../types';

export interface Coupon { id: string; code: string; kind: 'percent' | 'fixed'; value: number; minimum: number; expires: string; active: boolean }
export interface DemoData { products: Product[]; coupons: Coupon[]; catalogVersion?: number }
export const DEMO_KEY = 'amazonia_admin_v1';
export const seedDemo = (): DemoData => ({ catalogVersion: 3, products: PRODUCTS.map(p => ({ ...p })), coupons: [
  { id: 'amazon', code: 'AMAZONIA10', kind: 'percent', value: 10, minimum: 0, expires: '', active: true },
  { id: 'pando', code: 'PANDO', kind: 'fixed', value: 15, minimum: 0, expires: '', active: true },
  { id: 'selva', code: 'SELVA', kind: 'percent', value: 15, minimum: 0, expires: '', active: true },
] });
export const uid = () => crypto.randomUUID();
export const validImage = (s: string) => /^https:\/\//i.test(s) || /^\/[^/]/.test(s) || /^data:image\/(jpeg|png|webp);base64,/.test(s);
export function couponEligible(c: Coupon, subtotal: number) {
  return c.active && subtotal >= c.minimum && (!c.expires || new Date(`${c.expires}T23:59:59`).getTime() >= Date.now());
}
function validData(d: DemoData): boolean {
  return !!d && Array.isArray(d.products) && Array.isArray(d.coupons) &&
    d.products.every(p => p && typeof p.id === 'string' && typeof p.name === 'string' && typeof p.brand === 'string' && typeof p.description === 'string' && typeof p.shortDescription === 'string' && typeof p.originCommunity === 'string' && typeof p.weightVolume === 'string' && typeof p.image === 'string' && Array.isArray(p.ingredients) && p.ingredients.every(s => typeof s === 'string') && Array.isArray(p.badges) && p.badges.every(s => typeof s === 'string') && Number.isFinite(p.price) && p.price >= 0 && ['bebidas','snacks','artesania','recuerditos','perfumes','medicinas'].includes(p.category)) &&
    d.coupons.every(c => c && typeof c.code === 'string' && typeof c.expires === 'string' && ['percent','fixed'].includes(c.kind) && Number.isFinite(c.value) && c.value > 0 && (c.kind !== 'percent' || c.value <= 100) && Number.isFinite(c.minimum) && c.minimum >= 0);
}
// Replace untouched old seed rows; retain user-created or edited rows and coupons.
export function migrateCatalog(d: DemoData): DemoData {
  if ((d.catalogVersion ?? 0) >= 3) return d;
  let migrated = d;
  if (d.catalogVersion !== 2) {
    const preserved = d.products.filter(p => {
      const old = LEGACY_PRODUCTS.find(row => row.id === p.id);
      return !old || Object.entries(p).some(([key, value]) =>
        JSON.stringify(value) !== JSON.stringify(old[key as keyof Product]));
    });
    const ids = new Set(preserved.map(p => p.id));
    migrated = { ...d, products: [...PRODUCTS.filter(p => !ids.has(p.id)), ...preserved] };
  }
  // Add the three demo offers only when local pricing is still the old seed price.
  // Preserve edited prices/offers, visibility, content, custom products and coupons.
  const previousPrices: Record<string, number> = {
    'barra-de-chocolate-con-castana-amazonica-el-ceibo-100g': 26,
    'chocolate-de-mesa-el-ceibo-1000g': 80,
    'galletas-frutos-amazonicos': 28,
  };
  return { ...migrated, catalogVersion: 3, products: migrated.products.map(product => {
    const updated = PRODUCTS.find(row => row.id === product.id);
    if (previousPrices[product.id] === product.price && product.originalPrice == null && updated) {
      return { ...product, price: updated.price, originalPrice: updated.originalPrice };
    }
    return product;
  }) };
}
export function readDemo(): DemoData {
  try { const raw = localStorage.getItem(DEMO_KEY); if (raw) { const d = JSON.parse(raw); if (validData(d)) return migrateCatalog(d); } } catch { /* Fall back to intact seed. */ }
  return seedDemo();
}
export function useDemoStore() {
  const [data, setData] = useState<DemoData>(seedDemo);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setData(readDemo()); setReady(true); const sync = (e: StorageEvent) => { if (e.key === DEMO_KEY || e.key === null) setData(readDemo()); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);
  const save = (next: DemoData) => {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(next)); setData(next); setError(''); return true; }
    catch { setError('No se pudo guardar. El almacenamiento puede estar lleno o bloqueado. Reduce las imágenes e inténtalo otra vez.'); return false; }
  };
  return { data, ready, save, error };
}

/** Resize uploads before persisting to the limited browser storage. */
export async function uploadImage(file: File): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Elige una imagen JPG, PNG o WebP de hasta 8 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No se pudo procesar la imagen.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/webp', .78);
  } finally { URL.revokeObjectURL(url); }
}
