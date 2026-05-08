export type SaleProduct = {
  product_id: string;
  quantity: number;
  subtotal: number;
  discount?: number;
  product_name?: string;
  sale_price?: number;
  date: string;
};

export type SaleFromAPI = {
  id: string;
  sale_date: string;
  invoice_id: string
  total: number;
  sale_products: SaleProduct[];
};

export type DetailedSaleProduct = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount?: number;
};


export type DetailedSale = {
  sale_id: string;
  invoice_id:string;
  sale_date: string;
  total: number;
  products: DetailedSaleProduct[];
};

export type CreateSaleInput = {
  sale_date: string;
  products: {
    product_id: string;
    quantity: number;
    subtotal: number;
    discount?: number;
  }[];
};