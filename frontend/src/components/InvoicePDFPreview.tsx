import { PDFViewer } from "@react-pdf/renderer";

import { BusinessSettingsPayload } from "../services/businessServices";
import InvoicePDF from "./InvoicePDF";

const previewProducts = [
  {
    name: "Producto de ejemplo",
    quantity: 2,
    price: 15.0,
    discount: 0,
    subtotal: 30.0,
  },
];

const previewBusinessSettings: BusinessSettingsPayload = {
  description: "",
  name: "Mi Empresa",
  tagline: "Tu éxito, nuestro compromiso",
  phone: "123456789",
  email: "contacto@empresa.com",
  fiscal_address: "Calle Falsa 123",
  invoice_prefix: "INV",
  invoice_counter: 1,
  currency: "USD",
  tax_id: "123456789",
  legal_name: "Empresa S.A.",
  payment_terms_amount: 30,
  payment_terms_unit: "días",
  bank_details: "",
  tax_rates: "",
  timezone: "America/Panama",
  language: "es",
  date_format: "dd/mm/yyyy",
  number_format: "1,234.56",
};

export default function InvoicePDFPreview() {
  return (
    <PDFViewer width="100%" height={500}>
      <InvoicePDF
        saleDate={new Date().toISOString()}
        products={previewProducts}
        total={30}
        entrepreneurName={"Emprendedor(a) de Ejemplo"}
        businessSettings={previewBusinessSettings}
      />
    </PDFViewer>
  );
}
