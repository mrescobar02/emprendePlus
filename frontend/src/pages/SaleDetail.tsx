/** @format */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToken } from "../hooks/useToken";

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
import { fetchSaleById } from "../services/salesServices";
import { DetailedSale } from "../types/saleTypes";
import TableCard from "../components/TableCard";
import DataTable from "../components/DataTable";
import { Column } from "../components/BaseTable";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "../components/InvoicePDF";
import { BusinessSettingsPayload } from "../services/businessServices";
import { getBusinessSettings } from "../services/businessServices";

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTokenWithRetry } = useToken();
  const [sale, setSale] = useState<DetailedSale | null>(null);
  const [businessSettings, setBusinessSettings] =
    useState<BusinessSettingsPayload | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const token = await getTokenWithRetry();
        if (!token) return;

        const [saleData, settingsData] = await Promise.all([
          fetchSaleById(id, token),
          getBusinessSettings(token),
        ]);

        setSale(saleData);
        setBusinessSettings(settingsData);
      } catch (e) {
        console.error("Error loading sale or business settings", e);
      }
    };

    load();
  }, [id, getTokenWithRetry]);

  const productColumns: Column<DetailedSale["products"][number]>[] = [
    {
      key: "name",
      header: "Producto",
    },
    {
      key: "sku",
      header: "SKU",
    },
    {
      key: "quantity",
      header: "Cantidad",
      render: (p) => p.quantity.toString(),
    },
    {
      key: "price",
      header: "Precio Unitario",
      render: (p) => `$${p.price.toFixed(2)}`,
    },
    {
      key: "discount",
      header: "Descuento",
      render: (p) =>
        p.discount !== undefined && p.discount > 0
          ? `${(p.discount * 100).toFixed(0)}%`
          : "—",
    },
    {
      key: "subtotal",
      header: "Subtotal",
      render: (p) => `$${p.subtotal.toFixed(2)}`,
    },
  ];

  if (!sale) {
    return <p className="text-center text-gray-500">Cargando venta...</p>;
  }
  const formattedDate = sale
    ? new Date(sale.sale_date).toISOString().slice(0, 10).replace(/-/g, "")
    : "";

  const dynamicFilename = sale
    ? `factura_${sale.invoice_id}_${formattedDate}.pdf`
    : "factura.pdf";
  return (
    <div className="space-y-6 text-gray-800 dark:text-neutral-200">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">Venta {sale.invoice_id}</h1>
          {sale && businessSettings && (
            <PDFDownloadLink
              document={
                <InvoicePDF
                  saleDate={sale.sale_date}
                  products={sale.products.map((p) => ({
                    name: p.name,
                    quantity: p.quantity,
                    price: p.price,
                    discount: p.discount ?? 0,
                    subtotal: p.subtotal,
                  }))}
                  total={sale.total}
                  entrepreneurName={businessSettings?.legal_name}
                  businessSettings={businessSettings}
                />
              }
              fileName={dynamicFilename}
              className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
            >
              {({ loading }) =>
                loading ? "Generando..." : "Descargar factura"
              }
            </PDFDownloadLink>
          )}
        </div>

        <button
          onClick={() => navigate("/sales")}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
        >
          ← Volver a Ventas
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <strong>Fecha:</strong>{" "}
          {new Date(sale.sale_date).toLocaleDateString()}
        </div>
        <div>
          <strong>Total:</strong> ${sale.total.toFixed(2)}
        </div>
      </div>

      <TableCard>
        <DataTable
          title="Productos Vendidos"
          columns={productColumns}
          data={sale.products}
        />
      </TableCard>
    </div>
  );
}
