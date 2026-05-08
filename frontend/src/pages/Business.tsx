/** @format */

// src/pages/BusinessSettings.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../components/Modal";
import { useToken } from "../hooks/useToken";
import {
  getBusinessFinances,
  getBusinessProducts,
  getBusinessSales,
  getBusinessSettings,
  updateBusinessSettings,
} from "../services/businessServices";
import { toast } from "react-toastify";
import InvoicePDFPreview from "../components/InvoicePDFPreview";
import { generateDummyData } from "../services/dummyDataServices";
import { useSecurity } from "../contexts/SecurityContext";
import { useUserContext } from "../contexts/UserContext";
import JSZip from "jszip";

// Utilidad para convertir objeto a CSV
function objectToCSV(data: Record<string, any>): string {
  if (!Array.isArray(data)) data = [data];
  const keys = Object.keys(data[0] || {});
  const rows = data.map((row: any) =>
    keys.map((k) => `"${row[k] ?? ""}"`).join(",")
  );
  return `${keys.join(",")}\n${rows.join("\n")}`;
}

type BusinessForm = {
  // 1. Identidad Básica
  name: string;
  tagline: string;
  logo: FileList;

  // 2. Datos Fiscales
  legalName: string;
  taxId: string;
  fiscalAddress: string;
  phone: string;
  email: string;

  // 3. Configuración de Facturación
  currency: string;
  invoicePrefix: string;
  invoiceCounter: number;
  paymentTermsAmount: number;
  paymentTermsUnit: string;
  bankDetails: string;
  taxRates: string; // e.g. "IVA:21%, IGV:18%"

  // 4. Ajustes Avanzados
  timezone: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
};

const fieldLimits: Record<string, { min: number; max: number }> = {
  products: { min: 0, max: 100 },
  sales: { min: 0, max: 200 },
  finances: { min: 0, max: 100 },
  budgets: { min: 0, max: 20 },
};

