import React, { lazy, Suspense } from "react";

const FuseMonacoCodeField = lazy(() => import("./FuseMonacoCodeField"));

const MonacoCodeFieldFallback = () => (
  <div
    className="rounded-lg border border-ink-200 dark:border-void-775 bg-ink-50 dark:bg-void-875
      animate-pulse h-[120px] flex items-center justify-center text-[12px] text-ink-500 dark:text-ink-550"
  >
    Loading…
  </div>
);

/**
 * Code-split wrapper — Monaco loads only when a monaco_code field is shown.
 */
export default function LazyFuseMonacoCodeField(props) {
  return (
    <Suspense fallback={<MonacoCodeFieldFallback />}>
      <FuseMonacoCodeField {...props} />
    </Suspense>
  );
}
