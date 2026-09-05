import { productImage } from "../productPresentation";
import { useDialog } from "./useDialog";
import React from "react";
import { Product } from "../types";
import { Heart, X, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart,
  onSelectProduct,
}) => {
  const dialogRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Mis favoritos"
      tabIndex={-1}
      className="dialog-backdrop drawer-backdrop"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="drawer-panel"
      >
        {/* Header */}
        <div className="p-4 bg-[#faf9f5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e5ebdf] text-emerald-900 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-serif-title text-emerald-900 text-2xl">
                Mis favoritos
              </h3>
              <p className="text-[11px] text-emerald-900">
                {favorites.length}{" "}
                {favorites.length === 1
                  ? "producto guardado"
                  : "productos guardados"}
              </p>
            </div>
          </div>
          <button
            id="close-favorites-btn"
            aria-label="Cerrar"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-600 hover:text-emerald-800 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="panel-body flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl"><Heart size={28}/></div>
              <h4 className="font-serif-title text-base font-bold text-stone-800">
                No tienes productos en favoritos
              </h4>
              <p className="text-xs text-stone-600 max-w-xs">
                Toca el corazón en cualquier producto del catálogo para
                guardarlo y revisarlo cuando desees.
              </p>
              <button className="primary-button" onClick={onClose}>Explorar el catálogo</button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 bg-stone-100 p-3 rounded-md border border-stone-200 items-center justify-between"
                >
                  <button className="favorite-image-link" aria-label={`Ver ${product.name}`} onClick={() => { onSelectProduct(product); onClose(); }}>
                  <img
                    src={productImage(product)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-[#faf9f5] shrink-0 cursor-pointer"
                  />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3><button className="favorite-title" onClick={() => { onSelectProduct(product); onClose(); }}>{product.name}</button></h3>
                    <p className="text-[10px] text-emerald-900 font-medium">
                      {product.originCommunity.split(",")[0]} ·{" "}
                      {product.weightVolume}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-emerald-900">
                        Bs. {product.price}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`fav-add-cart-${product.id}`}
                          disabled={!product.inStock}
                          onClick={() => onAddToCart(product)}
                          className="px-2.5 py-1 rounded-lg bg-[#e5ebdf] hover:bg-[#e5ebdf] text-stone-950 text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{product.inStock ? "Añadir" : "Agotado"}</span>
                        </button>
                        <button
                          id={`fav-delete-${product.id}`}
                          onClick={() => onRemoveFavorite(product.id)}
                          className="p-1 text-stone-600 hover:text-rose-400 transition-colors"
                          title="Eliminar de favoritos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
