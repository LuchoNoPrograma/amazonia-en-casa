import { PRODUCTS } from './data/products';
import { Product } from './types';

// Stable catalog identifiers are already descriptive, URL-safe slugs.
export const PUBLIC_PRODUCTS = PRODUCTS.filter(product => !product.hidden);
export function productPath(product: Pick<Product, 'id'>) {
  return `/productos/${encodeURIComponent(product.id)}/`;
}
export function publicProduct(pathname: string) {
  const normalized = pathname.replace(/\/$/, '');
  return PUBLIC_PRODUCTS.find(product => productPath(product).replace(/\/$/, '') === normalized);
}
export function hasPublicPage(product: Product) {
  return PUBLIC_PRODUCTS.some(item => item.id === product.id);
}
export function productSeo(product: Product) {
  return {
    title: `${product.name} | Amazonía en Casa`,
    description: `${product.shortDescription} ${product.brand} · ${product.weightVolume}. Consulta por WhatsApp. Precio y disponibilidad de demostración.`,
  };
}
