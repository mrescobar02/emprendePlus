/** @format */

// src/pages/ProductView.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { Column } from "../components/BaseTable";
import ProductCard, { Product } from "../components/ProductCard";
import ViewToggleButton from "./ViewToggleButton";
import { GalleryHorizontalEnd, List } from "lucide-react";
import TableCard from "../components/TableCard";
import { deleteProductBySku, fetchProducts } from "../services/productServices";
import { useToken } from "../hooks/useToken";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
import LoadingPulse from "../components/LoadingPulse";
import { toast } from "react-toastify";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Products() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();

  const { getTokenWithRetry } = useToken();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const calledRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (calledRef.current) return;
      calledRef.current = true;

      try {
        const token = await getTokenWithRetry();
        if (!token) return;
        const data = await fetchProducts(token);
        setProducts(data);
      } catch (e) {
        console.error("Error loading products", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getTokenWithRetry]);

  if (loading)
    return (
      <div className="h-svh flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-48 text-white animate-pulse">
          <LoadingPulse />
        </div>
      </div>
    );

  // Columnas para la vista de listado
  const columns: Column<Product>[] = [
    { key: "name", header: "Nombre" },
    {
      key: "sale_price",
      header: "Precio",
      render: (p) => `$${p.sale_price.toFixed(2)}`,
    },
    {
      key: "stock",
      header: "Inventario",
      render: (p) => p.stock || 0,
    },
    {
      key: "sku",
      header: "Acciones",
      render: (p) => (
        <div className="flex space-x-3">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => navigate(`/products/${p.sku}`)}
          >
            Editar
          </button>
          <button
            className="text-red-600 hover:underline"
            onClick={() => {
              setProductToDelete(p);
              setShowConfirmModal(true);
            }}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-gray-800 dark:text-neutral-200">
      {/* Header con toggle y botón de “Nuevo” */}
      <div className="flex justify-end items-center ">
        <div className="flex items-center gap-3">
          <ViewToggleButton
            viewType="list"
            label="Lista"
            currentView={viewMode}
            onClick={() => setViewMode("list")}
            icon={<List size={20} />}
          />
          <ViewToggleButton
            viewType="grid"
            label="Galería"
            currentView={viewMode}
            onClick={() => setViewMode("grid")}
            icon={<GalleryHorizontalEnd size={20} />}
          />
        </div>
      </div>

      {/* Contenido según vista */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.sku} product={p} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <TableCard>
            <DataTable
              title="Productos"
              toolbar={
                <button
                  onClick={() => navigate("/products/new")}
                  className="py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Nuevo Producto
                </button>
              }
              columns={columns}
              data={products}
            />
          </TableCard>
        </div>
      )}
      {showConfirmModal && productToDelete && (
        <ConfirmationModal
          type="negative"
          message={`¿Eliminar producto "${productToDelete.name}"?`}
          onCancel={() => {
            setShowConfirmModal(false);
            setProductToDelete(null);
          }}
          onConfirm={async () => {
            try {
              const token = await getTokenWithRetry();
              if (!token) return;
              await deleteProductBySku(productToDelete.sku, token);
              setProducts((prev) =>
                prev.filter((prod) => prod.sku !== productToDelete.sku)
              );
              toast.success("Producto eliminado");
            } catch (err) {
              console.error("Error deleting product", err);
              toast.error("Error eliminando el producto");
            } finally {
              setShowConfirmModal(false);
              setProductToDelete(null);
            }
          }}
        />
      )}
    </div>
  );
}
