# Amazonía en Casa

Tienda de productos de Pando construida con React, TypeScript y Vite. Conserva el catálogo de demostración en `src/data/products.ts`. No tiene backend de pedidos y no necesita una clave de Gemini para funcionar.

## Desarrollo

Usar Node.js 22 y npm. Ejecutar `npm ci`, luego `npm run dev`. Validación: `npm run lint` y `npm run build`. Para revisar la compilación: `npm run preview`.

La compilación genera `dist/` y prerenderiza el catálogo como HTML con `scripts/prerender.ts`. React hidrata la página y recupera carrito y favoritos de localStorage después del montaje. `package-lock.json` es el archivo de bloqueo del flujo npm; `bun.lock` pertenece al scaffold original.

## Diseño y contenido

Marfil `#faf9f5` para superficies, verde bosque `#254f3b` para acciones y terracota `#a04a33` para descuentos. Los tokens están en `src/index.css`. Iconos Lucide, serif para titulares y Plus Jakarta Sans para lectura. La fotografía de portada se sirve localmente; fuente: https://images.unsplash.com/photo-1447933601403-0c6688de566e. Las fotos del catálogo son ilustrativas. `src/productPresentation.ts` sustituye tres imágenes de ejemplo (café, chips de yuca y castañas) sin modificar los mocks; las fuentes y licencias están en `public/creditos.html`. Las demás conservan sus URLs remotas originales.

Búsqueda sin distinción de tildes, filtros por categoría/origen, orden por precio, favoritos y carrito persistentes. Los paneles tienen control de foco, fondo inerte y cierre con Escape, también al pasar de favoritos a detalle o de carrito a resumen. La lectura independiente del almacenamiento evita que un carrito malformado impida recuperar favoritos. El envío a WhatsApp prepara una solicitud y conserva el carrito; no confirma pago, recepción ni existencia de un pedido en un servidor.

## SEO y publicación

HTML inicial con catálogo, encabezados semánticos, metadatos de descripción y sociales, idioma español, favicon y zoom habilitado. No se publican reseñas mock como datos estructurados ni se inventa un dominio para canonical o sitemap. Configurar `SITE_URL` con el origen HTTPS definitivo (sin rutas, parámetros ni fragmentos) en el entorno de compilación o en `.env.production`. `npm run build` genera la URL canónica, `og:url`, imagen social absoluta, datos `WebSite` y `dist/sitemap.xml`; `dist/robots.txt` permite el rastreo y anuncia el sitemap. Sin dominio, la compilación avisa y omite las URLs absolutas. No se usa automáticamente el dominio de previews. Publicar el contenido de `dist/` y enviar `/sitemap.xml` a Google Search Console después de verificar la propiedad. La indexación y los plazos dependen del buscador. Los cambios del administrador en localStorage no actualizan el HTML público: el contenido indexable procede del catálogo incluido en cada compilación. Las fichas públicas tienen rutas `/productos/<id>/`, con slugs descriptivos estables tomados de los identificadores del catálogo. Cada build genera una carpeta e `index.html` por producto visible, título, descripción, imagen social y canonical propios, además de enlaces desde el catálogo, referencias relacionadas y datos de navegación `WebPage`/`BreadcrumbList`. El sitemap incluye la portada y las fichas. No se publican ofertas ni valoraciones estructuradas porque los precios y existencias son de demostración. Renombrar un producto no cambia su slug; cambiar su ID exige planificar una redirección. La compilación rechaza slugs repetidos o no válidos.

La navegación interna usa React Router y conserva la instancia de la tienda, sus filtros, carrito y favoritos sin recargar el documento. Los enlaces siguen exponiendo href reales para buscadores, nuevas pestañas y navegación sin JavaScript. BrowserRouter gestiona el historial y StaticRouter prerenderiza cada ficha; los metadatos, foco y scroll se actualizan al navegar. Carrito y favoritos se recuperan del almacenamiento tras una entrada directa o recarga. Los productos añadidos exclusivamente en el administrador local siguen en paneles: para publicar su URL hay que incorporarlos al catálogo fuente y compilar. Los productos ocultos del catálogo fuente no generan página ni aparecen en el sitemap. Se genera `404.html` con `noindex`; Vercel sirve los archivos estáticos con barra final y sin una reescritura global a la portada. `vite preview` usa modo multipágina y devuelve 404 en rutas inexistentes. En desarrollo, las rutas de producto se renderizan en el navegador. La búsqueda y los filtros conservan un h1. No se muestran opiniones mock, badges ni recomendaciones terapéuticas heredadas.

## Revisión y pruebas

La revisión del 5 de septiembre de 2026 y sus límites están en `docs/frontend-review.md`. `output/playwright/` contiene capturas de los cuatro anchos, scripts de recorridos para `playwright-cli run-code --filename=...` y sus resultados. Ejecutar contra `npm run preview -- --host 127.0.0.1 --port 4173`. Las pruebas usan datos ficticios en un navegador aislado e interceptan WhatsApp.

## Instrucciones de proyecto

`AGENTS.md` activa únicamente aquí las skills de `.agents/skills/amazonia-frontend/` y `.agents/skills/amazonia-diagnostico-incidentes/`. No hay una skill de backend porque no existe esa implementación.

## Administración del catálogo y cupones

Abre **Administrar tienda** o entra a `/#admin`. El acceso es público y no requiere autenticación; la aplicación continúa siendo un portfolio estático con almacenamiento local, sin backend. La interfaz no muestra etiquetas de demo.

- **Catálogo:** crear y editar productos en un diálogo; subir fotos, elegir categorías existentes, cambiar descripciones, precios, disponibilidad, destacados y visibilidad. Ocultar conserva el producto para volver a publicarlo.
- **Ofertas:** interruptor explícito, precio habitual y precio de oferta, vista previa del descuento y ahorro. Desactivar la oferta y guardar restituye el precio habitual. El filtro **Con oferta** permite encontrarlas; precios y descuentos se actualizan también en el carrito.
- **Cupones:** porcentaje o monto fijo en Bs., compra mínima, vencimiento y activación. Edición en diálogo y confirmación antes de eliminar.
- **Interacción:** búsqueda por nombre o marca sin distinción de tildes, contador, filtros y estados vacíos. Selectores compartidos con el catálogo público; se abren hacia el espacio disponible en el diálogo. Pie fijo con acciones, confirmación de guardado y aviso antes de descartar cambios. Escape cierra primero el selector abierto y luego el diálogo; el foco vuelve al disparador.

Studio, posts y exportación de publicaciones se retiraron. Los datos locales anteriores conservan productos y cupones; los posts antiguos se ignoran al cargar. Los registros originales de `src/data/products.ts` permanecen intactos.

Los cambios viven en `localStorage` bajo `amazonia_admin_v1`; se recuperan después de hidratar y se sincronizan entre pestañas del mismo origen/navegador. No se comparten entre dispositivos ni sobreviven al borrado de datos del navegador. Las fotos se reducen antes de guardarse; si se alcanza la cuota se muestra un error dentro del diálogo y se conserva el borrador. Para reiniciar los datos desde las herramientas del navegador, elimina únicamente `amazonia_admin_v1` y recarga.

### Vercel

Importa el proyecto con preset **Vite**, comando `npm run build` y directorio de salida `dist` (también definidos en `vercel.json`). No necesita base de datos, variables secretas ni un webservice persistente. La navegación `/#admin` funciona sin reglas de reescritura. El administrador carga en un bloque JavaScript separado y el catálogo público conserva el prerenderizado. La configuración está preparada; este trabajo no publica un deployment.
