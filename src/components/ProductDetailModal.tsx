import { StoreLink } from "./StoreLink";
import { hasPublicPage, productPath } from "../productRoutes";
import { useDialog } from './useDialog';
import { useState } from 'react';
import { Product } from '../types';
import { X, Heart, MapPin, ShoppingBag, MessageCircle, Minus, Plus } from 'lucide-react';
import { productDescription, productImage } from '../productPresentation';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  quantityInCart: number;
  isFavorite: boolean;
  onAddToCart: (product: Product, qty: number) => void;
  onToggleFavorite: (product: Product) => void;
  onOpenWhatsAppDirect: (product: Product, qty: number) => void;
}
export function ProductDetailModal({ product, onClose, quantityInCart, isFavorite, onAddToCart, onToggleFavorite, onOpenWhatsAppDirect }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const ref = useDialog(!!product, onClose);
  if (!product) return null;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  return <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="product-title" tabIndex={-1} className="dialog-backdrop">
    <div className="detail-panel">
      <header className="panel-header">
        <span>Detalle del producto</span>
        <button id="detail-close-btn" className="icon-button" onClick={onClose} aria-label="Cerrar detalle"><X size={22}/></button>
      </header>
      <div className="detail-scroll">
        <div className="detail-photo">
          <img src={productImage(product)} alt={product.name} width="600" height="600" referrerPolicy="no-referrer"/>
          {discount > 0 && <span className="sale-label" aria-label={`${discount}% de descuento`}><strong>−{discount}%</strong></span>}
          <button id="detail-fav-btn" className="favorite-button" onClick={() => onToggleFavorite(product)} aria-pressed={isFavorite} aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}><Heart size={20} fill={isFavorite ? 'currentColor' : 'none'}/></button>
        </div>
        <div className="detail-copy">
          <p className="detail-origin"><MapPin size={16}/>{product.originCommunity}</p>
          <h2 id="product-title">{product.name}</h2>
          {hasPublicPage(product) && <StoreLink className="text-link" href={productPath(product)}>Abrir página del producto</StoreLink>}
          <p className="muted">{product.brand} · {product.weightVolume}</p>
          <div className={`detail-price${discount > 0 ? " detail-price-sale" : ""}`}>Bs. {product.price.toFixed(2)} {product.originalPrice && product.originalPrice > product.price && <del>Bs. {product.originalPrice.toFixed(2)}</del>}</div>
          <p className="availability">{product.inStock ? 'Consulta disponibilidad y entrega por WhatsApp.' : 'Agotado por el momento.'}</p>
          <p>{productDescription(product)}</p>
          {product.ingredients.length > 0 && <section className="detail-section"><h3>{['artesania', 'recuerditos'].includes(product.category) ? 'Composición' : 'Ingredientes'}</h3><p>{product.ingredients.join(' · ')}</p></section>}
          <section className="detail-section"><h3>Referencia del producto</h3><p>Precio y disponibilidad de demostración.</p>{product.sourceUrl && <StoreLink href={product.sourceUrl} target="_blank" rel="noopener noreferrer">Ver ficha original de {product.brand}</StoreLink>}</section>
        </div>
      </div>
      <footer className="detail-actions">
          <button id="whatsapp-direct-btn" className="detail-consult" onClick={() => onOpenWhatsAppDirect(product, quantity)}><MessageCircle size={18}/>Consultar este producto</button>
        <div className="quantity-control" aria-label="Cantidad a añadir">
          <button id="modal-minus-qty" disabled={quantity === 1} aria-label="Reducir cantidad" onClick={() => setQuantity(quantity - 1)}><Minus size={18}/></button>
          <output aria-live="polite">{quantity}</output>
          <button id="modal-plus-qty" aria-label="Aumentar cantidad" onClick={() => setQuantity(quantity + 1)}><Plus size={18}/></button>
        </div>
        <button id="detail-add-to-cart-btn" className="primary-button" disabled={!product.inStock} onClick={() => { onAddToCart(product, quantity); onClose(); }}><ShoppingBag size={18}/>{product.inStock ? `Añadir · Bs. ${(product.price * quantity).toFixed(2)}` : 'Agotado'}</button>
        {quantityInCart > 0 && <small>Ya tienes {quantityInCart} en el carrito</small>}
      </footer>
    </div>
  </div>;
}
