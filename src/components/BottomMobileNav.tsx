import React from 'react';
import { Home, Grid, Compass, Sparkles, ShoppingBag } from 'lucide-react';

interface BottomMobileNavProps {
  cartCount: number;
  activeTab: 'home' | 'categories' | 'ruta' | 'guia' | 'cart';
  onSelectTab: (tab: 'home' | 'categories' | 'ruta' | 'guia' | 'cart') => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  cartCount,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1c12]/95 backdrop-blur-lg border-t border-stone-200 py-1.5 px-3 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Inicio */}
        <button
          id="nav-home-btn"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'home'
              ? 'text-emerald-900 font-bold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Inicio</span>
        </button>

        {/* Categorías */}
        <button
          id="nav-categories-btn"
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'categories'
              ? 'text-emerald-900 font-bold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Categorías</span>
        </button>

        {/* Ruta de Pando */}
        <button
          id="nav-ruta-btn"
          onClick={() => onSelectTab('ruta')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'ruta'
              ? 'text-emerald-900 font-bold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Orígenes</span>
        </button>

        {/* Asesor Botánico */}
        <button
          id="nav-guia-btn"
          onClick={() => onSelectTab('guia')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors relative ${
            activeTab === 'guia'
              ? 'text-emerald-900 font-bold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-emerald-900 animate-pulse" />
          <span className="text-[10px] tracking-tight">Guía</span>
        </button>

        {/* Carrito */}
        <button
          id="nav-cart-btn"
          onClick={() => onSelectTab('cart')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors relative ${
            activeTab === 'cart'
              ? 'text-emerald-900 font-bold'
              : 'text-stone-600 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#e5ebdf] text-stone-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Canasta</span>
        </button>
      </div>
    </div>
  );
};
