import { Document, Page, Path, Svg, StyleSheet, Text, View } from "@react-pdf/renderer";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { isConfirmed, site, terms } from "@/config/terms";
import { fmtPKR, orderAxis } from "@/lib/pricing";

const C = { night: "#0F1938", deep: "#091023", pearl: "#F4F0E6", gold: "#C7A04D", goldDeep: "#816529", rule: "#D6CCB4" };

const s = StyleSheet.create({
  cover: { backgroundColor: C.deep, color: C.pearl, padding: 56, justifyContent: "center", alignItems: "center" },
  word: { fontSize: 26, letterSpacing: 8, marginTop: 28 },
  tag: { fontSize: 13, color: C.gold, marginTop: 14, fontFamily: "Times-Italic" },
  coverNote: { position: "absolute", bottom: 48, left: 56, right: 56, fontSize: 8.5, textAlign: "center", color: C.pearl, opacity: 0.8 },
  page: { backgroundColor: C.pearl, color: C.night, fontFamily: "Helvetica", fontSize: 8.5, padding: 36, paddingBottom: 56 },
  head: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.75, borderBottomColor: C.gold, paddingBottom: 8, marginBottom: 14 },
  cat: { fontSize: 15, marginTop: 10, marginBottom: 2 },
  intro: { fontSize: 8.5, color: C.night, opacity: 0.8, marginBottom: 8 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.rule, paddingVertical: 5 },
  th: { borderBottomColor: C.night, borderBottomWidth: 0.9, fontFamily: "Helvetica-Bold" },
  c1: { width: "12%" }, c2: { width: "26%" }, c3: { width: "18%" }, c4: { width: "14%" }, c5: { width: "8%" }, c6: { width: "22%" },
  footer: { position: "absolute", bottom: 22, left: 36, right: 36, fontSize: 7, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: C.gold, paddingTop: 6 },
});

const markPaths = [
  "M0 345.821L172.75 173.139V518.571L0 345.821Z",
  "M691 345.821L518.25 518.571V173.139L691 345.821Z",
  "M345.507 0.000205126L215.779 129.728L345.507 259.455L475.234 129.727L345.507 0.000205126Z",
  "M432.078 432.061L345.5 345.482L258.922 432.061L259.125 432.196H258.922L345.5 691.321L432.078 432.196H431.875L432.078 432.061Z",
  "M172.75 259.514L311.465 379.449L345.5 345.482L172.75 173.139V259.514Z",
  "M345.5 345.482L379.535 379.449L518.25 259.514V173.139L345.5 345.482Z",
];

const tv = (v: string) => (isConfirmed(v) ? v : "To be confirmed");

export function Catalogue() {
  const live = categories.filter((c) => c.status === "live");
  const date = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return (
    <Document title="Mehrusa wholesale catalogue" author="Mehrusa">
      <Page size="A4" style={s.cover}>
        <Svg width={90} height={90} viewBox="0 0 691 692">{markPaths.map((d) => <Path key={d} d={d} fill={C.gold} />)}</Svg>
        <Text style={s.word}>MEHRUSA</Text>
        <Text style={s.tag}>{site.tagline}</Text>
        <Text style={{ fontSize: 10, marginTop: 36, letterSpacing: 2 }}>WHOLESALE CATALOGUE · {date.toUpperCase()}</Text>
        <Text style={s.coverNote}>Stainless steel jewellery. Not gold, not precious metal. Prices, minimums and measurements marked "to be confirmed" are still being finalised. {site.signOff}</Text>
      </Page>
      <Page size="A4" style={s.page} wrap>
        <View style={s.head} fixed>
          <Text style={{ letterSpacing: 3 }}>MEHRUSA · WHOLESALE</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 9 }}>Minimum: {tv(terms.moqRule)} · Payment: {tv(terms.paymentTerms)} · Lead time: {tv(terms.leadTime)}</Text>
          <Text style={{ fontSize: 8, marginTop: 3, opacity: 0.8 }}>To order: build a list on the website, or send SKUs and quantities on WhatsApp ({tv(terms.whatsappNumber)}).</Text>
        </View>
        {live.map((c) => (
          <View key={c.slug} wrap={false} style={{ marginBottom: 6 }}>
            <Text style={s.cat}>{c.name.en}</Text>
            <Text style={s.intro}>{c.intro}</Text>
            <View style={[s.row, s.th]}>
              <Text style={s.c1}>SKU</Text><Text style={s.c2}>Piece</Text><Text style={s.c3}>Colours</Text><Text style={s.c4}>Sizes</Text><Text style={s.c5}>MOQ</Text><Text style={s.c6}>Unit price by quantity</Text>
            </View>
            {products.filter((p) => p.categorySlug === c.slug).map((p) => (
              <View key={p.id} style={s.row}>
                <Text style={s.c1}>{p.sku}</Text>
                <Text style={s.c2}>{p.name}{p.wholesale.inStock === "made-to-order" ? " (made to order)" : ""}</Text>
                <Text style={s.c3}>{p.colours.map((x) => x.name).join(", ")}</Text>
                <Text style={s.c4}>{orderAxis(p).options.join(", ")}</Text>
                <Text style={s.c5}>{p.wholesale.minOrderQty}</Text>
                <Text style={s.c6}>{p.wholesale.tiers.map((t) => `${t.minQty}+ ${t.pricePKR === null ? "TBC" : fmtPKR(t.pricePKR)}`).join(" · ")}</Text>
              </View>
            ))}
          </View>
        ))}
        <View style={s.footer} fixed>
          <Text>{site.signOff}</Text>
          <Text>Placeholder catalogue. Photos, measurements and prices to follow.</Text>
        </View>
      </Page>
    </Document>
  );
}
