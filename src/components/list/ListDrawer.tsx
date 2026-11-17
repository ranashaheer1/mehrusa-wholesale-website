import { Drawer } from "vaul";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useListCount, useUI } from "@/store/list";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ButtonLink } from "../ui/Button";
import { ListActions, ListLines, ListSummary } from "./ListContent";
import { fmtNum } from "@/lib/pricing";

/** Slide-over on desktop, bottom sheet on phones. Focus is trapped and restored by Vaul/Radix. */
export function ListDrawer() {
  const open = useUI((s) => s.listOpen);
  const setOpen = useUI((s) => s.setListOpen);
  const count = useListCount();
  const desktop = useMediaQuery("(min-width: 64rem)");
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname, setOpen]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction={desktop ? "right" : "bottom"}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-night-deep/60" />
        <Drawer.Content
          className={
            desktop
              ? "surface-light fixed bottom-0 right-0 top-0 z-[61] flex w-[440px] flex-col border-l hairline-gold outline-none"
              : "surface-light fixed inset-x-0 bottom-0 z-[61] flex max-h-[92dvh] flex-col border-t hairline-gold outline-none"
          }
          aria-describedby={undefined}
        >
          {!desktop && <div className="mx-auto mt-3 h-1 w-12 bg-night/25" aria-hidden />}
          <div className="flex items-center justify-between border-b rule px-5 py-3">
            <Drawer.Title className="font-display text-h4">My list <span className="num text-[1rem] text-gold-deep">({fmtNum(count)})</span></Drawer.Title>
            <Drawer.Close className="grid h-11 w-11 place-items-center" aria-label="Close list"><X size={20} strokeWidth={1.4} aria-hidden /></Drawer.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5" data-vaul-no-drag>
            <ListLines compact onNavigate={() => setOpen(false)} />
          </div>
          {count > 0 && (
            <div className="space-y-4 border-t rule px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
              <ListSummary />
              <ButtonLink to="/list" className="w-full" onClick={() => setOpen(false)}>Review and send</ButtonLink>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export { ListActions };
