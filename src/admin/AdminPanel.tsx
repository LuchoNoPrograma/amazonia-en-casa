import { StoreLink } from "../components/StoreLink";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, Package, Pencil, Plus, Search, Tag, Trash2, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { Product } from '../types';
import { productImage } from '../productPresentation';
import { ShopSelect } from '../components/ShopSelect';
import { useDialog } from '../components/useDialog';
import { Coupon, DemoData, uid, uploadImage, validImage } from './demoStore';

type Props = { data: DemoData; save: (d: DemoData) => boolean; error: string };
const money = (n: number) => `Bs. ${n.toFixed(2)}`;
const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
const hasOffer = (p: Product) => !!p.originalPrice && p.originalPrice > p.price;
const blankProduct = (): Product => ({ id: uid(), name: '', brand: '', category: 'bebidas', price: 0, weightVolume: '', description: '', shortDescription: '', image: '/images/hero-coffee.jpg', customImage: true, originCommunity: 'Cobija, Pando', ingredients: [], benefits: [], badges: [], rating: 0, reviewsCount: 0, inStock: true, hidden: true });

function AdminDialog({ title, subtitle, dirty, onClose, children }: {
  title: string; subtitle: string; dirty: boolean; onClose: () => void; children: ReactNode;
}) {
  const [discard, setDiscard] = useState(false);
  const cancelDiscard = useRef<HTMLButtonElement>(null);
  const previousControl = useRef<HTMLElement | null>(null);
  const requestClose = () => {
    if (dirty) { previousControl.current = document.activeElement as HTMLElement; setDiscard(true); }
    else onClose();
  };
  const ref = useDialog(true, () => discard ? keepEditing() : requestClose());
  const keepEditing = () => { setDiscard(false); requestAnimationFrame(() => previousControl.current?.focus()); };
  useEffect(() => { if (discard) cancelDiscard.current?.focus(); }, [discard]);
  return createPortal(<div className="admin-overlay" onMouseDown={e => { if (e.target === e.currentTarget) requestClose(); }}>
    <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" aria-describedby="admin-dialog-subtitle" tabIndex={-1} ref={ref}>
      <header className="admin-dialog-header"><div><h2 id="admin-dialog-title">{title}</h2><p id="admin-dialog-subtitle">{subtitle}</p></div><button type="button" className="admin-icon" aria-label="Cerrar editor" onClick={requestClose}><X size={21} /></button></header>
      {discard && <div className="admin-discard"><h3>¿Descartar los cambios?</h3><p>Tienes cambios sin guardar. Puedes seguir editando o salir sin guardarlos.</p><div className="admin-dialog-actions"><button ref={cancelDiscard} className="admin-secondary" onClick={keepEditing}>Seguir editando</button><button className="primary-button" onClick={onClose}>Descartar cambios</button></div></div>}<div hidden={discard} className="admin-dialog-content" onClick={e => { if ((e.target as HTMLElement).closest('[data-cancel-editor]')) requestClose(); }}>{children}</div>
    </div>
  </div>, document.body);
}

function ImageField({ value, onChange, onBusy }: { value: string; onChange: (s: string) => void; onBusy: (v: boolean) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  return <div className="image-field">
    <img src={value} alt="Vista previa del producto" onError={e => { if (!e.currentTarget.src.endsWith('/images/hero-coffee.jpg')) e.currentTarget.src = '/images/hero-coffee.jpg'; }} />
    <div><button type="button" className="admin-secondary" disabled={busy} onClick={() => input.current?.click()}><ImagePlus size={17} />{busy ? 'Procesando imagen…' : 'Cambiar imagen'}</button>
      <input ref={input} type="file" aria-label="Subir archivo de imagen" accept="image/jpeg,image/png,image/webp" hidden onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return; setBusy(true); onBusy(true); setError(''); setNotice('');
        try { const image = await uploadImage(file); if (alive.current) { onChange(image); setNotice('Imagen lista para guardar.'); } }
        catch (err) { if (alive.current) setError(err instanceof Error ? err.message : 'No se pudo leer la imagen.'); }
        finally { if (alive.current) { setBusy(false); onBusy(false); if (input.current) input.current.value = ''; } }
      }} /><small>JPG, PNG o WebP · hasta 8 MB</small>
      <label>URL de imagen (opcional)<input type="url" placeholder="https://…" value={value.startsWith('/') || value.startsWith('data:') ? '' : value} onChange={e => onChange(e.target.value || '/images/hero-coffee.jpg')} /></label>
      {notice && <p className="admin-upload-notice" role="status"><Check size={14} />{notice}</p>}
      {error && <p role="alert" className="admin-error">{error}</p>}
    </div>
  </div>;
}

