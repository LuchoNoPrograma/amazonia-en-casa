import { StoreLink } from './StoreLink';
import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag, MessageCircle, ArrowLeft, ArrowUpRight, ChevronDown, Check, MapPin } from 'lucide-react';
import { Product } from '../types';
import { productImage, productDescription } from '../productPresentation';
import { PUBLIC_PRODUCTS, productPath } from '../productRoutes';

interface Props {
  product: Product;
  quantityInCart: number;
  isFavorite: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleFavorite: (product: Product) => void;
  onConsult: (product: Product, quantity: number) => void;
}
export function ProductPage({product, quantityInCart, isFavorite, onAddToCart, onToggleFavorite, onConsult}: Props) {
  const [quantity, setQuantity] = useState(1);
  const related = PUBLIC_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
  const savings = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;
  return <article className="product-page container" id="producto" tabIndex={-1}>
    <nav className="product-breadcrumbs" aria-label="Ruta de navegación"><StoreLink href="/#catalogo"><ArrowLeft size={15}/> Catálogo</StoreLink><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
    <div className="product-page-layout">
      <div className="product-page-media">
        <div className="product-page-photo">
          <img src={productImage(product)} alt={product.name} width="600" height="600" fetchPriority="high" referrerPolicy="no-referrer" />
          <button className="product-page-favorite" onClick={() => onToggleFavorite(product)} aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-pressed={isFavorite}><Heart size={22} fill={isFavorite ? 'currentColor' : 'none'}/></button>
          {savings > 0 && <span className="product-page-offer" aria-label={`${Math.round(savings / product.originalPrice! * 100)}% de descuento`}>−{Math.round(savings / product.originalPrice! * 100)}%</span>}
        </div>
        <p className="product-photo-caption"><MapPin size={14}/>{product.originCommunity}<span>{product.brand}</span></p>
      </div>
      <div className="product-page-copy">
        <p className="eyebrow">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="product-page-size">Presentación · {product.weightVolume}</p>
        <p className="product-page-description">{productDescription(product)}</p>
        <div className={`product-page-price${savings > 0 ? " product-page-price-sale" : ""}`}><strong>Bs. {product.price.toFixed(2)}</strong>{savings > 0 && <del>Bs. {product.originalPrice!.toFixed(2)}</del>}<span>por unidad · sin envío</span></div>
        {savings > 0 && <p className="product-page-saving">Ahorras Bs. {savings.toFixed(2)} por unidad</p>}
        <div className="product-page-purchase">
          <div className="product-purchase-label"><span>Cantidad</span><span>{product.inStock ? 'Disponibilidad por confirmar' : 'Agotado por el momento'}</span></div>
          <div className="product-page-actions">
            <div className="quantity-control" aria-label="Cantidad a añadir"><button disabled={quantity === 1} aria-label="Reducir cantidad" onClick={() => setQuantity(quantity - 1)}><Minus size={18}/></button><output aria-live="polite">{quantity}</output><button aria-label="Aumentar cantidad" onClick={() => setQuantity(quantity + 1)}><Plus size={18}/></button></div>
            <button className="primary-button" aria-label="Añadir al carrito" disabled={!product.inStock} onClick={() => onAddToCart(product, quantity)}><ShoppingBag size={18}/><span>{product.inStock ? 'Añadir al carrito' : 'Agotado'}<small>Bs. {(product.price * quantity).toFixed(2)}</small></span></button>
          </div>
          <p className="product-page-cart-status" role="status">{quantityInCart > 0 ? <><Check size={15}/>{quantityInCart} {quantityInCart === 1 ? 'unidad en tu carrito' : 'unidades en tu carrito'}</> : 'Precio y disponibilidad de demostración.'}</p>
          <button className="product-page-consult" onClick={() => onConsult(product, quantity)}><MessageCircle size={19}/><span>Consultar este producto</span><ArrowUpRight size={17}/></button>
        </div>
        <div className="product-page-details">
          <details><summary>Entrega y forma de compra<ChevronDown size={18}/></summary><div><p>Prepara tu solicitud por WhatsApp. La tienda confirmará disponibilidad, envío y forma de pago antes de la compra.</p><StoreLink href="/#como-comprar">Ver opciones de entrega <ArrowUpRight size={14}/></StoreLink></div></details>
          {product.ingredients.length > 0 && <details><summary>{['artesania','recuerditos'].includes(product.category) ? 'Composición' : 'Ingredientes'}<ChevronDown size={18}/></summary><div><p>{product.ingredients.join(' · ')}</p></div></details>}
          <details><summary>Sobre este producto<ChevronDown size={18}/></summary><div><p>Referencia de {product.brand}, {product.originCommunity}. Los precios y la disponibilidad son de demostración.</p>{product.sourceUrl && <StoreLink href={product.sourceUrl} target="_blank" rel="noopener noreferrer">Ver ficha original <ArrowUpRight size={14}/></StoreLink>}</div></details>
        </div>
      </div>
    </div>
    {related.length > 0 && <section className="product-related"><div className="product-related-heading"><div><p className="eyebrow">SIGUE DESCUBRIENDO</p><h2>También puedes explorar</h2></div><StoreLink className="text-link" href="/#catalogo">Ver catálogo <ArrowUpRight size={18}/></StoreLink></div><ul>{related.map(p => <li key={p.id}><StoreLink className="related-product-link" href={productPath(p)}><div className="related-product-image"><img src={productImage(p)} alt={p.name} width="360" height="360" loading="lazy"/><span><ArrowUpRight size={20}/></span></div><p>{p.brand} · {p.weightVolume}</p><h3>{p.name}</h3><strong>Bs. {p.price.toFixed(2)}</strong></StoreLink></li>)}</ul></section>}
    <StoreLink className="text-link product-back-link" href="/#catalogo"><ArrowLeft size={16}/>Volver al catálogo</StoreLink>
  </article>;
}
