# Demo administrable · 5 de septiembre de 2026

Implementación de portfolio sobre React + Vite, sin servidor, autenticación ni base de datos. Entrada desde la franja superior de la tienda o `/#admin`.

## Alcance entregado

Catálogo local editable con altas, fotos, descripción, categorías existentes, precios de venta/anteriores, disponibilidad, destacados y visibilidad. Cupones con descuento porcentual/fijo, compra mínima, vencimiento, activación y eliminación. Studio con subida y compresión de imágenes, borradores, publicaciones en Novedades, relación con productos y exportación PNG de 1080 × 1350. Restauración confirmada a los mocks originales.

El catálogo visible, conteos, favoritos y carrito usan el estado editado; ocultar un producto lo retira del carrito/favoritos y de los enlaces de posts. El almacenamiento local se recupera tras hidratar y sincroniza pestañas. Ante una cuota excedida, no se informa un guardado exitoso y se conserva el editor con sus cambios.

## Validación ejecutada

- `npm run lint`: aprobado (TypeScript).
- `npm run build`: aprobado, incluido prerenderizado; administrador separado en un chunk de aproximadamente 20 kB antes de gzip.
- Chromium contra `npm run preview`: 55 comprobaciones aprobadas en `output/playwright/check-admin.js` y `output/playwright/check-admin-regression.js`.
- Altas y edición, foto subida, oferta visible, persistencia, actualización de precio en carrito, ocultar productos, restauración cancelada/confirmada y recuperación de JSON corrupto.
- Cupón porcentual/fijo, mínimo, vencimiento, pausa, código duplicado, eliminación, remoción y umbral de envío local calculado antes del descuento; envío nacional y recojo.
- Borrador no visible, post publicado y enlazado, descarga de PNG y enlace retirado cuando se oculta el producto.
- Cuota simulada: mensaje de error y borrador conservado. Sincronización entre dos pestañas del mismo origen.
- Búsqueda sin tildes, búsqueda vacía, categorías, filtro de origen y orden de precio.
- Teclado, retorno de foco, fondo inerte (incluida entrada admin), favoritos → detalle y carrito → resumen. Preferencia de movimiento reducido.
- Capturas e inspección visual a 320, 390, 768 y 1440 px. Sin desbordamiento horizontal en tienda, administrador y editor.
- Sin errores de React/hidratación en el recorrido principal. WhatsApp interceptado, sin mensajes enviados.

Resultados: `output/playwright/admin-results.txt` y `output/playwright/admin-regression-results.txt`. Capturas: `admin-catalog-*`, `admin-editor-*`, `admin-coupons-*`, `admin-studio-*`, `admin-post-store-*` y `post-export.png`.

## Publicación y límites

`vercel.json` configura Vite, `npm run build` y `dist`; no se realizó un deployment. Referencia consultada: [configuración estática de Vercel](https://vercel.com/docs/project-configuration/vercel-json).

Cada navegador tiene una demo independiente; las modificaciones no actualizan otros dispositivos ni el HTML prerenderizado público. El botón de administrador es público, intencionalmente sin login simulado. No hay pagos, inventario por cantidades, registro de pedidos, límites globales de uso de cupones ni publicación/programación en redes. WhatsApp continúa preparando una solicitud con importes estimados. Las fotos remotas dependen de su proveedor y su política CORS; subir un archivo permite exportar el post localmente. No se hicieron pruebas en Safari/Firefox ni en un deployment real de Vercel.
