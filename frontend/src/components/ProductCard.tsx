/** @format */

// src/components/ProductCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export interface Product {
  sku: string;
  name: string;
  sale_price: number;
  stock: number;
  imageUrl?: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow p-4 flex flex-col">
      <img
        src={product.imageUrl || "https://via.placeholder.com/300"}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md mb-2"
      />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-500">${product.sale_price.toFixed(2)}</p>
      <button
        onClick={() => navigate(`/products/${product.sku}`)}
        className="mt-4 text-blue-600 hover:underline self-start"
      >
        Editar
      </button>
    </div>
  );
};

export default ProductCard;
