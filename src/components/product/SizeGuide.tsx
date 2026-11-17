import { useState } from "react";
import { Ruler } from "lucide-react";
import { Dialog } from "../ui/overlays";
import { Confirm } from "../ui/bits";

/** Standard US ring size reference (internal diameter). General conversion, not a Mehrusa claim. */
const RINGS = [
  { us: "6", d: 16.5, c: 51.9 },
  { us: "7", d: 17.3, c: 54.4 },
  { us: "8", d: 18.1, c: 57.0 },
  { us: "9", d: 18.9, c: 59.5 },
];

const LENGTHS = [
  { cm: 40, where: "Sits close, at the base of the neck" },
  { cm: 45, where: "Falls just below the collarbone" },
];

export function SizeGuide({ kind }: { kind: "ring" | "length" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="link inline-flex min-h-11 items-center gap-1.5 text-[0.875rem]">
        <Ruler size={15} strokeWidth={1.4} aria-hidden /> Size guide
      </button>
      <Dialog open={open} onOpenChange={setOpen} title={kind === "ring" ? "Ring sizes" : "Chain lengths"} description={kind === "ring" ? "A standard US size chart, so you can guide your own customers." : "Where each length usually sits. Drawn to scale."}>
        {kind === "ring" ? (
          <div>
            <table className="num w-full border-collapse text-left text-[0.9375rem]">
              <caption className="sr-only">Ring size conversions</caption>
              <thead><tr className="border-b border-current"><th className="py-2 font-medium">Size</th><th className="py-2 font-medium">Inside diameter</th><th className="py-2 font-medium">Circumference</th><th className="py-2"><span className="sr-only">Actual size</span></th></tr></thead>
              <tbody>
                {RINGS.map((r) => (
                  <tr key={r.us} className="border-b rule">
                    <td className="py-2">US {r.us}</td>
                    <td className="py-2">{r.d} mm</td>
                    <td className="py-2">{r.c} mm</td>
                    <td className="py-2">
                      {/* Approximate true size on most screens: 1mm ≈ 3.78 CSS px */}
                      <span className="true-round block border border-gold-deep" style={{ width: r.d * 2, height: r.d * 2 }} aria-hidden />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[0.8125rem] opacity-80">Tip for your customers: measure the inside of a ring that already fits and match the diameter. Mehrusa size system <Confirm />.</p>
          </div>
        ) : (
          <div>
            <svg viewBox="0 0 240 180" className="w-full" role="img" aria-label="Diagram: 40 cm sits at the base of the neck, 45 cm just below the collarbone">
              <path d="M70 10 C70 50 60 60 20 80 M170 10 C170 50 180 60 220 80" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
              <path d="M55 70 Q120 92 185 70" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M72 46 Q120 96 168 46" fill="none" stroke="#816529" strokeWidth="1.5" />
              <path d="M66 52 Q120 124 174 52" fill="none" stroke="#C7A04D" strokeWidth="1.5" />
              <text x="120" y="90" textAnchor="middle" fontSize="9" fill="currentColor">40 cm</text>
              <text x="120" y="120" textAnchor="middle" fontSize="9" fill="currentColor">45 cm</text>
              <text x="200" y="76" fontSize="8" fill="currentColor" opacity="0.6">collarbone</text>
            </svg>
            <ul className="mt-3 space-y-1 text-[0.9375rem]">
              {LENGTHS.map((l) => <li key={l.cm} className="num"><span className="font-medium">{l.cm} cm:</span> {l.where}</li>)}
            </ul>
            <p className="mt-3 text-[0.8125rem] opacity-80">Exact chain lengths and extenders <Confirm />.</p>
          </div>
        )}
      </Dialog>
    </>
  );
}
