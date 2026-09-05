import { useLocation, useNavigate } from "react-router-dom";
import { StoreLink } from "./components/StoreLink";
import { ProductPage } from "./components/ProductPage";
import { publicProduct } from "./productRoutes";
import { readDemo, useDemoStore } from "./admin/demoStore";
import { ShopSelect } from "./components/ShopSelect";
import React, { useState, useEffect, useMemo } from "react";
import { Product, CategoryType, CartItem, OrderCustomerInfo } from "./types";
import { COMMUNITIES } from "./data/products";
import { Header, CITIES } from "./components/Header";
import { CategoryRail } from "./components/CategoryRail";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { FavoritesDrawer } from "./components/FavoritesDrawer";
import { RutaAmazoniaModal } from "./components/RutaAmazoniaModal";
import { OrderSuccessModal } from "./components/OrderSuccessModal";
import {
  ShoppingBag,
  Search,
  Leaf,
  MapPin,
  ArrowRight,
  MessageCircle,
  RotateCcw,
  Tag,
  CheckCircle,
  X,
} from "lucide-react";

const AdminPanel = React.lazy(() => import("./admin/AdminPanel"));

const STORAGE_KEYS = {
  CART: "amazonia_cart_v1",
  FAVORITES: "amazonia_favs_v1",
  CITY: "amazonia_city_v1",
};

