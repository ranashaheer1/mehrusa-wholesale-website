import * as RDialog from "@radix-ui/react-dialog";
import * as RAccordion from "@radix-ui/react-accordion";
import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

/** Brand-restyled Radix dialog: 0 radius, 1px rule, pearl surface, focus trapped and restored. */
export function Dialog({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode }) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[80] bg-night-deep/60 data-[state=open]:animate-[fadeIn_382ms_var(--ease)]" />
        <RDialog.Content className="surface-light fixed left-1/2 top-1/2 z-[81] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 border hairline-gold p-6 lg:p-8">
          <RDialog.Title className="font-display text-h4">{title}</RDialog.Title>
          {description && <RDialog.Description className="mt-2 opacity-85">{description}</RDialog.Description>}
          <div className="mt-6">{children}</div>
          <RDialog.Close className="absolute right-2 top-2 grid h-11 w-11 place-items-center" aria-label="Close">
            <X size={18} strokeWidth={1.5} aria-hidden />
          </RDialog.Close>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description: string; confirmLabel: string; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>Keep my list</Button>
      </div>
    </Dialog>
  );
}

export function Accordion({ items, type = "multiple", defaultOpen }: { items: { id: string; title: ReactNode; body: ReactNode }[]; type?: "single" | "multiple"; defaultOpen?: string[] }) {
  const inner = items.map((it) => (
    <RAccordion.Item key={it.id} value={it.id} className="border-b rule">
      <RAccordion.Header>
        <RAccordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left font-medium">
          <span>{it.title}</span>
          <Plus size={18} strokeWidth={1.25} aria-hidden className="shrink-0 transition-transform duration-[382ms] ease-[var(--ease)] group-data-[state=open]:rotate-45" />
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content className={cn("overflow-hidden data-[state=closed]:animate-[accUp_382ms_var(--ease)] data-[state=open]:animate-[accDown_382ms_var(--ease)]")}>
        <div className="pb-5 pr-6 opacity-90">{it.body}</div>
      </RAccordion.Content>
    </RAccordion.Item>
  ));
  return type === "single" ? (
    <RAccordion.Root type="single" collapsible defaultValue={defaultOpen?.[0]} className="border-t rule">{inner}</RAccordion.Root>
  ) : (
    <RAccordion.Root type="multiple" defaultValue={defaultOpen} className="border-t rule">{inner}</RAccordion.Root>
  );
}
