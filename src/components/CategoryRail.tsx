import React from "react";
import { CATEGORIES } from "../data/products";
import { CategoryType } from "../types";
import {
  Grid2X2,
  Coffee,
  Nut,
  ShoppingBasket,
  Gift,
  Flower2,
  Leaf,
} from "lucide-react";
const icons = {
  todos: Grid2X2,
  bebidas: Coffee,
  snacks: Nut,
  artesania: ShoppingBasket,
  recuerditos: Gift,
  perfumes: Flower2,
  medicinas: Leaf,
};
export function CategoryRail({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: {
  selectedCategory: CategoryType;
  onSelectCategory: (c: CategoryType) => void;
  categoryCounts: Record<CategoryType, number>;
}) {
  return (
    <nav className="category-tabs" aria-label="Categorías de productos">
      {CATEGORIES.map((cat) => {
        const Icon = icons[cat.id];
        return (
          <button
            id={`cat-btn-${cat.id}`}
            key={cat.id}
            aria-pressed={selectedCategory === cat.id}
            onClick={() => onSelectCategory(cat.id)}
          >
            <Icon size={19} />
            <span>{cat.shortLabel}</span>
            <small>{categoryCounts[cat.id]}</small>
          </button>
        );
      })}
    </nav>
  );
}
