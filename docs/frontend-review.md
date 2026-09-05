# Revisión del frontend · 5 de septiembre de 2026

## Resultado y referencia

Se conserva React + TypeScript + Vite, el estado propietario de App y los 32 registros de `src/data/products.ts`. Comparación byte a byte contra la copia anterior: sin cambios. No hay backend, pagos reales ni publicación. Esta carpeta no contiene `.git`; no se creó commit ni se atribuyeron cambios anteriores a esta revisión.

El servidor MCP **directo** `figma` sí funcionó con la última referencia compartida: [archivo x2gFHfWQGMEvcWauA72uOM](https://www.figma.com/design/x2gFHfWQGMEvcWauA72uOM/E-Commerce-UI---Full-Figma-UI-Design--Community-?node-id=0-1). Se cargó `skill://figma/figma-design-to-code/SKILL.md` antes de `get_design_context`. Se inspeccionó la página Preview y se obtuvo código/contexto y capturas de `1:5967` (portada móvil), `1:6685` (filtros móvil) y `1:8284` (catálogo de escritorio). La estructura también incluye dirección de entrega (`1:6102`, `1:6225`).

Se adaptaron búsqueda visible, separación de controles, lectura de nombre/precio y superficies de paneles. No se copiaron su marca, sus fotos de zapatillas, colores rosa/azul, funciones de subasta ni navegación de marketplace. El error `USER_NOT_LOGGED_IN` documentado anteriormente correspondía al conector anterior; no ocurrió en el servidor directo durante esta revisión.

## Cambios implementados

- Portada con marca y Pando explícitos, redacción más concreta y cuerpo legible. Se conserva la fotografía local, el fondo marfil y la paleta bosque/terracota.
- Catálogo con tipografía mayor, controles de 44 px, cantidades cómodas en móvil, filtros recuperables y un h1 al buscar o filtrar. La ordenación predeterminada usa destacados y orden del catálogo; se retiró “Mejor valorados” basado en reseñas ficticias.
- Ficha con fotografía y texto separados, precio, presentación, composición, origen y acciones claras. Sin opiniones mock, badges, beneficios terapéuticos, dosis ni promesa de entrega inmediata. La disponibilidad respeta `inStock`.
- `productPresentation.ts` separa la presentación de los datos originales. Las descripciones de la categoría medicinal se muestran de forma neutral; los campos comerciales originales se conservan.
- Se retiró `GuiaBotanicoModal`, código no accesible desde Header que contenía consejos terapéuticos no verificados. No se sustituyó por otro asesor ficticio.
- Orígenes calculados desde `PRODUCTS` y `COMMUNITIES`. Se eliminaron descripciones geográficas/promesas manuales y listas de productos que podían divergir. Elegir origen limpia otros filtros y lleva al catálogo.
- Favoritos con apertura de ficha mediante botones accesibles. Carrito vacío con concordancia corregida; títulos completos, controles mayores y lenguaje consistente.
- Carrito y entrega con cupones removibles; un código inválido no deja oculto el descuento anterior. Se conservan los cupones mock AMAZONIA10 (10%), PANDO (Bs. 15, limitado al subtotal) y SELVA (15%).
- Tarifas conservadas y etiquetadas como estimaciones: Cobija Bs. 10, sin costo desde Bs. 150 de subtotal **antes del cupón**; nacional Bs. 25; recojo sin costo. Entrega local requiere dirección y ciudad Cobija. Pago es una preferencia por coordinar.
- WhatsApp usa “Solicitud”, “Referencia de consulta” y “TOTAL ESTIMADO”; la consulta directa distingue productos sin envío. No se vacía el carrito ni se anuncia pago/recepción confirmados.
- Recuperación independiente de cada clave de localStorage: JSON corrupto en carrito no bloquea favoritos; cantidades enteras positivas, productos canónicos por id y duplicados consolidados.
- `useDialog` mantiene un registro compartido de paneles activos, fondo `inert`, scroll bloqueado y foco de retorno. Esto corrige la carrera al sustituir favoritos por detalle. Escape y Tab comprobados. Entrega enfoca el primer campo.
- Se eliminó la descarga de Playfair Display, que no se utilizaba. Se conserva Plus Jakarta Sans y Georgia.

## Fotografías

Tres sustituciones de presentación, sin editar los registros: café sin envase de una marca ajena, chips de yuca en lugar de paquetes Cheetos y castañas en lugar de otra semilla. Se sirven localmente desde `public/images/` y se aplican también en ficha, carrito y favoritos.

Chips: [Ranjithsiji, Cassava Chips Kerala DSC 9852](https://commons.wikimedia.org/wiki/File:Cassava_Chips_Kerala_DSC_9852.jpg). Castañas: [Henning Schlottmann, Brazil nuts 9576](https://commons.wikimedia.org/wiki/File:Brazil_nuts_9576.jpg). Ambas CC BY-SA 4.0; miniaturas de Wikimedia sin edición, con encuadre CSS. Créditos y licencia accesibles desde el pie en `/creditos.html`. No representan el producto real de Pando. El resto de fotos sigue siendo mock remoto y requiere sustitución por fotografía comercial real antes de publicar.

## SEO y límites de contenido

El HTML de producción contiene 32 artículos y un h1 antes de ejecutar JavaScript; conserva idioma, descripción, metadatos sociales y navegación interna. Búsqueda/filtros mantienen encabezado principal. No hay datos estructurados de reseñas ni dominio inventado.

Se evaluaron URLs individuales: aportarían descubrimiento e indexación de cada ficha, pero se posponen hasta validar las descripciones y fotografías del catálogo publicable. Las fichas siguen como paneles sin URL indexable. No se presenta esto como SEO de producto terminado para producción. Canonical, sitemap y URLs sociales absolutas necesitan el dominio final.

## Validación

`npm run lint` y `npm run build`: correctos. Lint es el chequeo TypeScript configurado en package.json. Build genera el catálogo con `scripts/prerender.ts`. Comparación de mocks: intactos.

Navegador Chromium contra `vite preview`, con capturas a **320, 390, 768 y 1440 px**. Se examinaron portada, catálogo, detalle, carrito y entrega. Sin desbordamiento horizontal del documento. Las primeras capturas detectaron estados intermedios de animación/carga; se repitieron tras estabilizar el render. Evidencia final:

- `output/playwright/home-{ancho}.png`
- `output/playwright/catalog-{ancho}.png`
- `output/playwright/detail-{ancho}.png`
- `output/playwright/cart-{ancho}.png`
- `output/playwright/delivery-{ancho}.png`
- Complementos: `origins-390.png`, `favorites-390.png`, `footer-390.png`, `cart-reflow-720x450.png`.

Recorridos reproducibles en `output/playwright/check-flows.js`, `check-accessibility.js` y `check-visual.js`, para `playwright-cli run-code --filename=...`. Resultados en los archivos `*-results.txt` de esa carpeta. Usan navegador de prueba aislado y datos ficticios; no ejecutarlos en una sesión personal con carrito real.

**35 comprobaciones funcionales**: búsqueda sin tildes, vacío/restablecimiento, 32 productos, categorías/origen, orden ascendente, persistencia, tres cupones, cupón inválido/remoción, cantidades, teléfono sin dígitos rechazado, datos incompletos, entrega nacional/recojo, preferencia de pago, resumen, conservación de carrito, ambas salidas WhatsApp interceptadas, foco y cambio de panel, recuperación de JSON corrupto. Sin errores de React/hidratación.

**9 comprobaciones adicionales**: Tab circular/inverso, restauración de fondo y scroll, movimiento reducido, HTML inicial, ausencia de aggregateRating, duplicados y reflujo a 720×450 (equivalente espacial a una ventana 1440×900 con zoom 200%; no prueba del zoom nativo de todos los navegadores).

Ejemplos numéricos verificados: 3 cafés = Bs. 135; AMAZONIA10 + local = Bs. 131,50. Cuatro cafés = Bs. 180; AMAZONIA10 + local sin costo = Bs. 162. SELVA + nacional = Bs. 178. WhatsApp reflejó 4 unidades y Bs. 178 estimados; `window.open` interceptado y red WhatsApp abortada, sin mensajes reales.

## Skills locales

Se mantuvieron las dos skills de `.agents/skills/`; ambas pasan `quick_validate.py`. Autocarga e instalación únicamente mediante el AGENTS.md de este repositorio, sin cambios globales.

Patrones anclados: App para recuperación/persistencia; productPresentation para imágenes/texto; useDialog para transición y foco; handleWhatsAppCheckout para solicitud y estimaciones. El grafo se refrescó tras comprobar referencias antiguas y cobertura parcial.

Evaluación manual de disparadores: “pulir ficha/carrito” activa frontend; “carrito corrupto pierde favoritos” activa diagnóstico; “crear API de pedidos” queda fuera de ambos. Caso reservado: “favoritos → detalle → Escape” debe verificar bloqueo compartido y foco, no solo cierre. Disparadores sin cambio; validación mejorada. No se añadieron skills, backend, abstracciones comerciales ni reglas especulativas.

## Pendientes de publicación

Contenido, precios, cupones, tarifas, marcas, disponibilidad y teléfono de destino son configuración/datos heredados de demostración, no condiciones comerciales verificadas. Sustituir fotografías restantes por producto real; revisar afirmaciones de los textos mock antes de publicarlos. No se verificó operación real de la tienda, envío de mensajes, recepción de pedidos ni pago. No hay backend ni integración productiva. Validación realizada en Chromium; no constituye certificación WCAG ni prueba exhaustiva de lectores de pantalla o Safari/iOS.
