import React, { lazy, Suspense } from "react";
import { BasicLoader } from "../Loaders";

const FuseMonacoCodeField = lazy(() => import("./FuseMonacoCodeField"));

const MonacoCodeFieldFallback = () => (
  <div
    className="rounded-lg border border-ink-200 dark:border-void-775 bg-ink-50 dark:bg-void-850
      h-[120px] flex items-center justify-center"
  >
    <BasicLoader />
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
