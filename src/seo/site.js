/** Public production origin — no trailing slash. Used for canonical URLs and sitemap generation. */
export const SITE_ORIGIN =
  process.env.REACT_APP_SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://comet-hypen-ai.netlify.app";

export const SITE_NAME = "Comet AI";

export const DEFAULT_DESCRIPTION =
  "Comet AI is an all-in-one AI platform to chat with AI, automate workflows, connect MCP servers and tools, and build AI-powered applications.";

export const absoluteUrl = (pathname = "/") => {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN.replace(/\/$/, "")}${path}`;
};
