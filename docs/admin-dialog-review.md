# Administración: catálogo, cupones y diálogos

Revisión del 5 de septiembre de 2026. Sustituye el alcance de Studio descrito en la revisión anterior.

## Cambios

- Retirados Studio, publicaciones, exportación de posts y sus vistas públicas. Los datos anteriores conservan productos y cupones al leerse; los posts se ignoran.
- Retiradas las etiquetas de demo de la tienda y la administración. Se conserva el funcionamiento local sin autenticación ni backend, documentado en README.
- Creación y edición en diálogos con fondo inerte, bloqueo de scroll, foco contenido, cierre por Escape y retorno al disparador. Confirmación antes de descartar modificaciones, sin perder el borrador al elegir seguir editando.
- Selector `ShopSelect` compartido con la tienda para filtros, categorías y tipo de cupón. Dentro del diálogo, el menú usa el espacio disponible arriba o abajo; Escape cierra primero sus opciones.
- Buscador visible con borde, foco, búsqueda por nombre/marca sin tildes, botón de limpiar, contador, estado vacío y filtro de ofertas.
- Oferta activable mediante interruptor, precio habitual y precio de oferta, vista previa de porcentaje y ahorro. Al quitarla y guardar se restituye el precio habitual y se elimina el descuento de la tarjeta y del filtro Ofertas.
- Acciones alineadas y persistentes en el pie del diálogo; confirmaciones de guardado y errores dentro del editor. Ayuda de publicación, contador de descripción e indicación de cambios pendientes.
- Al quitar un cupón del carrito, el foco vuelve al campo de código.

## Comprobación

`npm run lint` y `npm run build`, incluido prerenderizado. Pruebas de navegador contra el build con `output/playwright/check-admin-dialogs.js`; resultados en `output/playwright/admin-dialog-results.txt`.

Capturas de catálogo, selector y ofertas a 320, 390, 768 y 1440 px: `catalog-refined-*`, `dialog-select-*` y `dialog-offer-*` bajo `output/playwright/`. Se inspeccionaron búsqueda, composición del diálogo, espacio del menú, scroll interno y botones del pie.

Las pruebas interceptan WhatsApp. No se envían mensajes ni se despliega en Vercel. La infraestructura continúa siendo estática; la eliminación de textos de demo no convierte el acceso público de administración en autenticación ni comparte sus datos entre dispositivos.

Resultado final: 44 comprobaciones del recorrido principal y 13 comprobaciones adicionales aprobadas (57 en total). Las adicionales cubren 320 × 568 y 768 × 450, Tab inverso, posición del menú, alta de cupón pausado, cancelación/confirmación de eliminación, solicitud de WhatsApp interceptada y lectura de datos antiguos sin recuperar posts. Script: `output/playwright/check-admin-dialog-edges.js`; resultados: `output/playwright/admin-dialog-edge-results.txt`. Sin errores de React/hidratación en el recorrido principal.
