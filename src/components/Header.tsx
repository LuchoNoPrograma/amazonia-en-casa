import { sitePath } from '../sitePath';
import { StoreLink } from "./StoreLink";
import { ShopSelect } from "./ShopSelect";
import React from "react";
import { ShoppingBag, Heart, MapPin } from "lucide-react";
interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenRuta: () => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}
export const CITIES = [
  "Cobija (Entrega Rápida)",
  "Porvenir (Pando)",
  "Filadelfia (Pando)",
  "Puerto Rico (Pando)",
  "La Paz (Envío Nacional)",
  "Santa Cruz (Envío Nacional)",
  "Cochabamba (Envío Nacional)",
  "Trinidad (Beni)",
  "Resto de Bolivia (Expreso)",
];
export function Header(p: HeaderProps) {
  return (
    <header className="store-header">
      <div className="announcement">
        <div className="container">
          <span>Desde Cobija. Una selección de productos amazónicos.</span>
          <button onClick={p.onOpenRuta}>Conoce su origen </button>
        </div>
      </div>
      <div className="container header-main">
        <StoreLink className="wordmark" href="/" aria-label="Amazonía en Casa, inicio">
          <img className="brand-logo brand-logo-day" src={sitePath("/images/brand/logo-dia.png")} alt="" width="880" height="240" fetchPriority="high" />
        </StoreLink>

        <div className="header-actions">
          <button
            id="wishlist-btn"
            onClick={p.onOpenWishlist}
            aria-label={`Favoritos, ${p.wishlistCount} productos`}
          >
            <Heart size={22} />
            <span>Favoritos</span>
            {p.wishlistCount > 0 && <b>{p.wishlistCount}</b>}
          </button>
          <button
            id="cart-btn"
            onClick={p.onOpenCart}
            aria-label={`Carrito, ${p.cartCount} productos`}
          >
            <ShoppingBag size={22} />
            <span>Carrito</span>
            <b>{p.cartCount}</b>
          </button>
        </div>
      </div>
      <div className="container header-links">
        <nav aria-label="Navegación principal">
          <StoreLink href="/#catalogo">Tienda</StoreLink>
          <button onClick={p.onOpenRuta}>Nuestros orígenes</button>
          <StoreLink href="/#como-comprar">Cómo comprar</StoreLink>
        </nav>
        <div className="delivery-picker">
          <MapPin size={16} />
          <span>Entrega en</span>
          <ShopSelect label="Ciudad de entrega" value={p.selectedCity} onChange={p.onCityChange}
            options={CITIES.map(city => ({ value: city, label: city.split(" (")[0] }))} />
        </div>
      </div>
    </header>
  );
}
