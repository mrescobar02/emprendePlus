// src/services/productService.ts
import { ProductDetails } from "../hooks/useProductDetails";

export async function fetchProducts(token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error fetching products");
  }

  return await res.json();
}

export async function fetchProductBySku(sku: string, token: string): Promise<ProductDetails> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${encodeURIComponent(sku)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("No se pudo obtener el producto");
  return await res.json();
}

export async function deleteProductBySku(sku: string, token: string): Promise<void> {
  const API_URL = import.meta.env.VITE_API_URL;
  const response = await fetch(`${API_URL}/api/products/${sku}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Error deleting product");
  }
}

export async function createProductForUser(token: string, data: Partial<ProductDetails>) {
  const API_URL = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API_URL}/api/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al crear producto: ${error}`);
  }

  return await res.json();
}

export async function updateProductBySku(sku: string, token: string, data: Partial<ProductDetails>) {
  const API_URL = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(sku)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al actualizar producto: ${error}`);
  }

  return await res.json();
}

export async function uploadProductImage(sku: string, token: string, file: File) {
  const API_URL = import.meta.env.VITE_API_URL;
  const formData = new FormData();
  formData.append("sku", sku);
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/products/upload-image/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al subir imagen: ${error}`);
  }

  return await res.json();
}