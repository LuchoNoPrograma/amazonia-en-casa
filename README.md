# Amazonía en Casa

Una tienda web de demostración de productos amazónicos: chocolates, artesanía y cuidado personal de Bolivia, Brasil y Colombia.

[Ver la tienda](https://luchonoprograma.github.io/amazonia-en-casa/)

Puedes buscar y filtrar productos, ver sus fichas, guardar favoritos y armar un carrito. Al terminar, la aplicación prepara una solicitud para WhatsApp; la compra se coordina allí.

El botón **Administrar tienda** permite probar la edición de productos, precios, ofertas y cupones. Es de acceso público y los cambios se guardan solo en tu navegador. No modifican el catálogo que ven otras personas.

Es un proyecto de portfolio con datos de ejemplo. No tiene backend ni procesa pagos o registra pedidos. Está hecho con React, TypeScript y Vite.

## Ejecutarlo en tu equipo

Necesitas Node.js 22 y npm.

```bash
npm ci
npm run dev
```

Abre http://localhost:3000. No necesitas claves de API.

## Publicación

GitHub Actions ejecuta `npm run lint`, compila y publica en GitHub Pages cada cambio en `master`. También se puede lanzar desde la pestaña **Actions**.

Para probar la misma compilación localmente:

```bash
BASE_PATH=/amazonia-en-casa/ SITE_URL=https://luchonoprograma.github.io/amazonia-en-casa/ npm run build
BASE_PATH=/amazonia-en-casa/ npm run preview
```

Abre http://localhost:4173/amazonia-en-casa/.

El catálogo público se edita en `src/data/products.ts`. La compilación genera la portada y una página por producto en `dist/`. Las [fuentes de las fotografías](public/creditos.html) están incluidas en el proyecto.
