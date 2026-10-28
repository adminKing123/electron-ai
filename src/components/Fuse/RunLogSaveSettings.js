import React from "react";
import Switch from "../Common/Switch";
import { fuseRunLogSaveEnabled } from "../../utils/fuseNodeConfig";

const ROWS = [
  {
    key: "save_output",
    label: "Output",
    description: "Result of this step",
  },
  {
    key: "save_input",
    label: "Input",
    description: "Data from earlier steps",
  },
  {
    key: "save_config",
    label: "Config",
    description: "Settings when the step ran",
  },
  {
    key: "save_variables",
    label: "Variables",
    description: "Resolved values from your config",
  },
];

/**
 * Per-node toggles for what gets stored in run history (Firestore).
 * Workflow execution is unchanged when a toggle is off.
 */
const RunLogSaveSettings = ({ config, onChange }) => (
  <section className="mt-6 pt-5 pb-2 border-t border-ink-100 dark:border-void-800">
    <div className="px-0.5 mb-3.5">
      <h3 className="text-[13px] font-semibold text-ink-875 dark:text-ink-100">
        Run history
      </h3>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-600 dark:text-ink-450">
        Choose what to save when this step runs. The workflow always runs the same; only
        what appears in past runs changes.
      </p>
    </div>

    <ul
      className="rounded-xl border border-ink-100 dark:border-void-800
        bg-ink-25 dark:bg-void-850 divide-y divide-ink-100 dark:divide-void-800
        overflow-hidden"
    >
      {ROWS.map(({ key, label, description }) => {
        const switchId = `fuse-run-log-${key}`;
        const enabled = fuseRunLogSaveEnabled(config, key);

        return (
          <li key={key}>
            <div className="flex items-start justify-between gap-4 px-3.5 py-3">
              <label htmlFor={switchId} className="min-w-0 flex-1 cursor-pointer select-none pt-0.5">
                <span className="block text-[13px] font-medium leading-tight text-ink-875 dark:text-ink-100">
                  {label}
                </span>
                <span className="block text-[12px] leading-snug text-ink-600 dark:text-ink-450 mt-0.5">
                  {description}
                </span>
              </label>
              {/* Fixed slot so every row’s switch aligns in one column */}
              <div className="flex h-6 w-11 shrink-0 items-center justify-center pt-0.5">
                <Switch
                  id={switchId}
                  checked={enabled}
                  onCheckedChange={(next) =>
                    onChange({ ...(config ?? {}), [key]: next })
                  }
                  aria-label={`Save ${label.toLowerCase()} in run history`}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);

export default RunLogSaveSettings;
