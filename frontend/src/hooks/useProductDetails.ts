import { useEffect, useState } from "react";
import { useToken } from "./useToken";
import { Product } from "../components/ProductCard";
import { fetchProductBySku } from "../services/productServices";

export type ProductDetails = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
  sale_price: number;
  cost: number;
  discount?: number;
  stock: number;
  min_stock_alert: number;
  supplier: string;
  status: "active" | "draft" | "archived";
  color: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  tax_rate: number;
  created_at: string;
  updated_at: string;
  rating?: number;
  imageUrl?: string;
};


export function useProductDetails(sku: string) {
  const { getTokenWithRetry } = useToken();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getTokenWithRetry();
        if (!token) return;
        const result = await fetchProductBySku(sku, token);
        setProduct(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (sku) load();
  }, [sku]);

  return { product, loading };
}