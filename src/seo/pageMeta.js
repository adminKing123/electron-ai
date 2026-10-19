import { DEFAULT_DESCRIPTION, SITE_NAME } from "./site";

const chatTitle = `AI Chat | ${SITE_NAME}`;
const chatDescription =
  "Start a new conversation with Comet AI models for writing, coding, research, and more.";

/** @typedef {{ title: string, description: string, robots?: string, pathname?: string }} PageSeoMeta */

/** @type {Array<{ test: (pathname: string) => boolean, meta: PageSeoMeta }>} */
const ROUTE_META = [
  {
    test: (p) => p === "/",
    meta: {
      title: `${SITE_NAME} – AI Chat, Workflow Automation, MCP & App Builder`,
      description: DEFAULT_DESCRIPTION,
    },
  },
  {
    test: (p) => p === "/auth",
    meta: {
      title: `Sign in | ${SITE_NAME}`,
      description: `Sign in to ${SITE_NAME} to access your workspace, chats, and personal AI assistant.`,
    },
  },
  {
    test: (p) => p.startsWith("/c/"),
    meta: {
      title: chatTitle,
      description: chatDescription,
      robots: "noindex, nofollow",
    },
  },
  {
    test: (p) => p === "/library",
    meta: {
      title: `Library | ${SITE_NAME}`,
      description: "Your files, apps, usage analytics, and Comet AI shortcuts in one place.",
    },
  },
  {
    test: (p) => p === "/analytics",
    meta: {
      title: `Usage Analytics | ${SITE_NAME}`,
      description: "Track token usage and model activity across your Comet AI workspace.",
    },
  },
  {
    test: (p) => p === "/aura-rj",
    meta: {
      title: `Comet RJ – AI Radio | ${SITE_NAME}`,
      description: "Listen to Comet RJ, an AI-driven radio experience powered by Comet AI.",
    },
  },
  {
    test: (p) => p === "/fuse/discover",
    meta: {
      title: `Comet Fuse – Discover Workflows | ${SITE_NAME}`,
      description: "Discover and automate tasks with Comet Fuse workflow templates and AI routing.",
    },
  },
  {
    test: (p) => p === "/fuse/listing",
    meta: {
      title: `My Workflows | Comet Fuse | ${SITE_NAME}`,
      description: "Browse and manage your Comet Fuse automation workflows.",
      robots: "noindex, nofollow",
    },
  },
  {
    test: (p) => p === "/fuse/integrations",
    meta: {
      title: `Integrations | Comet Fuse | ${SITE_NAME}`,
      description: "Connect apps and MCP tools to Comet Fuse workflows.",
    },
  },
  {
    test: (p) => p.startsWith("/fuse/studio/") || p.startsWith("/fuse/runs/"),
    meta: {
      title: `Workflow Studio | Comet Fuse | ${SITE_NAME}`,
      description: "Build and run Comet Fuse automation workflows.",
      robots: "noindex, nofollow",
    },
  },
];

/** @param {string} pathname */
export const resolvePageMeta = (pathname) => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = ROUTE_META.find(({ test }) => test(normalized));
  const base = match?.meta ?? {
    title: `${SITE_NAME} – Your All-in-One AI Platform`,
    description: DEFAULT_DESCRIPTION,
  };
  return {
    ...base,
    pathname: normalized,
    robots: base.robots ?? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  };
};
