# Amazonía en Casa

## Descubrimiento
Preferir codebase-memory-mcp: search_graph, trace_path, get_code_snippet y query_graph. Indexar si falta el proyecto. Usar búsqueda textual para literales, configuración o cobertura insuficiente.

## Skills locales y autocarga
Este paquete se aplica únicamente a este repositorio. Antes de modificar UI, UX, redacción, SEO o compra, leer `.agents/skills/amazonia-frontend/SKILL.md`. Para fallos desconocidos, leer primero `.agents/skills/amazonia-diagnostico-incidentes/SKILL.md`.

Para crear, auditar o mantener este paquete, cargar `/home/nini/.codex/skills/manage-project-skills/SKILL.md`; si se mueve, localizarlo antes de continuar. No instalar estas skills globalmente.

## Fronteras
Aplicación React + TypeScript + Vite. Catálogo mock en `src/data/products.ts`; estado local en `App`. No existe servidor de pedidos implementado. Conservar datos mock. WhatsApp prepara una solicitud, no confirma pago ni recepción.

## Validación
Ejecutar `npm run lint` y `npm run build` para cambios de aplicación. Revisar móvil y escritorio y el recorrido afectado en navegador. No enviar mensajes reales durante pruebas.
