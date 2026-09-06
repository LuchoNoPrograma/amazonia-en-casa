# Amazonía en Casa

[Ver la tienda](https://luchonoprograma.github.io/amazonia-en-casa/)

Amazonía en Casa es una tienda web de productos amazónicos. Reúne alimentos, artesanía y cuidado personal en un catálogo que puedes explorar desde el celular o la computadora.

Permite buscar productos, filtrarlos por categoría, consultar sus detalles, guardar favoritos y añadirlos al carrito. Desde el carrito puedes indicar tus datos y la forma de entrega para preparar una solicitud por WhatsApp.

También incluye un panel de administración para crear y editar productos, cambiar precios, gestionar ofertas y configurar cupones.

## Sobre el proyecto

Está desarrollado con React, TypeScript y Vite. Es un proyecto de portfolio con un catálogo de ejemplo, sin backend ni procesamiento de pagos. El carrito, los favoritos y los cambios del administrador se guardan en el navegador; no se comparten entre usuarios o dispositivos.

## Instalación

Necesitas Node.js 22 y npm.

```bash
git clone https://github.com/LuchoNoPrograma/amazonia-en-casa.git
cd amazonia-en-casa
npm install
npm run dev
```

Abre [localhost:3000](http://localhost:3000). No hace falta configurar claves de API ni una base de datos.

## Cómo probarlo

Busca un producto, abre su ficha y añádelo al carrito. Puedes cambiar cantidades, guardar favoritos y recargar la página para comprobar que se conservan.

En **Administrar tienda** puedes editar el catálogo y probar ofertas y cupones. Los cambios solo afectan a tu navegador. El catálogo inicial está en `src/data/products.ts`.

La opción de WhatsApp prepara el mensaje de solicitud para que lo revises antes de enviarlo. No confirma una compra ni registra un pedido.
