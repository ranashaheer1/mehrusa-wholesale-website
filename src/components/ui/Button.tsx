import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Common = { variant?: Variant; size?: "md" | "sm"; className?: string; children: ReactNode };

const CH = 12;

/** Chamfered 1px frame + gold hairline that travels the chamfer on hover. */
function Frame() {
  const ref = useRef<SVGSVGElement>(null);
  const [s, setS] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const update = () => setS({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = s;
  const d = w && h ? `M0.5 0.5 H${w - CH} L${w - 0.5} ${CH} V${h - 0.5} H0.5 Z` : "";
  const trail = w && h ? `M${w * 0.55} 0.5 H${w - CH} L${w - 0.5} ${CH} V${h * 0.75}` : "";
  return (
    <svg ref={ref} className="btn-frame" width={w} height={h} aria-hidden="true" focusable="false">
      {d && <path d={d} className="btn-fill btn-edge" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
      {trail && <path d={trail} className="btn-trail" fill="none" strokeWidth="1.25" pathLength={100} />}
    </svg>
  );
}

const classes = (variant: Variant, size: "md" | "sm", className?: string) =>
  cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className);

export const Button = forwardRef<HTMLButtonElement, Common & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ variant = "primary", size = "md", className, children, type = "button", ...rest }, ref) => (
    <button ref={ref} type={type} className={classes(variant, size, className)} {...rest}>
      <Frame />
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function ButtonLink({ variant = "primary", size = "md", className, children, ...rest }: Common & LinkProps) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      <Frame />
      {children}
    </Link>
  );
}

export function ButtonA({ variant = "primary", size = "md", className, children, ...rest }: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={classes(variant, size, className)} {...rest}>
      <Frame />
      {children}
    </a>
  );
}
