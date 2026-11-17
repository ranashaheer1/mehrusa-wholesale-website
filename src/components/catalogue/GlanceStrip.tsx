import { Link } from "react-router-dom";
import { Box, Layers, Truck, Wallet } from "lucide-react";
import { terms } from "@/config/terms";
import { Val } from "../ui/bits";
import { cn } from "@/utils/cn";

/** The four numbers a buyer looks for first. Values come only from config/terms.ts. */
export function GlanceStrip({ tone = "light" }: { tone?: "light" | "night" }) {
  const items = [
    { icon: Box, label: "Minimum", v: terms.moqRule, fb: "Per piece" },
    { icon: Layers, label: "Price tiers", v: terms.tierNote, fb: "Lower unit price at volume" },
    { icon: Truck, label: "Dispatch", v: terms.leadTime, fb: "Lead time" },
    { icon: Wallet, label: "Payment", v: terms.paymentTerms, fb: "Agreed on WhatsApp" },
  ];
  return (
    <aside aria-label="Wholesale at a glance" className={cn(tone === "night" ? "surface-night" : "surface-light", "border-b rule")}>
      <div className="container-x">
        <ul className="no-scrollbar -mx-4 flex snap-x overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-[repeat(4,1fr)_auto] lg:px-0">
          {items.map(({ icon: Icon, label, v, fb }) => (
            <li key={label} className="flex min-w-[220px] snap-start items-center gap-3 border-r rule py-4 pr-5 [&:not(:first-child)]:pl-5">
              <Icon size={20} strokeWidth={1.25} className="shrink-0 text-accent" aria-hidden />
              <span className="min-w-0 text-[0.875rem] leading-snug">
                <span className="block font-medium">{label}</span>
                <span className="block opacity-80"><Val v={v} fallback={fb} /></span>
              </span>
            </li>
          ))}
          <li className="flex shrink-0 items-center py-4 pl-5">
            <Link to="/terms" className="link whitespace-nowrap text-[0.875rem]">All terms</Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
