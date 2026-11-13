import React, { lazy, Suspense } from "react";

const FuseMonacoCodeField = lazy(() => import("./FuseMonacoCodeField"));

const MonacoCodeFieldFallback = ({ height = 280 }) => (
  <div
    className="rounded-lg border border-ink-200 dark:border-void-775 bg-ink-50 dark:bg-void-875
      animate-pulse flex items-center justify-center text-[12px] text-ink-500 dark:text-ink-550"
    style={{ height }}
  >
    Loading editor…
  </div>
);

/**
 * Code-split wrapper — Monaco loads only when a monaco_code field is shown.
 */
export default function LazyFuseMonacoCodeField(props) {
  const height = Number(props.field?.editorHeight) > 0 ? Number(props.field.editorHeight) : 280;
  return (
    <Suspense fallback={<MonacoCodeFieldFallback height={height} />}>
      <FuseMonacoCodeField {...props} />
    </Suspense>
  );
}
