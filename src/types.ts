export interface Product {
  manualMarginZMW?: number;
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  colors: string[];
  accentColor: string;
  storages?: string[];
  conditions?: { name: string; price: number; description: string }[];
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedColor: string;
  selectedStorage?: string;
  selectedCondition?: { name: string; price: number; description: string };
  finalPrice?: number;
}

export interface Slide {
  id: number;
  titleLines: string[];
  accentText: string;
  specs: string;
  color: string;
  image: string;
}

export interface VariantConnectivity {
  name: string;
  conditions: VariantCondition[];
}

export interface VariantCondition {
  name: string;
  price: number;
  available?: boolean;
  description?: string;
}

export interface VariantStorage {
  name: string;
  connectivities?: VariantConnectivity[];
  conditions?: VariantCondition[];
}

export interface VariantColor {
  name: string;
  hex: string;
  image: string;
  images?: string[];
  storages: VariantStorage[];
}

export interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code: string;
  delivery_phone: string;
  delivery_country: string;
}

export interface Visit {
  id: string;
  created_at: string;
  page_path: string;
  visitor_id: string;
}

export interface SyncLogItem {
  name: string;
  brand: string;
  price: number;
  image: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  addedItems: SyncLogItem[];
  updatedItems: SyncLogItem[];
  deletedItems: { name: string; brand?: string; image?: string }[];
  errorMessage?: string;
}

export interface CompanyEarning {
  id: string;
  created_at: string;
  order_id?: string;
  product_name: string;
  gross_amount: number;
  net_profit: number;
  currency: string;
  notes?: string;
}
