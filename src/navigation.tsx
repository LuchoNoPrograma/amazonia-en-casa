import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { publicProduct, productPath, productSeo } from './productRoutes';

const homeTitle = 'Productos amazónicos en Bolivia | Amazonía en Casa';
const homeDescription = 'Explora chocolates, artesanía y cuidado personal de Bolivia, Brasil y Colombia. Catálogo de demostración de Amazonía en Casa con consultas por WhatsApp.';

function updateMetadata(pathname: string, origin?: string) {
  const product = publicProduct(pathname);
  const missing = pathname !== '/' && !product;
  const seo = product ? productSeo(product) : missing ? {title:'Página no encontrada | Amazonía en Casa', description:'La página solicitada no está disponible. Explora el catálogo de Amazonía en Casa.'} : {title:homeTitle, description:homeDescription};
  document.title = seo.title;
  for (const key of ['description','og:title','og:description','twitter:title','twitter:description']) {
    document.querySelector(`meta[name="${key}"],meta[property="${key}"]`)?.setAttribute('content', key.endsWith('title') ? seo.title : seo.description);
  }
  document.querySelector('meta[name="robots"]')?.setAttribute('content', missing ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  document.querySelectorAll('link[rel="canonical"],meta[property="og:url"],meta[property="og:image"],meta[property="og:image:alt"],meta[name="twitter:image"],meta[name="twitter:image:alt"],script[type="application/ld+json"]').forEach(el => el.remove());
  if (!origin || missing) return;
  const url = new URL(product ? productPath(product) : '/', origin).href;
  const image = new URL(product?.image ?? '/images/hero-coffee.jpg', origin).href;
  const imageAlt = product?.name ?? 'Granos de café tostado, portada de Amazonía en Casa';
  const canonical = document.createElement('link'); canonical.rel = 'canonical'; canonical.href = url; document.head.append(canonical);
  for (const [key,value] of [['og:url',url],['og:image',image],['og:image:alt',imageAlt],['twitter:image',image],['twitter:image:alt',imageAlt]]) {
    const meta = document.createElement('meta'); meta.setAttribute(key.startsWith('og:') ? 'property' : 'name',key); meta.content = value; document.head.append(meta);
  }
  const data = product ? {
    '@context':'https://schema.org','@type':'WebPage',name:seo.title,description:seo.description,url,inLanguage:'es-BO',
    breadcrumb:{'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'Inicio',item:new URL('/',origin).href},
      {'@type':'ListItem',position:2,name:'Catálogo',item:new URL('/#catalogo',origin).href},
      {'@type':'ListItem',position:3,name:product.name,item:url},
    ]},
  } : {'@context':'https://schema.org','@type':'WebSite',name:'Amazonía en Casa',url,inLanguage:'es-BO',description:'Catálogo de demostración de chocolates, artesanía y cuidado personal de Bolivia, Brasil y Colombia.'};
  const script = document.createElement('script'); script.type = 'application/ld+json'; script.textContent = JSON.stringify(data); document.head.append(script);
}

export function NavigationEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const origin = useRef<string | undefined>(undefined);
  const initialized = useRef(false);
  const positions = useRef(new Map<string, number>());
  const last = useRef(location);
  useEffect(() => {
    if (!initialized.current) {
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) origin.current = new URL(canonical.href).origin;
      initialized.current = true;
    }
    updateMetadata(location.pathname, origin.current);
  }, [location.pathname]);
  useEffect(() => {
    const old = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const save = () => positions.current.set(last.current.key, window.scrollY);
    window.addEventListener('scroll',save,{passive:true});
    return () => { history.scrollRestoration = old; window.removeEventListener('scroll',save); };
  }, []);
  useEffect(() => {
    if (last.current === location) return;
    last.current = location;
    const frame = requestAnimationFrame(() => {
      const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (navigationType === 'POP' && positions.current.has(location.key)) {
        window.scrollTo({top:positions.current.get(location.key)!,behavior:'instant'});
      } else if (target) target.scrollIntoView({behavior:'instant'});
      else window.scrollTo({top:0,behavior:'instant'});
      const focus = target || document.querySelector<HTMLElement>('main h1');
      if (focus) { focus.setAttribute('tabindex','-1'); focus.focus({preventScroll:true}); }
    });
    return () => cancelAnimationFrame(frame);
  }, [location,navigationType]);
  return null;
}
