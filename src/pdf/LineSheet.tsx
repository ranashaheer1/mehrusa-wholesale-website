import { Document, Page, Path, Svg, StyleSheet, Text, View } from "@react-pdf/renderer";
import { terms, site, isConfirmed } from "@/config/terms";
import type { ResolvedLine } from "@/lib/message";
import { variantLabel } from "@/lib/message";
import { fmtNum, fmtPKR } from "@/lib/pricing";
import type { Buyer } from "@/store/list";

const C = { night: "#0F1938", pearl: "#F4F0E6", gold: "#C7A04D", goldDeep: "#816529", rule: "#D6CCB4" };

const s = StyleSheet.create({
  page: { backgroundColor: C.pearl, color: C.night, fontFamily: "Helvetica", fontSize: 9.5, paddingBottom: 60 },
  header: { backgroundColor: C.night, color: C.pearl, padding: 28, flexDirection: "row", alignItems: "center", gap: 14 },
  word: { fontSize: 15, letterSpacing: 3 },
  sub: { color: C.gold, fontSize: 9, marginTop: 4, letterSpacing: 1 },
  body: { paddingHorizontal: 28, paddingTop: 20 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 16 },
  label: { color: C.goldDeep, fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
  row: { flexDirection: "row", borderBottomWidth: 0.75, borderBottomColor: C.rule, paddingVertical: 7 },
  th: { borderBottomColor: C.night, borderBottomWidth: 1 },
  c1: { width: "14%" }, c2: { width: "30%" }, c3: { width: "20%" }, c4: { width: "8%", textAlign: "right" }, c5: { width: "14%", textAlign: "right" }, c6: { width: "14%", textAlign: "right" },
  total: { flexDirection: "row", justifyContent: "flex-end", gap: 28, marginTop: 12 },
  note: { marginTop: 18, padding: 10, borderWidth: 0.75, borderColor: C.gold },
  footer: { position: "absolute", bottom: 20, left: 28, right: 28, fontSize: 7.5, color: C.night, borderTopWidth: 0.75, borderTopColor: C.gold, paddingTop: 8 },
});

const tv = (v: string) => (isConfirmed(v) ? v : "To be confirmed");

export function LineSheet({ lines, buyer, totals }: { lines: ResolvedLine[]; buyer: Buyer; totals: { units: number; subtotal: number | null } }) {
  return (
    <Document title="Mehrusa wholesale line sheet" author="Mehrusa">
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {/* Supplied mark paths, unchanged */}
          <Svg width={30} height={30} viewBox="0 0 691 692">
            <Path d="M0 345.821L172.75 173.139V518.571L0 345.821Z" fill={C.pearl} />
            <Path d="M691 345.821L518.25 518.571V173.139L691 345.821Z" fill={C.pearl} />
            <Path d="M345.507 0.000205126L215.779 129.728L345.507 259.455L475.234 129.727L345.507 0.000205126Z" fill={C.pearl} />
            <Path d="M432.078 432.061L345.5 345.482L258.922 432.061L259.125 432.196H258.922L345.5 691.321L432.078 432.196H431.875L432.078 432.061Z" fill={C.pearl} />
            <Path d="M172.75 259.514L311.465 379.449L345.5 345.482L172.75 173.139V259.514Z" fill={C.pearl} />
            <Path d="M345.5 345.482L379.535 379.449L518.25 259.514V173.139L345.5 345.482Z" fill={C.pearl} />
          </Svg>
          <View>
            <Text style={s.word}>MEHRUSA</Text>
            <Text style={s.sub}>WHOLESALE LINE SHEET · {new Date().toLocaleDateString("en-GB")}</Text>
          </View>
        </View>
        <View style={s.body}>
          <View style={s.meta}>
            {[["Business", buyer.business], ["Name", buyer.name], ["City", buyer.city], ["Phone", buyer.phone]].map(([k, v]) => (
              <View key={k}><Text style={s.label}>{k}</Text><Text>{v || "-"}</Text></View>
            ))}
          </View>
          <View style={[s.row, s.th]}>
            <Text style={s.c1}>SKU</Text><Text style={s.c2}>Piece</Text><Text style={s.c3}>Variant</Text><Text style={s.c4}>Qty</Text><Text style={s.c5}>Unit (PKR)</Text><Text style={s.c6}>Total (PKR)</Text>
          </View>
          {lines.map((l) => (
            <View key={l.key} style={s.row} wrap={false}>
              <Text style={s.c1}>{l.product.sku}</Text>
              <Text style={s.c2}>{l.product.name}</Text>
              <Text style={s.c3}>{variantLabel(l)}</Text>
              <Text style={s.c4}>{fmtNum(l.qty)}</Text>
              <Text style={s.c5}>{l.unit === null ? "TBC" : fmtNum(l.unit)}</Text>
              <Text style={s.c6}>{l.total === null ? "TBC" : fmtNum(l.total)}</Text>
            </View>
          ))}
          <View style={s.total}>
            <Text>Total units: {fmtNum(totals.units)}</Text>
            <Text>Subtotal: {totals.subtotal === null ? "PKR to be confirmed" : fmtPKR(totals.subtotal)}</Text>
          </View>
          {buyer.notes ? <View style={{ marginTop: 14 }}><Text style={s.label}>Notes</Text><Text>{buyer.notes}</Text></View> : null}
          <View style={s.note}>
            <Text>This is an enquiry, not a payment. We confirm availability, shipping and final price on WhatsApp.</Text>
          </View>
        </View>
        <View style={s.footer} fixed>
          <Text>Payment: {tv(terms.paymentTerms)} · Lead time: {tv(terms.leadTime)} · Shipping: {tv(terms.shipping)}</Text>
          <Text style={{ marginTop: 3 }}>WhatsApp: {tv(terms.whatsappNumber)} · Email: {tv(terms.email)} · {site.signOff}</Text>
        </View>
      </Page>
    </Document>
  );
}
