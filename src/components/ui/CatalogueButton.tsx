import { useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { downloadCatalogue } from "@/lib/export";
import { cn } from "@/utils/cn";

export function CatalogueButton({ className, label = "Download the full catalogue (PDF)" }: { className?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      aria-busy={busy}
      onClick={async () => {
        setBusy(true);
        try { await downloadCatalogue(); toast("Catalogue downloaded."); } catch { toast("The catalogue could not be made. Please try again."); } finally { setBusy(false); }
      }}
      className={cn("link inline-flex min-h-11 items-center gap-2 text-[0.9375rem] disabled:opacity-60", className)}
    >
      <BookOpen size={16} strokeWidth={1.4} aria-hidden /> {busy ? "Preparing the catalogue..." : label}
    </button>
  );
}