export default function BusinessSettings() {
  const { checkAll } = useSecurity();
  const { refetchUserData } = useUserContext();
  const { getTokenWithRetry } = useToken();
  const hasFetchedSettings = React.useRef(false);
  const { register, handleSubmit, watch, formState, reset } =
    useForm<BusinessForm>({
      defaultValues: {
        currency: "USD",
        invoicePrefix: "",
        invoiceCounter: 1,
        paymentTermsAmount: 30,
        paymentTermsUnit: "días",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: "es",
        dateFormat: "dd/mm/aaaa",
        numberFormat: "1.234,56",
      },
    });
  const [showPreview, setShowPreview] = React.useState(false);
  const [showDummyModal, setShowDummyModal] = React.useState(false);
  const [dummyParams, setDummyParams] = React.useState({
    products: 0,
    sales: 0,
    finances: 0,
    budgets: 0,
  });
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showDownloadModal, setShowDownloadModal] = React.useState(false);
  const [downloadSelections, setDownloadSelections] = React.useState({
    finances: false,
    products: false,
    sales: false,
  });
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Simulación de funciones para obtener data de cada sección
  async function getFinancesData(token: string) {
    const data = await getBusinessFinances(token);
    return Array.isArray(data) ? data : [];
  }
  async function getProductsData(token: string) {
    const data = await getBusinessProducts(token);
    return Array.isArray(data) ? data : [];
  }
  async function getSalesData(token: string) {
    const data = await getBusinessSales(token);
    return Array.isArray(data) ? data : [];
  }

  const handleDownloadCSV = async () => {
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = async () => {
    setIsDownloading(true);
    try {
      const token = await getTokenWithRetry();
      if (!token) return;

      const selected = Object.entries(downloadSelections)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      if (selected.length === 0) {
        toast.error("Selecciona al menos una opción.");
        setIsDownloading(false);
        return;
      }

      if (selected.length === 1) {
        const key = selected[0];
        const fetchers: Record<string, (token: string) => Promise<any[]>> = {
          finances: getFinancesData,
          products: getProductsData,
          sales: getSalesData,
        };
        const filenames: Record<string, string> = {
          finances: "finanzas.csv",
          products: "productos.csv",
          sales: "ventas.csv",
        };
        const data = await fetchers[key](token);
        const csv = objectToCSV(data);
        const filename = filenames[key];
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Descargar ZIP con los CSV seleccionados
        const zip = new JSZip();
        const fetchers: Record<string, (token: string) => Promise<any[]>> = {
          finances: getFinancesData,
          products: getProductsData,
          sales: getSalesData,
        };
        const filenames: Record<string, string> = {
          finances: "finanzas.csv",
          products: "productos.csv",
          sales: "ventas.csv",
        };
        for (const key of selected) {
          const data = await fetchers[key](token);
          zip.file(filenames[key], objectToCSV(data));
        }
        // Generar nombre con fecha y hora
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
          now.getDate()
        )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        const zipName = `business_info_${dateStr}.zip`;

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setShowDownloadModal(false);
    } catch (err) {
      toast.error("No se pudo descargar la data.");
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const onSubmit = async (data: BusinessForm) => {
    try {
      const token = await getTokenWithRetry();
      if (!token) return;

      const payload = {
        name: data.name,
        description: data.tagline,
        tagline: data.tagline,
        legal_name: data.legalName,
        tax_id: data.taxId,
        fiscal_address: data.fiscalAddress,
        phone: data.phone,
        email: data.email,
        currency: data.currency,
        invoice_prefix: data.invoicePrefix,
        invoice_counter: data.invoiceCounter,
        payment_terms_amount: data.paymentTermsAmount,
        payment_terms_unit: data.paymentTermsUnit,
        bank_details: data.bankDetails,
        tax_rates: data.taxRates,
        timezone: data.timezone,
        language: data.language,
        date_format: data.dateFormat,
        number_format: data.numberFormat,
      };

      await updateBusinessSettings(payload, token);
      toast.success("Configuración guardada con éxito.");
      await refetchUserData();
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al guardar los cambios");
    }
  };

  const logoFiles = watch("logo");

  useEffect(() => {
    const fetchSettings = async () => {
      if (hasFetchedSettings.current) return;
      hasFetchedSettings.current = true;
      try {
        const token = await getTokenWithRetry();
        if (!token) return;

        const businessSettings = await getBusinessSettings(token);

        reset({
          name: businessSettings.name || "",
          tagline: businessSettings.tagline || "",
          legalName: businessSettings.legal_name || "",
          taxId: businessSettings.tax_id || "",
          fiscalAddress: businessSettings.fiscal_address || "",
          phone: businessSettings.phone || "",
          email: businessSettings.email || "",
          currency: businessSettings.currency || "USD",
          invoicePrefix: businessSettings.invoice_prefix || "",
          invoiceCounter: businessSettings.invoice_counter || 1,
          paymentTermsAmount: businessSettings.payment_terms_amount || 30,
          paymentTermsUnit: businessSettings.payment_terms_unit || "días",
          bankDetails: businessSettings.bank_details || "",
          taxRates: businessSettings.tax_rates || "",
          timezone:
            businessSettings.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: businessSettings.language || "es",
          dateFormat: businessSettings.date_format || "dd/mm/aaaa",
          numberFormat: businessSettings.number_format || "1.234,56",
          logo: undefined,
        });
      } catch (err) {
        console.error("Error al cargar configuración del negocio:", err);
        toast.error("No se pudo cargar la configuración del negocio.");
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white dark:bg-neutral-800 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Configuración de Mi Emprendimiento
      </h1>

      <button
        onClick={() => setShowDummyModal(true)}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
      >
        Generar datos de prueba
      </button>
      {/* Botón para descargar CSV/ZIP */}
      <button
        onClick={handleDownloadCSV}
        className="ml-2 px-4 py-2 rounded bg-green-200 dark:bg-green-700 hover:bg-green-300 dark:hover:bg-green-600 transition"
      >
        Descargar datos (.csv/.zip)
      </button>

      {/* Modal de selección de descarga */}
      {showDownloadModal && (
        <Modal onClose={() => setShowDownloadModal(false)}>
          <h2 className="text-xl font-bold mb-4">
            Selecciona la data a descargar
          </h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmDownload();
            }}
          >
            <div className="flex flex-col gap-2">
              <label>
                <input
                  type="checkbox"
                  checked={downloadSelections.finances}
                  onChange={(e) =>
                    setDownloadSelections((prev) => ({
                      ...prev,
                      finances: e.target.checked,
                    }))
                  }
                  disabled={isDownloading}
                />{" "}
                Finanzas
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={downloadSelections.products}
                  onChange={(e) =>
                    setDownloadSelections((prev) => ({
                      ...prev,
                      products: e.target.checked,
                    }))
                  }
                  disabled={isDownloading}
                />{" "}
                Productos
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={downloadSelections.sales}
                  onChange={(e) =>
                    setDownloadSelections((prev) => ({
                      ...prev,
                      sales: e.target.checked,
                    }))
                  }
                  disabled={isDownloading}
                />{" "}
                Ventas
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-neutral-600">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                disabled={isDownloading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isDownloading}
              >
                {isDownloading ? "Descargando…" : "Descargar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Identidad Básica */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre
            </label>
            <input
              {...register("name", { required: true })}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tagline
            </label>
            <input
              {...register("tagline")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Logo
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("logo")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0 file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {logoFiles && logoFiles.length > 0 && (
              <img
                src={URL.createObjectURL(logoFiles[0])}
                alt="Logo preview"
                className="mt-2 h-20 object-contain"
              />
            )}
          </div>
        </section>

        {/* 2. Datos Fiscales */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Razón Social
            </label>
            <input
              {...register("legalName")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              NIF / CIF / RUC
            </label>
            <input
              {...register("taxId")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dirección Fiscal
            </label>
            <input
              {...register("fiscalAddress")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Teléfono
            </label>
            <input
              {...register("phone")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
        </section>

        {/* 3. Configuración de Facturación */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Moneda predeterminada
            </label>
            <select
              {...register("currency")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="PAB">PAB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="PEN">PEN</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prefijo de factura
            </label>
            <input
              placeholder="e.g. INV-"
              {...register("invoicePrefix")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contador inicial
            </label>
            <input
              type="number"
              {...register("invoiceCounter", { valueAsNumber: true })}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Términos de pago
            </label>
            <div className="flex gap-2">
              <div>
                <input
                  placeholder="Cantidad"
                  type="number"
                  {...register("paymentTermsAmount", { valueAsNumber: true })}
                  onChange={(e) => {
                    checkAll(e.target.value);
                  }}
                  className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
              <div>
                <select
                  {...register("paymentTermsUnit")}
                  onChange={(e) => {
                    checkAll(e.target.value);
                  }}
                  className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                >
                  <option value="días">Días</option>
                  <option value="semanas">Semanas</option>
                  <option value="meses">Meses</option>
                </select>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Datos bancarios
            </label>
            <textarea
              {...register("bankDetails")}
              rows={2}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Impuestos aplicables
            </label>
            <input
              {...register("taxRates")}
              placeholder="e.g. IVA:21%, IGV:18%"
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="mt-2 text-blue-600 hover:underline text-sm"
          >
            ▶ Ver preview de factura
          </button>
        </section>

        {/* 4. Ajustes Avanzados */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zona horaria
            </label>
            <input
              {...register("timezone")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Idioma
            </label>
            <select
              {...register("language")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Formato de fecha
            </label>
            <input
              {...register("dateFormat")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Formato de número
            </label>
            <input
              {...register("numberFormat")}
              onChange={(e) => {
                checkAll(e.target.value);
              }}
              className="mt-1 block w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
          </div>
        </section>

        {/* Botones */}
        <div className="pt-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              /* reset o navigate */
            }}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Modal de preview de factura */}
      {showPreview && (
        <Modal onClose={() => setShowPreview(false)}>
          <InvoicePDFPreview />
        </Modal>
      )}
      {showDummyModal && (
        <Modal onClose={() => setShowDummyModal(false)}>
          <h2 className="text-xl font-bold mb-4">Generar datos de prueba</h2>
          {isGenerating && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsGenerating(true);
              try {
                const token = await getTokenWithRetry();
                if (!token) return;
                await generateDummyData(token, dummyParams);
                toast.success("Datos dummy generados correctamente");
                setShowDummyModal(false);
              } catch (err) {
                console.error(err);
                toast.error("Error generando los datos dummy");
              } finally {
                setIsGenerating(false);
              }
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Productos", field: "products" },
                { label: "Ventas", field: "sales" },
                { label: "Finanzas", field: "finances" },
                { label: "Presupuesto", field: "budgets" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {label}
                  </label>
                  <input
                    type="number"
                    disabled={isGenerating}
                    min={fieldLimits[field].min}
                    max={fieldLimits[field].max}
                    value={dummyParams[field as keyof typeof dummyParams]}
                    onChange={(e) => {
                      checkAll(e.target.value);
                      setDummyParams((prev) => ({
                        ...prev,
                        [field]: parseInt(e.target.value),
                      }));
                    }}
                    className="mt-1 w-full border-gray-300 rounded p-2 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-neutral-600">
              <button
                type="button"
                onClick={() => setShowDummyModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Generar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
