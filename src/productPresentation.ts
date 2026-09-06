import { Product } from './types';
import { sitePath } from './sitePath';

export function productDescription(product: Product, short = false) {
  return short ? product.shortDescription : product.description;
}

export function productImage(product: Product) {
  return sitePath(product.image);
}
