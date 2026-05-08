/** @format */

// src/pages/Sales.tsx
import { useNavigate } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import DataTable from "../components/DataTable";
import { Column } from "../components/BaseTable";
import TableCard from "../components/TableCard";
import { useEffect, useRef, useState } from "react";
import { SaleFromAPI, SaleProduct } from "../types/saleTypes";
import { useToken } from "../hooks/useToken";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
import { createSale, fetchSales } from "../services/salesServices";
import Modal from "../components/Modal";
import { fetchProducts } from "../services/productServices";
import { computeSalesStats } from "../utils/computeStats";
import LoadingPulse from "../components/LoadingPulse";
import { getPanamaISOString } from "../utils/localeTimeZone";
import { toast } from "react-toastify";
import InvoicePDF from "../components/InvoicePDF";
import { pdf } from "@react-pdf/renderer";
import {
  BusinessSettingsPayload,
  getBusinessSettings,
} from "../services/businessServices";
import { ProductDetails } from "../hooks/useProductDetails";

export default function Sales() {
  const navigate = useNavigate();
  const { getTokenWithRetry } = useToken();
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    {
      sku: string;
      name: string;
      quantity: number;
      price: number;
      discount: number;
      subtotal: number;
    }[]
  >([]);
  const [selectedSku, setSelectedSku] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showCreateSale, setShowCreateSale] = useState(false);

  const [allSales, setAllSales] = useState<SaleFromAPI[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceBlob, setInvoiceBlob] = useState<Blob | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [_businessSettings, setBusinessSettings] =
    useState<BusinessSettingsPayload>();
  const [dynamicFilename, setDynamicFilename] = useState("factura.pdf");

  const handleCloseModal = () => {
    setShowCreateSale(false);
    setSelectedProducts([]);
    setSelectedSku("");
    setQuantity(1);
  };
  const { totalRevenue, totalOrders, averageValue, totalItems } =
    computeSalesStats(allSales);
  const stats = [
    { title: "Ingresos del mes", value: `$${totalRevenue.toFixed(2)}` },
    { title: "Órdenes procesadas", value: totalOrders.toString() },
    { title: "Valor medio", value: `$${averageValue.toFixed(2)}` },
    { title: "Artículos vendidos", value: totalItems.toString() },
  ];
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = await getTokenWithRetry();
        if (!token) return;
        const data = await getBusinessSettings(token);
        setBusinessSettings(data);
      } catch (err) {
        console.error("Error obteniendo settings del negocio:", err);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        const token = await getTokenWithRetry();
        if (!token) return;
        const rawSales = await fetchSales(token);

        setAllSales(rawSales);

        const products: SaleProduct[] = [];
        rawSales.forEach((sale) => {
          sale.sale_products.forEach((sp) => {
            products.push({
              ...sp,
              date: sale.sale_date,
            });
          });
        });

        setSalesByProduct(products);
      } catch (e) {
        console.error("Error loading sales", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getTokenWithRetry]);

  const hasFetchedRef = useRef(false);

  const salesColumns: Column<SaleFromAPI>[] = [
    { key: "invoice_id", header: "ID" },
    {
      key: "sale_date",
      header: "Fecha",
      render: (s) => new Date(s.sale_date).toLocaleDateString(),
    },
    {
      key: "total",
      header: "Total",
      render: (s) => `$${s.total.toFixed(2)}`,
    },
    {
      key: "id",
      header: "Acciones",
      render: (s) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate(`/sales/${s.id}`)}
        >
          Ver Detalle
        </button>
      ),
    },
  ];

  const salesByProductColumns: Column<SaleProduct>[] = [
    {
      key: "product_name",
      header: "Producto",
      render: (s) => s.product_name || "—",
    },
    { key: "product_id", header: "SKU" },
    {
      key: "quantity",
      header: "Cant.",
      render: (s) => s.quantity.toString(),
    },
    {
      key: "subtotal",
      header: "Ingresos",
      render: (s) => `$${s.subtotal.toFixed(2)}`,
    },
    {
      key: "date",
      header: "Fecha",
      render: (s) => new Date(s.date).toLocaleDateString(),
    },
  ];
  if (loading)
    return (
      <div className="h-svh flex items-center justify-center bg-neutral-900 text-white">
        <div className="w-48 text-white animate-pulse">
          <LoadingPulse />
        </div>
      </div>
    );

  return (
    <div className="space-y-6 text-gray-800 dark:text-neutral-200">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>
      <div className="flex justify-end">
        <button
          onClick={async () => {
            setShowCreateSale(true);
            try {
              const token = await getTokenWithRetry();
              if (!token) return;
              const data = await fetchProducts(token);
              setProducts(data);
            } catch (err) {
              console.error("Error cargando productos", err);
              toast.error("No se pudieron cargar los productos");
            }
          }}
          className="py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Registrar Venta
        </button>
      </div>

      {/* Tabla de ventas */}
      <TableCard>
        <DataTable title="Ventas" columns={salesColumns} data={allSales} />
      </TableCard>

      {/* Tabla de ventas por producto */}
      <TableCard>
        <DataTable
          title="Ventas por Producto"
          columns={salesByProductColumns}
          data={salesByProduct}
        />
      </TableCard>
      {showCreateSale && (
        <Modal onClose={handleCloseModal}>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-neutral-200">
            Registrar Venta
          </h2>

          {/* Selección de producto */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Producto
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.sku} | {p.name}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
              Descuento por unidad
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100"
            />

            <button
              onClick={() => {
                const product = products.find((p) => p.sku === selectedSku);
                if (!product || quantity <= 0) return;

                if (product.stock - quantity <= product.min_stock_alert) {
                  toast.warn(
                    ` El producto "${
                      product.name
                    }" esta quedando fuera de stock, : ${
                      product.stock - quantity
                    } disponibles (mínimo: ${product.min_stock_alert})`
                  );
                }

                const subtotal = (product.sale_price - discount) * quantity;
                setSelectedProducts((prev) => [
                  ...prev,
                  {
                    sku: product.sku,
                    name: product.name,
                    quantity,
                    price: product.sale_price,
                    discount: 0,
                    subtotal,
                  },
                ]);
                setSelectedSku("");
                setQuantity(1);
              }}
              className="mt-2 py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Agregar producto
            </button>
          </div>

          {/* Lista de productos seleccionados */}
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-gray-800 dark:text-neutral-200">
              Productos en esta venta:
            </h3>
            {selectedProducts.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm border-b border-gray-300 dark:border-neutral-600 py-1 text-gray-700 dark:text-neutral-100"
              >
                <span>
                  {p.name} (x{p.quantity})
                </span>
                <div className="flex items-center gap-3">
                  <span>${p.subtotal.toFixed(2)}</span>
                  <button
                    onClick={() =>
                      setSelectedProducts((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-red-600 hover:underline text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total y botones */}
          <div className="mt-4 flex justify-between items-center text-gray-800 dark:text-neutral-200">
            <strong>Total:</strong>
            <span>
              $
              {selectedProducts
                .reduce((acc, p) => acc + p.subtotal, 0)
                .toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const token = await getTokenWithRetry();
                  if (!token) return;

                  await createSale(
                    {
                      sale_date: getPanamaISOString(),
                      products: selectedProducts.map((p) => ({
                        product_id: p.sku,
                        quantity: p.quantity,
                        discount: p.discount,
                        subtotal: p.subtotal,
                      })),
                    },
                    token
                  );

                  const updatedSettings = await getBusinessSettings(token);
                  setBusinessSettings(updatedSettings);
                  const blob = await pdf(
                    <InvoicePDF
                      saleDate={getPanamaISOString()}
                      products={selectedProducts}
                      total={selectedProducts.reduce(
                        (acc, p) => acc + p.subtotal,
                        0
                      )}
                      businessSettings={updatedSettings}
                    />
                  ).toBlob();

                  setInvoiceBlob(blob);
                  setShowInvoiceModal(true);

                  // 2) Refrescar sólo los datos
                  const rawSales = await fetchSales(token);
                  setAllSales(rawSales);

                  const latestSale = rawSales.length
                    ? rawSales.reduce((a, b) =>
                        new Date(a.sale_date) > new Date(b.sale_date) ? a : b
                      )
                    : null;

                  const formattedDate = latestSale
                    ? new Date(latestSale.sale_date)
                        .toISOString()
                        .slice(0, 10)
                        .replace(/-/g, "")
                    : "";

                  const filename = latestSale
                    ? `factura_${
                        latestSale.invoice_id || latestSale.id
                      }_${formattedDate}.pdf`
                    : "factura.pdf";

                  setDynamicFilename(filename);

                  // 3) Reconstruir ventas por producto
                  const flat: SaleProduct[] = [];
                  rawSales.forEach((sale) =>
                    sale.sale_products.forEach((sp) =>
                      flat.push({ ...sp, date: sale.sale_date })
                    )
                  );
                  setSalesByProduct(flat);

                  toast.success("Venta registrada correctamente");
                  handleCloseModal();
                } catch (err: any) {
                  toast.error("Error registrando la venta");
                  selectedProducts.forEach((p) => {
                    const fullProduct = products.find(
                      (prod) => prod.sku === p.sku
                    );
                    if (fullProduct && fullProduct.stock <= 0) {
                      toast.error(
                        `No hay stock disponible para "${p.name}" (SKU: ${p.sku})`
                      );
                    }
                  });
                }
              }}
              className="py-1 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Guardar Venta
            </button>
          </div>
        </Modal>
      )}
      {showInvoiceModal && invoiceBlob && (
        <Modal onClose={() => setShowInvoiceModal(false)}>
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-neutral-200">
            ¿Desea descargar la factura?
          </h2>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setShowInvoiceModal(false)}
            >
              No
            </button>
            <a
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              href={URL.createObjectURL(invoiceBlob)}
              download={dynamicFilename}
              onClick={() => setShowInvoiceModal(false)}
            >
              Sí, descargar
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}