export default function App() {
  const location = useLocation();
  const navigateTo = useNavigate();
  const { pathname } = location;
  const demo = useDemoStore();
  const products = useMemo(() => demo.data.products.filter(p => !p.hidden), [demo.data.products]);
  const routeProduct = publicProduct(pathname);
  const pageProduct = routeProduct && products.find(p => p.id === routeProduct.id);
  const isHome = pathname === "/";
  const [adminOpen, setAdminOpen] = useState(false);
  useEffect(() => {
    setAdminOpen(location.hash === '#admin');
  }, [location.hash]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState("Cobija (Entrega Rápida)");
  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const read = (key: string) => {
      try { return JSON.parse(localStorage.getItem(key) || "[]"); }
      catch { return []; }
    };
    const catalog = readDemo().products.filter(p => !p.hidden);
    const savedCart = read(STORAGE_KEYS.CART);
    if (Array.isArray(savedCart)) {
      const restored: CartItem[] = [];
      for (const item of savedCart) {
        const product = catalog.find(p => p.id === item?.product?.id);
        if (!product || !Number.isSafeInteger(item?.quantity) || item.quantity < 1) continue;
        const existing = restored.find(row => row.product.id === product.id);
        if (existing) {
          const quantity = existing.quantity + item.quantity;
          if (Number.isSafeInteger(quantity)) existing.quantity = quantity;
        } else restored.push({ product, quantity: item.quantity });
      }
      setCart(restored);
    }
    const savedFavorites = read(STORAGE_KEYS.FAVORITES);
    if (Array.isArray(savedFavorites)) setFavorites(catalog.filter(p => savedFavorites.some(item => item?.id === p.id)));
    try {
      const city = localStorage.getItem(STORAGE_KEYS.CITY);
      if (city && CITIES.includes(city)) setSelectedCity(city);
    } catch { /* Storage may be unavailable; shopping remains usable. */ }
    setStorageReady(true);
  }, []);

  // Filters state
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState("Todos los Orígenes");
  const [sortBy, setSortBy] = useState<
    "popular" | "price-asc" | "price-desc"
  >("popular");
  const [selectedTag, setSelectedTag] = useState<string>("todos");

  useEffect(() => {
    if (!isHome) return;
    const origin = new URLSearchParams(location.search).get("origen");
    if (origin && COMMUNITIES.includes(origin)) setSelectedOrigin(origin);
  }, [isHome, location.search]);

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState("");
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isRutaOpen, setIsRutaOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderNumber: string;
    total: number;
    info: OrderCustomerInfo;
    items: CartItem[];
  } | null>(null);

  useEffect(() => {
    if (!demo.ready) return;
    setCart(previous => previous.flatMap(item => { const product = products.find(p => p.id === item.product.id); return product ? [{ ...item, product }] : []; }));
    setFavorites(previous => previous.flatMap(item => { const product = products.find(p => p.id === item.id); return product ? [product] : []; }));
    setSelectedProduct(previous => previous ? products.find(p => p.id === previous.id) || null : null);
  }, [products, demo.ready]);
  useEffect(() => {
    if (adminOpen) { setIsCartOpen(false); setIsFavoritesOpen(false); setSelectedProduct(null); setIsRutaOpen(false); setOrderSuccessData(null); }
  }, [adminOpen]);

  useEffect(() => {
    setSelectedProduct(null);
    setIsFavoritesOpen(false);
    setIsCartOpen(false);
    setIsRutaOpen(false);
    setOrderSuccessData(null);
  }, [pathname]);

  // Save to localStorage
  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CITY, selectedCity);
    } catch (e) {
      console.error(e);
    }
  }, [selectedCity, storageReady]);

  // Cart operations
  const handleAddToCart = (product: Product, qty: number = 1) => {
    if (!product.inStock || !Number.isSafeInteger(qty) || qty < 1) return;
    setCartNotice(`${qty} × ${product.name} añadido${qty > 1 ? "s" : ""}`);
    setIsFavoritesOpen(false);
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Number.isSafeInteger(item.quantity + qty) ? item.quantity + qty : item.quantity }
            : item,
        );
      }
      return [...prevCart, { product, quantity: qty }];
    });
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (!Number.isSafeInteger(qty)) return;
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item,
      ),
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId),
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Favorites operations
  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId);
  };

  const getQuantityInCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      todos: products.length,
      bebidas: 0,
      snacks: 0,
      artesania: 0,
      recuerditos: 0,
      perfumes: 0,
      medicinas: 0,
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    });
    return counts;
  }, [products]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== "todos" && p.category !== selectedCategory) {
        return false;
      }

      // Origin community filter
      if (
        selectedOrigin !== "Todos los Orígenes" &&
        !p.originCommunity.includes(selectedOrigin.split(",")[0])
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const normalize = (value: string) =>
          value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
        const query = normalize(searchQuery.trim());
        const matchesName = normalize(p.name).includes(query);
        const matchesBrand = normalize(p.brand).includes(query);
        const matchesDesc = normalize(p.description).includes(query);
        const matchesCommunity = normalize(p.originCommunity).includes(query);
        const matchesIngredients = p.ingredients.some((ing) =>
          normalize(ing).includes(query),
        );
        const matchesBadges = p.badges.some((b) =>
          normalize(b).includes(query),
        );

        if (
          !matchesName &&
          !matchesBrand &&
          !matchesDesc &&
          !matchesCommunity &&
          !matchesIngredients &&
          !matchesBadges
        ) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag === "destacados" && !p.featured) return false;
      if (selectedTag === "ofertas" && !(p.originalPrice && p.originalPrice > p.price)) return false;
      if (
        selectedTag === "superalimentos" &&
        !p.badges.includes("Superalimento")
      )
        return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      // Default: featured first, then rating
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [products, selectedCategory, selectedOrigin, searchQuery, selectedTag, sortBy]);

  // Direct WhatsApp single item buy
  const handleOpenWhatsAppDirect = (product: Product, qty: number) => {
    const total = product.price * qty;
    let message = ` *CONSULTA DIRECTA - AMAZONÍA EN CASA* \n`;
    message += `Hola, deseo pedir directamente:\n`;
    message += ` *Producto:* ${product.name} (${product.weightVolume})\n`;
    message += ` *Cantidad:* ${qty}\n`;
    message += ` *Productos (sin envío):* Bs. ${total.toFixed(2)}\n`;
    message += ` *Origen del producto:* ${product.originCommunity}\n`;
    message += ` *Mi ciudad de entrega:* ${selectedCity}\n\n`;
    message += `¿Podrían confirmar disponibilidad, costo de envío y forma de pago? Gracias.`;

    const storePhone = "59172916657";
    window.open(
      `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (adminOpen) return <React.Suspense fallback={<div className="container" role="status">Cargando administrador…</div>}><AdminPanel data={demo.data} save={demo.save} error={demo.error} /></React.Suspense>;

  return (
    <div className={`storefront${totalCartCount > 0 ? " has-cart-dock" : ""}`}>
      <StoreLink className="skip-link" href={isHome ? "#catalogo" : "#producto"}>
        Saltar al contenido
      </StoreLink>
      <div className="admin-entry"><div className="container"><StoreLink href="/#admin">Administrar tienda <ArrowRight size={14} /></StoreLink></div></div>
      <Header
        cartCount={totalCartCount}
        wishlistCount={favorites.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsFavoritesOpen(true)}
        onOpenRuta={() => setIsRutaOpen(true)}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />
      <main>
        {!isHome ? (pageProduct ? <ProductPage key={pageProduct.id} product={pageProduct} quantityInCart={getQuantityInCart(pageProduct.id)} isFavorite={isFavorite(pageProduct.id)} onAddToCart={handleAddToCart} onToggleFavorite={handleToggleFavorite} onConsult={handleOpenWhatsAppDirect} /> : <section className="product-page container" id="producto"><h1>Producto no disponible</h1><p>Esta página no existe o el producto ya no está disponible.</p><StoreLink className="primary-button" href="/#catalogo">Volver al catálogo</StoreLink></section>) : <>

        {(selectedCategory !== "todos" || searchQuery) && <h1 className="sr-only">Tienda de productos amazónicos · Amazonía en Casa</h1>}
        {selectedCategory === "todos" && !searchQuery && (
          <section className="hero">
            <img
              className="hero-image"
              src="/images/hero-coffee.jpg"
              alt="Detalle de granos de café tostado"
              width="1800"
              height="1000"
              fetchPriority="high"
            />
            <div className="container hero-inner">
              <div className="hero-copy">
                <p className="eyebrow">AMAZONÍA EN CASA · PANDO, BOLIVIA</p>
                <h1>
                  Amazonía en Casa.
                  <br />
                  Productos amazónicos.
                </h1>
                <p>
                  Chocolate, artesanía y cuidado personal.
                  <br className="desktop-break" /> Referencias de Bolivia, Brasil y Colombia.
                </p>
                <StoreLink className="primary-button" href="/#catalogo">
                  Explorar la tienda <ArrowRight size={19} />
                </StoreLink>
                <span className="hero-note">
                  Elige tus productos. Coordina tu pedido por WhatsApp.
                </span>
              </div>
            </div>
            <div className="hero-caption">
              DE NUESTRA TIERRA, PARA TU DÍA A DÍA
            </div>
          </section>
        )}

        <section className="catalog-section container" id="catalogo" tabIndex={-1}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">SELECCIÓN AMAZÓNICA</p>
              <h2>
                {searchQuery ? "Resultados de búsqueda" : "Catálogo de productos amazónicos"}
              </h2>
            </div>
            <p>Catálogo demo · Precios y disponibilidad de ejemplo.</p>
          </div>
        <form
          className="store-search catalog-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            document
              .getElementById("catalogo")
              ?.scrollIntoView();
          }}
        >
          <Search size={20} />
          <input
            id="search-input"
            aria-label="Buscar productos"
            placeholder="Busca chocolate, artesanía, shampoo…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={() => setSearchQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </form>
          <CategoryRail
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
          <div className="catalog-toolbar">
            <div className="catalog-tags">
              {[
                { id: "todos", label: "Todo el catálogo" },
                { id: "destacados", label: "Destacados" },
                { id: "ofertas", label: "Ofertas" },
              ].map((t) => (
                <button
                  key={t.id}
                  className={t.id === "ofertas" ? "offers-filter" : undefined}
                  aria-pressed={selectedTag === t.id}
                  onClick={() => setSelectedTag(t.id)}
                >
                  {t.id === "ofertas" && <Tag size={17} aria-hidden="true" />}
                  {t.label}
                </button>
              ))}
            </div>
            <div className="catalog-selects">
              <div className="catalog-select-field"><span>Origen</span>
                <ShopSelect label="Filtrar por origen" value={selectedOrigin} onChange={setSelectedOrigin}
                  options={COMMUNITIES.map(c => ({ value: c, label: c === "Todos los Orígenes" ? "Todos" : c.split(",")[0] }))} />
              </div>
              <div className="catalog-select-field"><span>Ordenar</span>
                <ShopSelect id="sort-select" label="Ordenar productos" value={sortBy} onChange={value => setSortBy(value as typeof sortBy)}
                  options={[{ value: "popular", label: "Recomendados" }, { value: "price-asc", label: "Precio: menor a mayor" }, { value: "price-desc", label: "Precio: mayor a menor" }]} />
              </div>
            </div>
          </div>
          <div className="results-line">
            <p role="status">
              <strong className="results-count">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "producto" : "productos"}
              {searchQuery && ` para “${searchQuery}”`}
            </p>
            {(selectedCategory !== "todos" ||
              selectedOrigin !== "Todos los Orígenes" ||
              selectedTag !== "todos" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("todos");
                  setSelectedOrigin("Todos los Orígenes");
                  setSelectedTag("todos");
                  setSearchQuery("");
                }}
              >
                Limpiar filtros <RotateCcw size={14} />
              </button>
            )}
          </div>
          {filteredProducts.length === 0 ? (
            <div className="empty-results">
              <Search size={36} />
              <h3>No encontramos esos productos</h3>
              <p>
                Prueba otro nombre o elimina los filtros para explorar el
                catálogo.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setSelectedCategory("todos");
                  setSelectedOrigin("Todos los Orígenes");
                  setSelectedTag("todos");
                  setSearchQuery("");
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={getQuantityInCart(product.id)}
                  isFavorite={isFavorite(product.id)}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProduct={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>
        <section
          className="service-strip container"
          aria-label="Información de compra"
        >
          <div>
            <MapPin />
            <span>
              <strong>Origen a la vista</strong>
              <small>Conoce de dónde viene cada producto</small>
            </span>
          </div>
          <div>
            <ShoppingBag />
            <span>
              <strong>Compra a tu ritmo</strong>
              <small>Guarda favoritos y arma tu carrito</small>
            </span>
          </div>
          <div>
            <MessageCircle />
            <span>
              <strong>Atención por WhatsApp</strong>
              <small>Confirma disponibilidad y entrega</small>
            </span>
          </div>
        </section>
        <section className="origin-section container">
          <div>
            <p className="eyebrow">HECHO CERCA DEL BOSQUE</p>
            <h2>
              Detrás de cada producto,
              <br />
              hay un lugar por conocer.
            </h2>
          </div>
          <div>
            <p>
              Chocolate boliviano, tejidos del Putumayo y cuidado personal con
              ingredientes amazónicos. Explora las referencias por su procedencia.
            </p>
            <button className="text-link" onClick={() => setIsRutaOpen(true)}>
              Conocer los orígenes <ArrowRight size={18} />
            </button>
          </div>
        </section>
        <section className="shopping-guide container" id="como-comprar">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ASÍ DE SENCILLO</p>
              <h2>De la tienda a tu casa</h2>
            </div>
          </div>
          <div className="steps">
            <div>
              <span>01</span>
              <h3>Elige lo que te gusta</h3>
              <p>
                Revisa el origen, la presentación y el precio. Añade tus
                productos al carrito.
              </p>
            </div>
            <div>
              <span>02</span>
              <h3>Cuéntanos dónde estás</h3>
              <p>
                Completa tus datos y elige entrega, recojo o envío nacional.
              </p>
            </div>
            <div>
              <span>03</span>
              <h3>Coordina por WhatsApp</h3>
              <p>
                Envía tu solicitud. La tienda confirmará disponibilidad, costo
                de envío y forma de pago.
              </p>
            </div>
          </div>
          <div className="faq">
            <details>
              <summary>¿Cuánto cuesta el envío?</summary>
              <p>
                El carrito muestra una estimación: entrega local en Cobija desde
                Bs. 10, sin costo desde Bs. 150 en productos; envío nacional Bs.
                25 y recojo sin costo. Confirma el importe final con la tienda
                por WhatsApp.
              </p>
            </details>
            <details>
              <summary>¿Cómo se paga un pedido?</summary>
              <p>
                Puedes indicar tu preferencia por QR, transferencia o efectivo.
                Coordina el pago con la tienda después de confirmar el pedido.
              </p>
            </details>
            <details>
              <summary>¿Necesito crear una cuenta?</summary>
              <p>
                No. Puedes explorar, guardar favoritos y preparar tu carrito en
                este dispositivo sin registrarte.
              </p>
            </details>
          </div>
        </section>
        </>}
      </main>
      <footer className="store-footer">
        <div className="container footer-main">
          <div>
            <StoreLink href="/" className="wordmark" aria-label="Amazonía en Casa, inicio">
              <img className="brand-logo brand-logo-night" src="/images/brand/logo-noche.png" alt="" width="880" height="240" loading="lazy" />
            </StoreLink>
            <p>
              Productos con historia y origen.
              <br />
              Una selección de la Amazonía.
            </p>
          </div>
          <div>
            <h2>Explora</h2>
            <StoreLink href="/#catalogo">Todos los productos</StoreLink>
            <button onClick={() => setIsFavoritesOpen(true)}>
              Mis favoritos
            </button>
            <button onClick={() => setIsRutaOpen(true)}>
              Lugares de origen
            </button>
          </div>
          <div>
            <h2>Te acompañamos</h2>
            <StoreLink href="/#como-comprar">Compras y envíos</StoreLink>
            <StoreLink
              href="https://wa.me/59172916657"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar por WhatsApp{" "}
            </StoreLink>
            <span>Cobija, Pando · Bolivia</span>
          </div>
        </div>
        <div className="container footer-bottom">
          <span> {new Date().getFullYear()} Amazonía en Casa</span>
          <span><StoreLink href="/creditos.html">Fuentes y fotografías</StoreLink></span>
        </div>
      </footer>
      {totalCartCount > 0 && (
        <aside className="cart-dock" aria-label="Continuar tu compra" hidden={isCartOpen || !!selectedProduct || isFavoritesOpen || isRutaOpen || !!orderSuccessData}>
          {cartNotice && <div className="cart-added" role="status"><CheckCircle size={19} aria-hidden="true" /><span>{cartNotice}</span>
            <button type="button" aria-label="Cerrar confirmación" onClick={() => setCartNotice("")}><X size={17} /></button>
          </div>}
          <div className="cart-dock-main">
            <div><strong>{totalCartCount} {totalCartCount === 1 ? "producto" : "productos"} en tu carrito</strong>
              <span>Bs. {cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)} <small>· sin envío</small></span>
            </div>
            <button className="primary-button" onClick={() => { setCartNotice(""); setIsCartOpen(true); }}><ShoppingBag size={19} />Ver carrito y continuar<ArrowRight size={18} /></button>
          </div>
        </aside>
      )}
      {/* MODALS & DRAWERS */}

      {/* 1. Product Detail Sheet */}
      <ProductDetailModal
        key={selectedProduct?.id || "closed"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        quantityInCart={
          selectedProduct ? getQuantityInCart(selectedProduct.id) : 0
        }
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        onOpenWhatsAppDirect={handleOpenWhatsAppDirect}
      />

      {/* 2. Cart & Checkout Drawer */}
      <CartDrawer
        coupons={demo.data.coupons}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        selectedCity={selectedCity}
        onOrderSuccess={(orderData) => {
          setIsCartOpen(false);
          setOrderSuccessData(orderData);
        }}
      />

      {/* 3. Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={(id) =>
          setFavorites((prev) => prev.filter((p) => p.id !== id))
        }
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsFavoritesOpen(false);
        }}
      />

      {/* 5. Ruta de la Amazonía Modal */}
      <RutaAmazoniaModal
        isOpen={isRutaOpen}
        onClose={() => setIsRutaOpen(false)}
        onSelectCommunityFilter={(comm) => {
          if (!isHome) {
            setIsRutaOpen(false);
            navigateTo(`/?origen=${encodeURIComponent(comm)}#catalogo`);
            return;
          }
          setSelectedOrigin(comm);
          setSelectedCategory("todos");
          setSearchQuery("");
          setSelectedTag("todos");
          requestAnimationFrame(() => { document.getElementById("catalogo")?.scrollIntoView(); });
        }}
      />

      {/* 6. Order Success Screen */}
      <OrderSuccessModal
        isOpen={!!orderSuccessData}
        onClose={() => setOrderSuccessData(null)}
        orderData={orderSuccessData}
      />
    </div>
  );
}