function ProductEditor({ initial, isNew, onSave, onClose, error }: {
  initial: Product; isNew: boolean; onSave: (p: Product) => boolean; onClose: () => void; error: string;
}) {
  const [product, setProduct] = useState(initial);
  const [offer, setOffer] = useState(hasOffer(initial));
  const [regular, setRegular] = useState(String(initial.originalPrice || initial.price || ''));
  const [sale, setSale] = useState(hasOffer(initial) ? String(initial.price) : '');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const dirty = JSON.stringify(product) !== JSON.stringify(initial) || offer !== hasOffer(initial) || regular !== String(initial.originalPrice || initial.price || '') || sale !== (hasOffer(initial) ? String(initial.price) : '');
  const offerValid = Number(sale) > 0 && Number(sale) < Number(regular);
  const discount = offerValid ? Math.round((1 - Number(sale) / Number(regular)) * 100) : 0;
  return <AdminDialog title={isNew ? 'Nuevo producto' : 'Editar producto'} subtitle="Completa la ficha y decide cómo aparece en la tienda." dirty={dirty} onClose={onClose}>
    <form className="admin-dialog-form" onSubmit={e => {
      e.preventDefault(); setAttempted(true); setFormError('');
      if (!product.name.trim() || !product.weightVolume.trim() || !validImage(product.image)) { setFormError('Completa el nombre, la presentación y una imagen válida.'); return; }
      if (offer && !offerValid) { setFormError('El precio de oferta debe ser menor al habitual y mayor que cero.'); return; }
      onSave({ ...product, name: product.name.trim(), price: Number(offer ? sale : regular), originalPrice: offer ? Number(regular) : undefined });
    }}>
      <div className="admin-dialog-body">
        <ImageField value={productImage(product)} onChange={image => setProduct(p => ({ ...p, image, customImage: true }))} onBusy={setBusy} />
        <div className="admin-form-section"><h3>Información del producto</h3>
          <label>Nombre del producto<input required maxLength={100} placeholder="Ej. Café artesanal de Pando" value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} /></label>
          <div className="admin-fields"><div className="admin-field"><span>Categoría</span><ShopSelect label="Categoría" value={product.category} onChange={v => setProduct({ ...product, category: v as Product['category'] })} options={CATEGORIES.filter(c => c.id !== 'todos').map(c => ({ value: c.id, label: c.label }))} /></div><label>Presentación<input required placeholder="Ej. 250 g" maxLength={40} value={product.weightVolume} onChange={e => setProduct({ ...product, weightVolume: e.target.value })} /></label></div>
          <label>Descripción breve<textarea aria-label="Descripción breve" required rows={2} maxLength={220} placeholder="Lo esencial que verá el cliente en el catálogo." value={product.shortDescription} onChange={e => setProduct({ ...product, shortDescription: e.target.value })} /><small className="admin-field-hint">{product.shortDescription.length}/220 caracteres</small></label>
          <label>Descripción completa<textarea required rows={3} maxLength={2000} placeholder="Describe el producto, su origen y presentación." value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })} /></label>
          <div className="admin-fields"><label>Marca<input maxLength={80} placeholder="Nombre de la marca" value={product.brand} onChange={e => setProduct({ ...product, brand: e.target.value })} /></label><label>Origen<input required maxLength={80} value={product.originCommunity} onChange={e => setProduct({ ...product, originCommunity: e.target.value })} /></label></div>
        </div>
        <div className="admin-form-section"><h3>Precio y oferta</h3>
          <label>Precio habitual (Bs.)<input required type="number" min="0.01" max="1000000" step="0.01" placeholder="0.00" value={regular} onChange={e => setRegular(e.target.value)} /></label>
          <div className="admin-switch-row"><div><strong>Oferta del producto</strong><p>Muéstralo con descuento en la sección Ofertas.</p></div><button className="admin-switch" type="button" role="switch" aria-label="Activar oferta" aria-checked={offer} onClick={() => { setOffer(!offer); setFormError(''); }}><span /></button></div>
          {offer ? <div className="admin-offer-fields"><label>Precio de oferta (Bs.)<input required type="number" min="0.01" max="1000000" step="0.01" placeholder="Precio con descuento" value={sale} aria-invalid={!!sale && !offerValid} aria-describedby="offer-feedback" onChange={e => setSale(e.target.value)} /></label><div id="offer-feedback" className={offerValid ? 'admin-sale-preview' : 'admin-field-hint'} aria-live="polite">{offerValid ? <><Tag size={17} /><span><strong>{money(Number(sale))}</strong> <del>{money(Number(regular))}</del><small>−{discount}% · Ahorras {money(Number(regular) - Number(sale))}</small></span></> : 'Introduce un precio menor al habitual para activar el descuento.'}</div></div> : <p className="admin-field-hint" role="status">{hasOffer(initial) ? `Al guardar se quitará la oferta y se venderá a ${money(Number(regular))}.` : 'Sin oferta. Se muestra únicamente el precio habitual.'}</p>}
        </div>
        <div className="admin-form-section"><h3>Publicación</h3>
          <label className="admin-check"><input type="checkbox" checked={!product.hidden} onChange={e => setProduct({ ...product, hidden: !e.target.checked })} /><span>Visible en la tienda<small>Desactívalo para mantenerlo oculto.</small></span></label>
          <label className="admin-check"><input type="checkbox" checked={product.featured ?? false} onChange={e => setProduct({ ...product, featured: e.target.checked })} /><span>Producto destacado<small>Aparece al filtrar por destacados.</small></span></label>
          <label className="admin-check"><input type="checkbox" checked={product.inStock} onChange={e => setProduct({ ...product, inStock: e.target.checked })} /><span>Disponible para comprar<small>Desactívalo para mostrarlo como agotado.</small></span></label>
        </div>
      </div>
      <footer className="admin-dialog-footer">{(formError || (attempted && error)) && <p role="alert" className="admin-error">{formError || error}</p>}<div className="admin-dialog-actions"><span className="admin-save-hint">{busy ? 'Procesando imagen…' : dirty ? 'Cambios sin guardar' : isNew ? 'Completa la ficha para publicar' : 'Sin cambios pendientes'}</span><button type="button" className="admin-secondary" data-cancel-editor>Cancelar</button><button className="primary-button" type="submit" disabled={busy}><Check size={18} />Guardar producto</button></div></footer>
    </form>
  </AdminDialog>;
}

