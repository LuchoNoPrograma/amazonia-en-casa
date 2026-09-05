export type CategoryType = 
  | 'todos'
  | 'bebidas'
  | 'snacks'
  | 'artesania'
  | 'recuerditos'
  | 'perfumes'
  | 'medicinas';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  shortLabel: string;
  icon: string;
  badgeCount?: number;
  description: string;
  bgGradient: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  price: number; // in Bolivianos (Bs.)
  originalPrice?: number;
  weightVolume: string;
  description: string;
  shortDescription: string;
  image: string;
  originCommunity: string; // e.g., 'Porvenir, Pando', 'Filadelfia, Pando'
  ingredients: string[];
  benefits: string[];
  badges: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  featured?: boolean;
  usageMode?: string;
  hidden?: boolean;
  customImage?: boolean;
  sourceUrl?: string; // Public reference for the demo product.
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryType = 'delivery' | 'pickup' | 'national_shipping';
export type PaymentMethod = 'qr' | 'cash' | 'transfer';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  city: string;
  address: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface FilterState {
  category: CategoryType;
  searchQuery: string;
  selectedOrigin: string;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  tagFilter: string;
}
