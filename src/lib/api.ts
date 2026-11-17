const API_HOST = import.meta.env.VITE_API_HOST || "http://127.0.0.1:8000";
const API_BASE = import.meta.env.VITE_API_BASE || `${API_HOST}/api`;

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;
}

export type ApiHero = {
  id: number;
  eyebrow?: string | null;
  headline_line_1?: string | null;
  headline_line_2?: string | null;
  supporting_text?: string | null;
  supporting_text_strong?: string | null;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_url?: string | null;
  background_image_url?: string | null;
  figcaption?: string | null;
  reasons?: { text: string }[];
  ways?: {
    label_key: string;
    label_value: string;
    link_url?: string | null;
    is_accent?: boolean;
  }[];
};

export type ApiSeo = {
  defaults: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  schemas: { schema_type: string; json_ld: Record<string, unknown> }[];
};

export async function fetchActiveHero(): Promise<ApiHero | null> {
  try {
    const res = await fetch(`${API_BASE}/hero/public`);
    if (!res.ok) return null;
    return (await res.json()) as ApiHero;
  } catch {
    return null;
  }
}

export async function fetchSeo(route = "home"): Promise<ApiSeo | null> {
  try {
    const res = await fetch(`${API_BASE}/seo/public?route=${encodeURIComponent(route)}`);
    if (!res.ok) return null;
    return (await res.json()) as ApiSeo;
  } catch {
    return null;
  }
}
