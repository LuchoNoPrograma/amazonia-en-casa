import { Product } from './types';

export function productDescription(product: Product, short = false) {
  return short ? product.shortDescription : product.description;
}

export function productImage(product: Product) {
  return product.image;
}
