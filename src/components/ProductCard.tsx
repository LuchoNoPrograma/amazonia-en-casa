import { StoreLink } from "./StoreLink";
import { hasPublicPage, productPath } from "../productRoutes";
import React from "react";
import { productDescription, productImage } from "../productPresentation";
import { Product } from "../types";
import { Heart, Plus, Minus, ArrowUpRight } from "lucide-react";
interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isFavorite: boolean;
  onAddToCart: (p: Product) => void;
  onUpdateQuantity: (id: string, q: number) => void;
  onToggleFavorite: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
}
export function ProductCard({
  product: p,
  quantityInCart: q,
  isFavorite,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavorite,
  onSelectProduct,
}: ProductCardProps) {
  const Link = hasPublicPage(p) ? StoreLink : "button";
  const linkProps = hasPublicPage(p) ? { href: productPath(p) } : { onClick: () => onSelectProduct(p) };
  const savings = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0;
  return (
    <article className={`product-card${savings > 0 ? " product-card-sale" : ""}`}>
      <div className="product-image">
        <Link
          className="product-image-link"
          {...linkProps}
          aria-label={`Ver ${p.name}`}
        >
          <img
            src={productImage(p)}
            alt={p.name}
            loading="lazy"
            width="480"
            height="480"
            referrerPolicy="no-referrer"
          />
          <span className="view-product">
            Ver producto <ArrowUpRight size={18} />
          </span>
        </Link>
        {savings > 0 && p.originalPrice && (
          <span className="sale-label" aria-label={`${Math.round((1 - p.price / p.originalPrice) * 100)}% de descuento`}>
            <strong>−{Math.round((1 - p.price / p.originalPrice) * 100)}%</strong>
          </span>
        )}
        <button
          id={`fav-btn-${p.id}`}
          className="favorite-button"
          aria-label={`${isFavorite ? "Quitar" : "Guardar"} ${p.name} ${isFavorite ? "de" : "en"} favoritos`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(p)}
        >
          <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-meta">
        <span>{p.originCommunity}</span>
        <span>{p.weightVolume}</span>
      </div>
      <h3>
        <Link {...linkProps}>{p.name}</Link>
      </h3>
      <p className="product-description">{productDescription(p, true)}</p>
      <div className="product-bottom">
        <div className="product-price">
          Bs. {p.price.toFixed(2)}
          {savings > 0 && p.originalPrice && <del>Bs. {p.originalPrice.toFixed(2)}</del>}
        </div>
        {!p.inStock ? (
          <span>Agotado</span>
        ) : q > 0 ? (
          <div className="quantity-control">
            <button
              aria-label={`Quitar una unidad de ${p.name}`}
              onClick={() => onUpdateQuantity(p.id, q - 1)}
            >
              <Minus size={16} />
            </button>
            <output aria-label={`Cantidad de ${p.name}`}>{q}</output>
            <button
              aria-label={`Añadir una unidad de ${p.name}`}
              onClick={() => onUpdateQuantity(p.id, q + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            className="add-button"
            id={`add-btn-${p.id}`}
            onClick={() => onAddToCart(p)}
            aria-label={`Añadir ${p.name} al carrito`}
          >
            <Plus size={17} />
            <span>Añadir</span>
          </button>
        )}
      </div>
    </article>
  );
}
