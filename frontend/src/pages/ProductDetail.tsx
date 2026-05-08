/** @format */

// src/pages/ProductPage.tsx
// src/pages/ProductDetail.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToken } from "../hooks/useToken";
import { toast } from "react-toastify";

import { Pencil } from "lucide-react";
import {
  createProductForUser,
  fetchProductBySku,
  updateProductBySku,
  uploadProductImage,
} from "../services/productServices";
import { ProductDetails } from "../hooks/useProductDetails";
import LoadingPulse from "../components/LoadingPulse";
import ConfirmationModal from "../components/ConfirmationModal";
import { useSecurity } from "../contexts/SecurityContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { checkAll } = useSecurity();

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<ProductDetails>({
    mode: "onChange",
    defaultValues: {} as ProductDetails,
  });

  const [editingName, setEditingName] = useState(isNew);
  const [nameValue, setNameValue] = useState("");
  const [skuValue, setSkuValue] = useState("");
  const { getTokenWithRetry } = useToken();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [showSkuConfirmModal, setShowSkuConfirmModal] = useState(false);
  const [pendingSkuValue, setPendingSkuValue] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (!isNew && id && !hasFetchedRef.current) {
        hasFetchedRef.current = true;

        try {
          const token = await getTokenWithRetry();
          if (!token) return;
          const product: ProductDetails = await fetchProductBySku(id, token);

          setProduct(product); // ✅ usar solo esto
          setNameValue(product.name);
          setSkuValue(product.sku);
          reset(product); // ✅ cargar datos en el formulario
          // Asegura que la imagen previa se sincroniza correctamente
          setPreviewUrl(product.imageUrl || undefined);
        } catch (e) {
          console.error("❌ Error cargando producto", e);
        } finally {
          setLoading(false);
        }
      } else if (isNew && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        reset({
          sku: "",
          name: "",
          description: "",
          type: "",
          cost: 0,
          sale_price: 0,
          stock: 0,
          discount: 0,
          supplier: "",
          status: "active",
          color: "",
          width: 0,
          height: 0,
          depth: 0,
          weight: 0,
          tax_rate: 0,
          created_at: "",
          updated_at: "",
          rating: 0,
          imageUrl: "", // ✅ opcional si quieres mantener consistencia
        });
        setEditingName(true);
        setNameValue("");
        setSkuValue("");
        setPreviewUrl(undefined);
        setLoading(false);
      }
    };

    load();
  }, [id, isNew, getTokenWithRetry, reset]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
        setSelectedFile(file);
      }
    },
    []
  );

  const onSubmit = async (data: ProductDetails) => {
    try {
      const token = await getTokenWithRetry();
      if (!token) return;
      let finalSku = skuValue;
      if (isNew) {
        toast.info("Guardando producto...");
        await createProductForUser(token, {
          sku: data.sku,
          name: data.name,
          type: data.type,
          cost: data.cost,
          sale_price: data.sale_price,
          stock: data.stock,
          min_stock_alert: data.min_stock_alert,
        });
        finalSku = data.sku;
      } else {
        await updateProductBySku(skuValue, token, {
          name: data.name,
          type: data.type,
          cost: data.cost,
          sale_price: data.sale_price,
          stock: data.stock,
          min_stock_alert: data.min_stock_alert,
        });
      }

      // Subir imagen si hay archivo seleccionado
      if (selectedFile) {
        await uploadProductImage(finalSku, token, selectedFile);
      }

      // Refresca el producto para obtener la nueva imagen
      const updatedProduct = await fetchProductBySku(finalSku, token);
      setProduct(updatedProduct);
      setPreviewUrl(updatedProduct.imageUrl);

      toast.success(
        isNew
          ? "Producto creado correctamente"
          : "Producto actualizado correctamente"
      );
      navigate("/products");
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error al guardar el producto");
    }
  };

  // Sincroniza previewUrl con la imagen del producto cuando cambia el producto
  useEffect(() => {
    // Mostrar la imagen guardada en la base de datos al editar, a menos que el usuario seleccione una nueva
    if (product && (!selectedFile || previewUrl === undefined)) {
      if (
        product.imageUrl &&
        typeof product.imageUrl === "string" &&
        product.imageUrl.trim() !== ""
      ) {
        setPreviewUrl(product.imageUrl);
      } else {
        setPreviewUrl(undefined);
      }
    }
  }, [product, selectedFile, previewUrl]);

  if (loading) {
    return (
      <div className="h-svh flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-48 text-white animate-pulse">
          <LoadingPulse />
        </div>
      </div>
    );
  }
  if (!isNew && !skuValue) return <p>Producto no encontrado</p>;

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-neutral-800 p-6 rounded-xl shadow">
      <button
        onClick={() => navigate("/products")}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
      >
        ← Volver
      </button>

      {/* Nombre con lápiz */}
      <div className="flex items-center mb-6">
        {editingName ? (
          <input
            {...register("name", { required: true })}
            value={nameValue}
            onChange={(e) => {
              checkAll(e.target.value);
              setNameValue(e.target.value);
            }}
            onBlur={() => {
              setEditingName(false);
              setValue("name", nameValue, { shouldValidate: true });
            }}
            placeholder="Nombre del producto"
            className="text-3xl font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-300 focus:outline-none"
          />

        ) : (
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mr-2">
            {nameValue}
          </h1>
        )}
        {!editingName && (
          <span
            onClick={() => setEditingName(true)}
            className="cursor-pointer text-gray-500 dark:text-gray-200 dark:hover:text-gray-400"
          >
            <Pencil />
          </span>
        )}
        <span className="text-red-500">*</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagen principal y upload */}
          <div className="space-y-4">
            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-neutral-700 flex items-center justify-center min-h-48">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={nameValue}
                  className="w-full object-cover"
                />
              ) : (
                <span className="text-gray-400 dark:text-gray-500 py-12">
                  No hay imagen
                </span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="upload-image"
              />
              <label
                htmlFor="upload-image"
                className="py-2 px-4 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Cambiar imagen
              </label>
            </div>
          </div>

          {/* Info segments */}
          <div className="lg:col-span-2 space-y-6">
            {/* SKU y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("sku", { required: true })}
                  value={skuValue}
                  onChange={(e) => {
                    checkAll(e.target.value);
                    setSkuValue(e.target.value);
                  }}
                  onBlur={() => {
                    const original = product?.sku || "";
                    const isEditing = !isNew;
                    if (skuValue !== original && isEditing) {
                      setPendingSkuValue(skuValue);
                      setShowSkuConfirmModal(true);
                    } else {
                      setValue("sku", skuValue, { shouldValidate: true });
                    }
                  }}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Estado
                </label>
                <select
                  {...register("status")}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                >
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={4}
                onChange={(e) => checkAll(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />

            </div>

            {/* Precios e inventario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Precio <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1.00"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Coste
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("cost", { valueAsNumber: true })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Descuento %
                </label>
                <input
                  type="number"
                  {...register("discount", { valueAsNumber: true })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("stock", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Alerta mínimo
                </label>
                <input
                  type="number"
                  {...register("min_stock_alert", { valueAsNumber: true })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
            </div>

            {/* Dimensiones, peso, impuestos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Dimensiones (cm)
                </label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="number"
                    placeholder="Ancho"
                    {...register("width", { valueAsNumber: true })}
                    onChange={(e) => checkAll(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Alto"
                    {...register("height", { valueAsNumber: true })}
                    onChange={(e) => checkAll(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Prof."
                    {...register("depth", { valueAsNumber: true })}
                    onChange={(e) => checkAll(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("weight", { valueAsNumber: true })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Impuesto (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("tax_rate", { valueAsNumber: true })}
                  onChange={(e) => checkAll(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
            </div>

            {/* Botones finales */}
            <div className="pt-6 border-t border-gray-200 dark:border-neutral-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="py-2 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </form>
      {showSkuConfirmModal && pendingSkuValue !== null && (
        <ConfirmationModal
          message={`¿Seguro que deseas cambiar el SKU de "${product?.sku}" a "${pendingSkuValue}"?`}
          onCancel={() => {
            setSkuValue(product?.sku || "");
            setPendingSkuValue(null);
            setShowSkuConfirmModal(false);
          }}
          onConfirm={() => {
            setValue("sku", pendingSkuValue);
            setPendingSkuValue(null);
            setShowSkuConfirmModal(false);
          }}
        />
      )}
    </div>
  );
}