function CouponEditor({ initial, isNew, onSave, onDelete, onClose, error }: {
  initial: Coupon; isNew: boolean; onSave: (c: Coupon) => boolean; onDelete: () => void; onClose: () => void; error: string;
}) {
  const [coupon, setCoupon] = useState(initial);
  const [formError, setFormError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  return <AdminDialog title={isNew ? 'Nuevo cupón' : 'Editar cupón'} subtitle="Define el descuento y las condiciones para usarlo." dirty={JSON.stringify(initial) !== JSON.stringify(coupon)} onClose={onClose}>
    <form className="admin-dialog-form" onSubmit={e => { e.preventDefault(); setAttempted(true); const clean = { ...coupon, code: coupon.code.trim().toUpperCase() }; if (!/^[A-Z0-9_-]{3,24}$/.test(clean.code)) { setFormError('Usa entre 3 y 24 letras, números, guiones o guiones bajos.'); return; } setFormError(''); onSave(clean); }}>
      <div className="admin-dialog-body">
        <label>Código<input aria-label="Código" required maxLength={24} value={coupon.code} placeholder="Ej. PANDO20" onChange={e => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} /><small className="admin-field-hint">El cliente escribe este código en el carrito.</small></label>
        <div className="admin-field"><span>Tipo de descuento</span><ShopSelect label="Tipo de descuento" value={coupon.kind} onChange={v => setCoupon({ ...coupon, kind: v as Coupon['kind'] })} options={[{ value: 'percent', label: 'Porcentaje (%)' }, { value: 'fixed', label: 'Monto fijo (Bs.)' }]} /></div>
        <div className="admin-fields"><label>{coupon.kind === 'percent' ? 'Porcentaje de descuento' : 'Descuento (Bs.)'}<input required type="number" min="0.01" max={coupon.kind === 'percent' ? 100 : 1000000} step="0.01" value={coupon.value || ''} onChange={e => setCoupon({ ...coupon, value: Number(e.target.value) })} /></label><label>Compra mínima (Bs.)<input required type="number" min="0" max="1000000" step="0.01" value={coupon.minimum} onChange={e => setCoupon({ ...coupon, minimum: Number(e.target.value) })} /></label></div>
        <label>Fecha de vencimiento (opcional)<input type="date" value={coupon.expires} onChange={e => setCoupon({ ...coupon, expires: e.target.value })} /></label>
        <div className="admin-switch-row"><div><strong>Cupón activo</strong><p>Páusalo para impedir su uso sin eliminarlo.</p></div><button className="admin-switch" type="button" role="switch" aria-label="Cupón activo" aria-checked={coupon.active} onClick={() => setCoupon({ ...coupon, active: !coupon.active })}><span /></button></div>
        <p className="admin-field-hint">Un cupón por compra. Se aplica sobre los precios de venta y no descuenta el envío.</p>
        {!isNew && <div className="admin-delete-area">{deleting ? <><p>¿Eliminar {initial.code}? Dejará de estar disponible en el carrito.</p><div><button type="button" className="admin-secondary" onClick={() => setDeleting(false)}>Conservar cupón</button><button type="button" className="admin-danger" onClick={() => { setAttempted(true); onDelete(); }}>Sí, eliminar</button></div></> : <button type="button" className="admin-danger" onClick={() => setDeleting(true)}><Trash2 size={16} />Eliminar cupón</button>}</div>}
      </div>
      <footer className="admin-dialog-footer">{(formError || (attempted && error)) && <p className="admin-error" role="alert">{formError || error}</p>}<div className="admin-dialog-actions"><button type="button" className="admin-secondary" data-cancel-editor>Cancelar</button><button className="primary-button" type="submit"><Check size={18} />Guardar cupón</button></div></footer>
    </form>
  </AdminDialog>;
}

export default function AdminPanel({ data, save, error }: Props) {
  const [section, setSection] = useState<'catalog' | 'coupons'>('catalog');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [product, setProduct] = useState<Product | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [notice, setNotice] = useState('');
  const [localError, setLocalError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const close = () => { setProduct(null); setCoupon(null); setLocalError(''); };
  const commit = (next: DemoData, message: string) => { if (!save(next)) return false; setNotice(message); close(); return true; };
  const products = data.products.filter(p => normalize(`${p.name} ${p.brand}`).includes(normalize(search)) && (filter === 'all' || (filter === 'published' ? !p.hidden : filter === 'offers' ? hasOffer(p) : p.hidden)));
  const countLabel = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 6000); return () => window.clearTimeout(timer); }, [notice]);
  return <div className="admin-shell">
    <aside className="admin-nav"><StoreLink href="/" className="admin-brand"><img src="/images/brand/logo-noche.png" alt="Amazonía en Casa" width="220" height="60" /></StoreLink><p className="admin-nav-label">Administración</p>
      <nav aria-label="Administración">{([{ id: 'catalog', label: 'Catálogo', icon: Package }, { id: 'coupons', label: 'Cupones', icon: Tag }] as const).map(({ id, label, icon: Icon }) => <button key={id} aria-current={section === id ? 'page' : undefined} onClick={() => { setSection(id); setNotice(''); }}><Icon size={19} /><span>{label}</span></button>)}</nav>
      <div className="admin-nav-bottom"><StoreLink href="/"><ArrowLeft size={16} /> Volver a la tienda</StoreLink></div>
    </aside>
    <main className="admin-main"><div className="admin-top"><span>Amazonía en Casa <span>/ Administración</span></span><StoreLink href="/">Ver tienda <ArrowUpRight size={16} /></StoreLink></div>
      <header className="admin-heading"><div><p className="eyebrow">ADMINISTRA TU TIENDA</p><h1>{section === 'catalog' ? 'Catálogo' : 'Cupones'}</h1><p>{section === 'catalog' ? 'Publica productos, ajusta precios y gestiona tus ofertas.' : 'Configura descuentos y las condiciones para usarlos.'}</p></div>
        <button className="primary-button" onClick={() => { setNotice(''); if (section === 'catalog') setProduct(blankProduct()); else setCoupon({ id: uid(), code: '', kind: 'percent', value: 10, minimum: 0, expires: '', active: true }); }}><Plus size={18} />{section === 'catalog' ? 'Nuevo producto' : 'Nuevo cupón'}</button>
      </header>
      <section className="admin-list" aria-label={section === 'catalog' ? 'Productos' : 'Cupones disponibles'}>
        {section === 'catalog' ? <>
          <div className="admin-list-toolbar"><div className="admin-search-field"><label htmlFor="admin-search">Buscar productos</label><div className="admin-search"><Search size={19} /><input ref={searchRef} id="admin-search" placeholder="Busca por nombre o marca…" value={search} onChange={e => setSearch(e.target.value)} />{search && <button type="button" aria-label="Borrar búsqueda" onClick={() => { setSearch(''); searchRef.current?.focus(); }}><X size={17} /></button>}</div></div><div className="admin-filter-field"><span>Mostrar</span><ShopSelect label="Filtrar productos" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Todos los productos' }, { value: 'published', label: 'Publicados' }, { value: 'draft', label: 'Ocultos' }, { value: 'offers', label: 'Con oferta' }]} /></div></div>
          <div className="admin-results"><p role="status"><strong>{countLabel}</strong>{search && ` para “${search}”`}</p>{(search || filter !== 'all') && <button className="text-link" onClick={() => { setSearch(''); setFilter('all'); }}>Limpiar filtros</button>}</div>
          <div className="admin-list-caption"><span>PRODUCTO</span><span>PRECIO / ESTADO</span></div>
          {products.map(p => <button className="admin-product-row" key={p.id} onClick={() => { setNotice(''); setProduct({ ...p, image: productImage(p), customImage: true }); }} aria-label={`Editar ${p.name}`}><img src={productImage(p)} alt="" loading="lazy" /><span><strong>{p.name}</strong><small>{p.weightVolume} · {CATEGORIES.find(c => c.id === p.category)?.label}</small>{hasOffer(p) && <span className="admin-offer-badge"><Tag size={12} />Oferta −{Math.round((1 - p.price / p.originalPrice!) * 100)}%</span>}</span><span className="admin-row-price"><strong>{money(p.price)}</strong>{hasOffer(p) && <del>{money(p.originalPrice!)}</del>}<small className={p.hidden ? '' : 'is-live'}>{p.hidden ? 'Oculto' : p.inStock ? 'Publicado' : 'Agotado'}</small></span><Pencil size={16} /></button>)}
          {!products.length && <div className="admin-empty"><Search /><h2>No encontramos productos</h2><p>Prueba otro nombre o cambia los filtros.</p><button className="admin-secondary" onClick={() => { setSearch(''); setFilter('all'); searchRef.current?.focus(); }}>Ver todos los productos</button></div>}
        </> : <><p className="admin-section-note">{data.coupons.length} cupones · Selecciona uno para editar sus condiciones.</p>{data.coupons.map(c => <button className="admin-coupon-row" key={c.id} aria-label={`Editar cupón ${c.code}`} onClick={() => { setNotice(''); setCoupon({ ...c }); }}><Tag size={23} /><span><strong>{c.code}</strong><span>{c.kind === 'percent' ? `${c.value}% de descuento` : `${money(c.value)} de descuento`} · Mínimo {money(c.minimum)}</span><small>{!c.active ? 'Pausado' : c.expires && new Date(`${c.expires}T23:59:59`) < new Date() ? 'Vencido' : 'Activo'} · {c.expires ? `Vence ${c.expires}` : 'Sin vencimiento'}</small></span><Pencil size={18} /></button>)}{!data.coupons.length && <div className="admin-empty"><Tag /><h2>Aún no hay cupones</h2><p>Crea el primero para ofrecer un descuento en el carrito.</p></div>}</>}
      </section>
      <footer className="admin-footer">Amazonía en Casa <span>Catálogo y promociones</span></footer>
    </main>
    <div className="admin-toast-region" role="status" aria-live="polite">{notice && <div className="admin-toast"><Check size={20} /><span>{notice}</span><button aria-label="Cerrar notificación" onClick={() => setNotice('')}><X size={18} /></button></div>}</div>
    {product && <ProductEditor initial={product} isNew={!data.products.some(p => p.id === product.id)} error={error} onClose={close} onSave={p => commit({ ...data, products: data.products.some(row => row.id === p.id) ? data.products.map(row => row.id === p.id ? p : row) : [...data.products, p] }, `${p.name}: cambios guardados.${hasOffer(product) && !hasOffer(p) ? ' Oferta retirada.' : ''}`)} />}
    {coupon && <CouponEditor initial={coupon} isNew={!data.coupons.some(c => c.id === coupon.id)} error={localError || error} onClose={close} onDelete={() => commit({ ...data, coupons: data.coupons.filter(c => c.id !== coupon.id) }, 'Cupón eliminado.')} onSave={c => { if (data.coupons.some(row => row.id !== c.id && row.code === c.code)) { setLocalError('Ya existe un cupón con ese código.'); return false; } setLocalError(''); return commit({ ...data, coupons: data.coupons.some(row => row.id === c.id) ? data.coupons.map(row => row.id === c.id ? c : row) : [...data.coupons, c] }, `Cupón ${c.code} guardado.`); }} />}
  </div>;
}
