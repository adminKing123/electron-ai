import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { absoluteUrl, SITE_NAME } from "./site";
import { resolvePageMeta } from "./pageMeta";

const upsertMeta = (selector, createAttrs, content) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(createAttrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/** Updates document title and head tags when the route changes (SPA SEO). */
export const usePageSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolvePageMeta(pathname);
    const url = absoluteUrl(meta.pathname ?? pathname);

    document.title = meta.title;

    upsertMeta('meta[name="description"]', { name: "description" }, meta.description);
    upsertMeta('meta[name="robots"]', { name: "robots" }, meta.robots);
    upsertLink("canonical", url);

    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    upsertMeta('meta[property="og:title"]', { property: "og:title" }, meta.title);
    upsertMeta('meta[property="og:description"]', { property: "og:description" }, meta.description);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }, url);

    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, meta.title);
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, meta.description);
  }, [pathname]);
};

export default function PageSeo() {
  usePageSeo();
  return null;
}
