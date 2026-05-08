/** @format */

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { BusinessSettingsPayload } from "../services/businessServices";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#000", 
    justifyContent: "center",
    alignItems: "center",
  },
  titleBlock: {
    flexDirection: "column",
    gap: 4,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  invoiceMeta: {
    marginTop: 4,
  },
  clientInfo: {
    marginBottom: 20,
  },
  clientName: {
    fontWeight: "bold",
    fontSize: 12,
  },
  table: {
    flexDirection: "column",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  cell: {
    flex: 1,
  },
  totals: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  thankYou: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
  },
    contactInfo: {
    marginTop: 10,
    fontSize: 10,
    textAlign: "left",
    color: "#555",
    lineHeight: 1.4,
  },

});

type Props = {
  saleDate: string;
  products: {
    name: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
  }[];
  total: number;
  entrepreneurName?: string;
  businessSettings: BusinessSettingsPayload | undefined | null;
};

export default function InvoicePDF({
  saleDate,
  products,
  total,
  entrepreneurName,
  businessSettings,
}: Props) {
  return (
    <Document>
      <Page style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceMeta}>
              Factura {`${businessSettings?.invoice_prefix}${businessSettings?.invoice_counter?.toString().padStart(4, "0")}`}
            </Text>
            <Text style={styles.invoiceMeta}>
              Fecha: {new Date(saleDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.logoPlaceholder}>
            <Text style={{ fontSize: 8, color: "#888" }}>LOGO AQUÍ</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL CLIENTE */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{entrepreneurName}</Text>
          <Text>{businessSettings?.name}</Text>
        </View>

        {/* TABLA DE PRODUCTOS */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>Artículo</Text>
            <Text style={styles.cell}>Cantidad</Text>
            <Text style={styles.cell}>Precio</Text>
            <Text style={styles.cell}>Descuento</Text>
            <Text style={styles.cell}>Total</Text>
          </View>
          {products.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.cell}>{p.name}</Text>
              <Text style={styles.cell}>{p.quantity}</Text>
              <Text style={styles.cell}>${p.price.toFixed(2)}</Text>
              <Text style={styles.cell}>${p.discount.toFixed(2)}</Text>
              <Text style={styles.cell}>${p.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* TOTALES */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Impuestos (0%):</Text>
            <Text>$0.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontSize: 13 }]}>Total:</Text>
            <Text style={{ fontSize: 13 }}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* MENSAJE FINAL */}
        <View style={{ marginTop: 30 }}>
          <Text style={[styles.thankYou, { textAlign: "left" }]}>
            ¡Gracias por su compra!
          </Text>

          <View style={styles.contactInfo}>
            {businessSettings?.phone && (
              <Text>Teléfono: {businessSettings.phone}</Text>
            )}
            {businessSettings?.email && (
              <Text>Correo: {businessSettings.email}</Text>
            )}
            {businessSettings?.fiscal_address && (
              <Text>Ubicación: {businessSettings.fiscal_address}</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
